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
    const research = await ai.models.generateContent({
      model: 'gemma-4-31b-it',
      contents: `Research viral trends from the last 4-7 days in these niches: ${activeLabels}. Find 4 trending topics and assess their velocity (Early/Rising/Peak/Saturation) and a score 0-100.`,
      config: { tools: [{ googleSearch: {} }] },
    });
    const extraction = await ai.models.generateContent({
      model: 'gemma-4-31b-it',
      contents: `Extract trending topics from the research below. Return ONLY a valid JSON array, no markdown.\n\nResearch:\n${research.text}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              velocity: { type: Type.STRING, enum: ['Early', 'Rising', 'Peak', 'Saturation'] },
              score: { type: Type.NUMBER },
              why: { type: Type.STRING },
            },
            required: ['topic', 'velocity', 'score', 'why'],
          },
        },
      },
    });
    await incrementUsage(auth.sb, auth.userId, 'trend_count');
    return NextResponse.json(JSON.parse(cleanJSON(extraction.text || '[]')));
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
