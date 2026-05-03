import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { requireAuth, checkLimit, incrementUsage } from '@/lib/supabase-server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const limitErr = checkLimit(auth.row, auth.tier, 'trend');
  if (limitErr) return NextResponse.json({ error: limitErr }, { status: 429 });

  const { activeLabels } = await req.json();
  try {
    const response = await ai.models.generateContent({ model: 'gemma-4-26b-it', contents: `Find 5 viral trends last 4-7 days in: ${activeLabels}. Format: PLATFORM | TOPIC | VIRAL_HOOK`, config: { tools: [{ googleSearch: {} }] } });
    await incrementUsage(auth.sb, auth.userId, 'trend_count');
    return NextResponse.json({ text: response.text, sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] });
  } catch (err: unknown) { return NextResponse.json({ error: (err as Error).message }, { status: 500 }); }
}
