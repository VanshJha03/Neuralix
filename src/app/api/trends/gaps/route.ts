
import { NextResponse } from 'next/server';
import { verifyRequest, checkLimit, incrementUsage } from '@/lib/auth';
import { model } from '@/lib/gemini';

export async function POST(req: Request) {
    const auth = await verifyRequest(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { activeLabels } = await req.json();

    const limitError = checkLimit('gap', auth.user, auth.settings);
    if (limitError) return NextResponse.json(limitError, { status: 429 });

    try {
        const prompt = `Perform GAP ANALYSIS for: ${activeLabels}.
        Find what the crowd is saying and what's missing.
        Return as JSON array: [{ "trend": "string", "crowdIsSaying": "string", "missingPiece": "string", "hookUSP": "string" }]`;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
        });

        incrementUsage('gap', auth.user.id);
        return NextResponse.json(JSON.parse(result.response.text()));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
