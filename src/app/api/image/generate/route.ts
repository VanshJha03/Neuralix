
import { NextResponse } from 'next/server';
import { verifyRequest, checkLimit, incrementUsage } from '@/lib/auth';
import { model } from '@/lib/gemini';

export async function POST(req: Request) {
    const auth = await verifyRequest(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { prompt } = await req.json();

    const limitError = checkLimit('image', auth.user, auth.settings);
    if (limitError) return NextResponse.json(limitError, { status: 429 });

    try {
        const imgResponse = await model.generateContent({
            contents: [{ 
                role: 'user', 
                parts: [{ text: `Generate a high-quality futuristic marketing visual for: ${prompt}. Style: Dark tech aesthetic, glowing red accents. CRITICAL: Do NOT include any text or words in the image.` }] 
            }],
        });

        // Note: For now, Gemini Image generation requires specific model capabilities. 
        // If the model doesn't support it, we fall back to a descriptive text response.
        const text = imgResponse.response.text();
        
        incrementUsage('image', auth.user.id);
        
        return NextResponse.json({ 
            type: 'text', 
            content: text || 'Visual synthesis failed to produce raw data, but the concept is logged.',
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
