
import { NextResponse } from 'next/server';
import { verifyRequest, checkLimit, incrementUsage } from '@/lib/auth';
import { model } from '@/lib/gemini';
import { DEFAULT_SYSTEM_PROMPT } from '@/constants';

export async function POST(req: Request) {
    const auth = await verifyRequest(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { prompt, mode, chatHistory } = await req.json();

    const limitError = checkLimit('chat', auth.user, auth.settings);
    if (limitError) return NextResponse.json(limitError, { status: 429 });

    const styles = JSON.parse(auth.settings.styles || '[]');
    const styleOverride = styles.length > 0
        ? `\nCOGNITIVE STYLE OVERRIDE:\nApply a blend of ${styles.join(' and ')} style to your responses.`
        : '';

    const systemInstruction = `${auth.settings.customSystemPrompt || DEFAULT_SYSTEM_PROMPT}${styleOverride}`;

    let config: any = { systemInstruction, temperature: 0.8 };

    if (mode === 'Deep Research') {
        config.thinkingConfig = { thinkingBudget: 32768 };
        config.tools = [{ googleSearch: {} }];
    }

    try {
        const enhancedPrompt = chatHistory.length <= 1
            ? `Operator: ${auth.user.email}\nContext: High-stakes trajectory.\n\nPrompt: ${prompt}`
            : prompt;

        const contents = [
            ...chatHistory,
            { role: 'user', parts: [{ text: `${mode} Context: ${enhancedPrompt}` }] }
        ];

        const result = await model.generateContent({ contents, ...config });
        const response = result.response;
        const groundingSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        // Fire-and-forget usage increment (non-blocking)
        incrementUsage('chat', auth.user.id).catch(console.error);

        return NextResponse.json({
            type: 'text',
            content: response.text() || 'Neural link complete.',
            sources: groundingSources,
        });

    } catch (error: any) {
        console.error('Chat AI Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
