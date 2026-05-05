import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: 'Code required' }, { status: 400 });
    }

    const sb = createServerSupabase();

    // 1. Check MASTER VITE_COUPON_CODE
    if (process.env.VITE_COUPON_CODE && code === process.env.VITE_COUPON_CODE) {
      return NextResponse.json({ valid: true, tier: 'PRO' });
    }

    // 2. Check redemption_codes
    const { data: codeRow, error } = await sb
      .from('redemption_codes')
      .select('tier, is_used')
      .eq('code', code)
      .single();

    if (error || !codeRow) {
      return NextResponse.json({ valid: false, error: 'Invalid code' });
    }

    if (codeRow.is_used) {
      return NextResponse.json({ valid: false, error: 'Code already used' });
    }

    return NextResponse.json({ valid: true, tier: codeRow.tier });

  } catch (err: unknown) {
    return NextResponse.json({ valid: false, error: 'Verification failed' });
  }
}
