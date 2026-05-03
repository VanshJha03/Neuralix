import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'standardwebhooks';
import { createServerSupabase, upsertRow } from '@/lib/supabase-server';

// Map Dodo product IDs → internal tier strings
const PRODUCT_TIER_MAP: Record<string, string> = {
  [process.env.DODO_PRODUCT_PRO!]: 'PRO',
  [process.env.DODO_PRODUCT_LTD!]: 'LTD',
};

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('❌ DODO_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const rawBody = await req.text();

  // ── Signature verification ────────────────────────────────────────────────
  // Dodo sends standardwebhooks-style headers (webhook-id, webhook-signature,
  // webhook-timestamp). Verify with the standardwebhooks library.
  try {
    const wh = new Webhook(webhookSecret);
    const webhookHeaders = {
      'webhook-id':        req.headers.get('webhook-id')        || '',
      'webhook-signature': req.headers.get('webhook-signature') || '',
      'webhook-timestamp': req.headers.get('webhook-timestamp') || '',
    };
    await wh.verify(rawBody, webhookHeaders);
  } catch (err: unknown) {
    console.error('❌ Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  // ── Parse payload ─────────────────────────────────────────────────────────
  let payload: { type: string; data: Record<string, any> };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { type: eventType, data } = payload;
  console.log(`🔔 Dodo Webhook → event: ${eventType}`);

  const sb = createServerSupabase();

  // ── Payment succeeded / subscription activated ────────────────────────────
  if (eventType === 'payment.succeeded' || eventType === 'subscription.active') {
    const userId    = data?.metadata?.user_id;
    const productId = data?.product_id ?? data?.items?.[0]?.product_id;

    if (!userId) {
      console.error('❌ Webhook: missing user_id in metadata', data?.metadata);
      return NextResponse.json({ error: 'Missing user_id in metadata' }, { status: 400 });
    }

    // 1️⃣ Prefer tier from metadata (set at checkout time)
    // 2️⃣ Fall back to product_id → tier mapping
    let tier: string | undefined = data?.metadata?.tier;
    if (!tier && productId) {
      tier = PRODUCT_TIER_MAP[productId];
    }

    if (!tier) {
      console.error(
        `❌ Webhook: cannot determine tier. product_id="${productId}", metadata=`,
        data?.metadata,
      );
      // Return 200 so Dodo doesn't keep retrying an event we can't handle
      return NextResponse.json({ received: true, warning: 'tier not determined' });
    }

    try {
      await upsertRow(sb, userId, { tier });
      console.log(`✅ Tier upgraded: user=${userId}  tier=${tier}  event=${eventType}`);
    } catch (err: unknown) {
      console.error('❌ DB upsert failed:', err);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }
  }

  // ── Subscription cancelled / expired → revoke access ─────────────────────
  if (eventType === 'subscription.cancelled' || eventType === 'subscription.expired') {
    const userId = data?.metadata?.user_id;
    if (userId) {
      try {
        // Only revoke monthly PRO subscriptions; LTD is lifetime — never revoke
        const currentTier = (await (async () => {
          const { data: row } = await sb.from('influencers').select('tier').eq('user_id', userId).single();
          return row?.tier as string | undefined;
        })());

        if (currentTier === 'PRO') {
          await upsertRow(sb, userId, { tier: null });
          console.log(`⚠️ PRO subscription revoked: user=${userId}  event=${eventType}`);
        } else {
          console.log(`ℹ️ Subscription event "${eventType}" ignored — user=${userId} tier=${currentTier} (lifetime not revoked)`);
        }
      } catch (err: unknown) {
        console.error('❌ DB revoke failed:', err);
      }
    } else {
      console.warn('⚠️ Subscription cancellation event missing user_id');
    }
  }

  return NextResponse.json({ received: true });
}
