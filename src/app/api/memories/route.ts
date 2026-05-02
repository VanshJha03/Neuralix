
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
    
    return NextResponse.json(auth.settings.memories || []);
}

export async function POST(req: Request) {
    const auth = await verifyRequest(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { packet } = await req.json();
    if (!packet) return NextResponse.json({ error: 'No packet provided' }, { status: 400 });

    // Fetch existing memories to append (or use array_append in SQL)
    const existingMemories = auth.settings.memories || [];
    
    // Deduplicate and append
    if (!existingMemories.includes(packet)) {
        const { error } = await supabaseAdmin
            .from('influencers')
            .update({ 
                memories: [packet, ...existingMemories].slice(0, 100) 
            })
            .eq('user_id', auth.user.id);
            
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
