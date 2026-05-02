
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase Admin (Service Role)
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    const body = await req.text();
    const signature = req.headers.get('x-dodo-signature');
    const secret = process.env.DODO_WEBHOOK_SECRET;

    // 1. Verify Webhook Signature
    if (secret && signature) {
        const hmac = crypto.createHmac('sha256', secret);
        const digest = hmac.update(body).digest('hex');
        if (digest !== signature) {
            console.error('❌ Dodo Webhook: Invalid Signature');
            return NextResponse.json({ error: 'Invalid Signature' }, { status: 401 });
        }
    }

    const event = JSON.parse(body);
    console.log('🔔 Dodo Webhook Received:', event.type);

    // 2. Handle Successful Payment
    if (event.type === 'payment.succeeded' || event.type === 'subscription.active') {
        const payload = event.data;
        const userId = payload.metadata?.user_id;
        const productId = payload.product_id;

        if (!userId) {
            console.error('❌ Dodo Webhook: No user_id in metadata');
            return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
        }

        // Determine Tier
        let tier = 'Free';
        if (productId === process.env.DODO_PRODUCT_PRO) tier = 'PRO';
        if (productId === process.env.DODO_PRODUCT_LTD) tier = 'LTD';

        console.log(`🚀 Upgrading User ${userId} to Tier: ${tier}`);

        try {
            // Update Supabase influencers table
            const { error: sbError } = await supabaseAdmin
                .from('influencers')
                .update({ tier })
                .eq('user_id', userId);
            
            if (sbError) throw sbError;

            return NextResponse.json({ success: true, tier });
        } catch (error: any) {
            console.error('❌ Webhook Processing Error:', error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
