
import { NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
    const auth = await verifyRequest(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
    
    // Return interests from settings (already fetched in verifyRequest)
    return NextResponse.json(auth.settings.interests || []);
}

export async function POST(req: Request) {
    const auth = await verifyRequest(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const interests = await req.json();

    const { error } = await supabaseAdmin
        .from('influencers')
        .update({ interests })
        .eq('user_id', auth.user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
