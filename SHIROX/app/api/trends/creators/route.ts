import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { requireAuth, checkLimit, incrementUsage } from '@/lib/supabase-server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

function cleanJSON(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const limitErr = checkLimit(auth.row, auth.tier, 'trend');
  if (limitErr) return NextResponse.json({ error: limitErr }, { status: 429 });

  const { activeLabels } = await req.json();
  try {
    const response = await ai.models.generateContent({
      model: 'gemma-4-31b-it',
      contents: `Perform high-speed grounding search for top creators in these niches: ${activeLabels} on YouTube, X, and Instagram. 
      Return ONLY a JSON array. Skip introductory text and reasoning.`,
      config: {
        tools: [{ googleSearch: {} }]
      },
    });
    await incrementUsage(auth.sb, auth.userId, 'trend_count');
    return NextResponse.json(JSON.parse(cleanJSON(response.text || '[]')));
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
