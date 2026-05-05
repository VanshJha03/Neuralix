import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase, requireAuth, upsertRow } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: 'Code required' }, { status: 400 });
    }

    const sb = createServerSupabase();

    // 1. Check if it's the MASTER VITE_COUPON_CODE
    if (process.env.VITE_COUPON_CODE && code === process.env.VITE_COUPON_CODE) {
      // Grant PRO access by default for master code? User said "check whther it is VITE_COUPON_CODE, if no then check whether it is code of PRO or LTD"
      // Assuming VITE_COUPON_CODE grants PRO or whatever the master tier is. 
      // Let's assume it grants PRO.
      await upsertRow(sb, auth.userId, { tier: 'PRO' });
      return NextResponse.json({ success: true, tier: 'PRO', message: 'Master code applied' });
    }

    // 2. Check in redemption_codes table
    const { data: codeRow, error: fetchError } = await sb
      .from('redemption_codes')
      .select('*')
      .eq('code', code)
      .eq('is_used', false)
      .single();

    if (fetchError || !codeRow) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    // 3. Grant the tier
    await upsertRow(sb, auth.userId, { tier: codeRow.tier });

    // 4. Expire the code
    await sb
      .from('redemption_codes')
      .update({ is_used: true, used_by: auth.userId })
      .eq('id', codeRow.id);

    return NextResponse.json({ success: true, tier: codeRow.tier, message: `Redeemed ${codeRow.tier} access successfully.` });

  } catch (err: unknown) {
    console.error('Redeem API Error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
