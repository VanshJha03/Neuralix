import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'standardwebhooks';
import { createServerSupabase, upsertRow } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.DODO_WEBHOOK_SECRET;
  if (!webhookSecret) return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });

  try {
    const wh = new Webhook(webhookSecret);
    const rawBody = await req.text();
    const webhookHeaders = {
      'webhook-id': req.headers.get('webhook-id') || '',
      'webhook-signature': req.headers.get('webhook-signature') || '',
      'webhook-timestamp': req.headers.get('webhook-timestamp') || '',
    };

    await wh.verify(rawBody, webhookHeaders);
    const payload = JSON.parse(rawBody);
    const { type: eventType, data } = payload;
    const sb = createServerSupabase();

    if (eventType === 'payment.succeeded' || eventType === 'subscription.active') {
      const userId = data?.metadata?.user_id;
      const tier = data?.metadata?.tier;
      if (userId && tier) {
        await upsertRow(sb, userId, { tier });
        console.log(`✅ Tier upgraded: ${userId} → ${tier}`);
      }
    }

    if (eventType === 'subscription.cancelled' || eventType === 'subscription.expired') {
      console.log(`⚠️ Subscription ended for: ${data?.metadata?.user_id}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 });
  }
}
