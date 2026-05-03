import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, upsertRow, getRow } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { userId, email, tier, row, sb } = auth;

  let r = row ?? await getRow(sb, userId);
  if (!r) { await upsertRow(sb, userId, {}); r = await getRow(sb, userId); }

  return NextResponse.json({
    name: r.name || 'Operator',
    handle: r.handle || 'neural_link',
    avatarColor: r.avatar_color || '#ffffff',
    customSystemPrompt: r.custom_system_prompt,
    xPostImages: r.x_post_images !== false,
    xThreadImages: r.x_thread_images !== false,
    tier: r.tier ?? null,
    styles: r.styles || [],
    email,
    usage: {
      analytics: r.niche_count || 0, totalAnalytics: r.niche_count || 0,
      content: r.content_count || 0, totalContent: r.content_count || 0,
      image: r.image_count || 0, gap: r.gap_count || 0, chat: r.chat_count || 0,
    },
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { name, handle, avatarColor, customSystemPrompt, xPostImages, xThreadImages, tier, styles } = body;
  const patch: Record<string, unknown> = {};
  if (name !== undefined) patch.name = name;
  if (handle !== undefined) patch.handle = handle;
  if (avatarColor !== undefined) patch.avatar_color = avatarColor;
  if (customSystemPrompt !== undefined) patch.custom_system_prompt = customSystemPrompt;
  if (xPostImages !== undefined) patch.x_post_images = xPostImages;
  if (xThreadImages !== undefined) patch.x_thread_images = xThreadImages;
  if (tier !== undefined) patch.tier = tier;
  if (styles !== undefined) patch.styles = styles;
  await upsertRow(auth.sb, auth.userId, patch);
  return NextResponse.json({ success: true });
}
