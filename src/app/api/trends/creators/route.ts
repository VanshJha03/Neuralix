
import { NextResponse } from 'next/server';
import { verifyRequest, checkLimit, incrementUsage } from '@/lib/auth';
import { model } from '@/lib/gemini';

export async function POST(req: Request) {
    const auth = await verifyRequest(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { activeLabels } = await req.json();

    const limitError = checkLimit('analytics', auth.user, auth.settings);
    if (limitError) return NextResponse.json(limitError, { status: 429 });

    try {
        const prompt = `Analyze successful creators in: ${activeLabels}.
        Find their style and successful hooks.
        Return as JSON array: [{ "name": "string", "platform": "IG"|"X"|"YT", "style": "string", "successfulHooks": ["string"] }]`;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
        });

        return NextResponse.json(JSON.parse(result.response.text()));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
