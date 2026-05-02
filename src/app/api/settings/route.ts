
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
    return NextResponse.json(auth.settings);
}

export async function POST(req: Request) {
    const auth = await verifyRequest(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await req.json();
    const { name, handle, avatarColor, customSystemPrompt, styles, xPostImages, xThreadImages, tier } = body;

    const { error } = await supabaseAdmin
        .from('influencers')
        .update({
            ...(name !== undefined && { name }),
            ...(handle !== undefined && { handle }),
            ...(avatarColor !== undefined && { avatar_color: avatarColor }),
            ...(customSystemPrompt !== undefined && { custom_system_prompt: customSystemPrompt }),
            ...(styles !== undefined && { styles }),
            ...(xPostImages !== undefined && { x_post_images: xPostImages }),
            ...(xThreadImages !== undefined && { x_thread_images: xThreadImages }),
            ...(tier !== undefined && { tier }),
        })
        .eq('user_id', auth.user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
