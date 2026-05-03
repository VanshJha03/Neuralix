/**
 * Server-only Supabase client — uses SERVICE ROLE key.
 * Never import this in client components.
 */
import { createClient } from '@supabase/supabase-js';
export function createServerSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// ─── Tier limits ──────────────────────────────────────────────────────────────
export const TIER_LIMITS: Record<string, Record<string, number>> = {
  MONTHLY: { niche: 30, gap: 30, chat: 500,  content: 100, image: 100, trend: 60 },
  YEARLY:  { niche: 30, gap: 30, chat: 500,  content: 100, image: 100, trend: 60 },
  LTD_129: { niche: 60, gap: 60, chat: 1000, content: 200, image: 200, trend: 120 },
  LTD_49:  { niche: 15, gap: 15, chat: 250,  content: 50,  image: 50,  trend: 30 },
  // Backward compatibility
  PRO:     { niche: 30, gap: 30, chat: 500, content: 100, image: 100, trend: 60 },
  LTD:     { niche: 30, gap: 30, chat: 500, content: 100, image: 100, trend: 60 },
  beta:    { niche: 999, gap: 999, chat: 999, content: 999, image: 999, trend: 999 },
};

// ─── Row helpers ──────────────────────────────────────────────────────────────
export async function getRow(supabase: ReturnType<typeof createServerSupabase>, userId: string) {
  const { data } = await supabase.from('influencers').select('*').eq('user_id', userId).single();
  return data;
}

export async function upsertRow(supabase: ReturnType<typeof createServerSupabase>, userId: string, patch: Record<string, unknown>) {
  await supabase.from('influencers').upsert({ user_id: userId, ...patch }, { onConflict: 'user_id' });
}

export async function incrementUsage(supabase: ReturnType<typeof createServerSupabase>, userId: string, field: string) {
  const row = await getRow(supabase, userId);
  const current = (row?.[field] as number) ?? 0;
  await upsertRow(supabase, userId, { [field]: current + 1 });
}

export async function resetIfNewMonth(supabase: ReturnType<typeof createServerSupabase>, userId: string, row: Record<string, unknown> | null) {
  const thisMonth = new Date().toISOString().substring(0, 7);
  if (!row || row.last_reset !== thisMonth) {
    await upsertRow(supabase, userId, {
      niche_count: 0, gap_count: 0, chat_count: 0,
      content_count: 0, image_count: 0, trend_count: 0,
      last_reset: thisMonth,
    });
    return { ...row, niche_count: 0, gap_count: 0, chat_count: 0, content_count: 0, image_count: 0, trend_count: 0 };
  }
  return row;
}

// ─── Auth helper — verifies Bearer token, returns user + row ─────────────────
export async function requireAuth(request: Request) {
  const sb = createServerSupabase();
  const authHeader = request.headers.get('authorization') ?? '';

  if (!authHeader.startsWith('Bearer ')) {
    // No token — dev fallback (works locally without login)
    const devRow: Record<string, unknown> = { tier: 'beta', name: 'Operator', memories: [], interests: [], ideas: [], archive: [] };
    return { userId: 'local-operator-001', email: 'operator@local.dev', tier: 'beta' as string | null, row: devRow, sb };
  }

  const token = authHeader.slice(7);

  // Verify token using the anon client (works without service role for JWT verification)
  const anonSb = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data: { user }, error } = await anonSb.auth.getUser(token);

  if (error || !user) {
    console.error('requireAuth failed:', error?.message);
    return null;
  }

  let row = await getRow(sb, user.id);
  if (!row) {
    // New user — no tier assigned. They must subscribe first.
    await upsertRow(sb, user.id, { tier: null, last_reset: new Date().toISOString().substring(0, 7) });
    row = await getRow(sb, user.id);
  }
  row = await resetIfNewMonth(sb, user.id, row);

  const tier = (row?.tier as string) || null;
  return { userId: user.id, email: user.email!, tier, row, sb };
}

// ─── Limit check helper ───────────────────────────────────────────────────────
export function checkLimit(row: Record<string, unknown> | null, tier: string | null, field: string): string | null {
  // No subscription — block everything
  if (!tier || !TIER_LIMITS[tier]) {
    return `NO_SUBSCRIPTION: You need an active PRO or LTD subscription to use this feature.`;
  }
  const limits = TIER_LIMITS[tier];
  const current = (row?.[`${field}_count`] as number) ?? 0;
  const limit = limits[field] ?? 0;
  if (current >= limit) {
    return `NEURAL LIMIT: ${tier} plan — ${field} limit (${limit}/month) reached. Upgrade to continue.`;
  }
  return null;
}
