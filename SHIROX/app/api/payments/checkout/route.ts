import { NextRequest, NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';
import { requireAuth, getRow } from '@/lib/supabase-server';

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment: (process.env.DODO_ENV === 'test' || process.env.DODO_ENV === 'test_mode') ? 'test_mode' : 'live_mode',
});

const PRODUCT_IDS: Record<string, string | undefined> = {
  PRO: process.env.DODO_PRODUCT_PRO,
  LTD: process.env.DODO_PRODUCT_LTD,
};

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth) {
      console.error('Checkout API: Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier } = await req.json();
    console.log(`Checkout API: Initiating session for tier="${tier}" user="${auth.userId}"`);

    const productId = PRODUCT_IDS[tier?.toUpperCase()];
    if (!productId) {
      console.error(`Checkout API: Invalid tier or missing Product ID for "${tier}"`);
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const row = await getRow(auth.sb, auth.userId);
    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: { email: auth.email, name: (row?.name as string) || 'Operator' },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://creatiox.vercel.app'}/payment/success`,
      metadata: { user_id: auth.userId, tier: tier.toUpperCase() },
    });

    console.log(`Checkout API: Session created successfully. URL: ${session.checkout_url}`);
    return NextResponse.json({ checkout_url: session.checkout_url });
  } catch (err: unknown) {
    console.error('Checkout API Error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
