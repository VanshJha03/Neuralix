import { NextRequest, NextResponse } from 'next/server';
import DodoPayments from 'dodopayments';
import { requireAuth, getRow } from '@/lib/supabase-server';

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment: process.env.DODO_ENV === 'test' ? 'test_mode' : 'live_mode',
});

const PRODUCT_IDS: Record<string, string | undefined> = {
  PRO: process.env.DODO_PRODUCT_PRO,
  LTD: process.env.DODO_PRODUCT_LTD,
};

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { tier } = await req.json();
  const productId = PRODUCT_IDS[tier?.toUpperCase()];
  if (!productId) return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });

  try {
    const row = await getRow(auth.sb, auth.userId);
    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: { email: auth.email, name: (row?.name as string) || 'Operator' },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/success`,
      metadata: { user_id: auth.userId, tier: tier.toUpperCase() },
    });
    return NextResponse.json({ checkout_url: session.checkout_url });
  } catch (err: unknown) {
    console.error('Dodo checkout error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
