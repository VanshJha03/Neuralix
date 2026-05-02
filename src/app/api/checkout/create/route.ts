
import { NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/auth';

export async function POST(req: Request) {
    const auth = await verifyRequest(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { tierKey } = await req.json();

    const tierToProductMap: Record<string, string | undefined> = {
        'PRO': process.env.DODO_PRODUCT_PRO,
        'LTD': process.env.DODO_PRODUCT_LTD,
        'LTD_PRO': process.env.DODO_PRODUCT_LTD_PRO,
    };

    const productId = tierToProductMap[tierKey];
    if (!productId) {
        return NextResponse.json({ error: 'Invalid tier selection' }, { status: 400 });
    }

    const apiKey = process.env.DODO_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'Dodo API key not configured' }, { status: 500 });
    }

    try {
        const response = await fetch('https://api.dodopayments.com/v1/checkout-sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product_cart: [{
                    product_id: productId,
                    quantity: 1,
                }],
                customer: {
                    email: auth.user.email,
                },
                metadata: {
                    user_id: auth.user.id,
                },
                return_url: `${process.env.APP_URL}/payment/success`,
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create checkout session');
        }

        return NextResponse.json({ checkout_url: data.checkout_url });
    } catch (error: any) {
        console.error('Checkout Session Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
