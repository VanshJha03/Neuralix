import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { requireAuth, checkLimit, incrementUsage } from '@/lib/supabase-server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Strip markdown code fences that gemma sometimes wraps JSON in
function cleanJSON(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const limitErr = checkLimit(auth.row, auth.tier, 'gap');
  if (limitErr) return NextResponse.json({ error: limitErr }, { status: 429 });

  const { activeLabels } = await req.json();
  try {
    const research = await ai.models.generateContent({
      model: 'gemma-4-26b-a4b-it',
      contents: `For niches: ${activeLabels}, find 3 major trends from the last 4-7 days. For each trend identify: what the crowd is saying, what important perspective is missing, and a unique viral hook.`,
      config: { tools: [{ googleSearch: {} }] },
    });

    const extraction = await ai.models.generateContent({
      model: 'gemma-4-26b-a4b-it',
      contents: `Extract gap analysis from the research below. Return ONLY a valid JSON array, no markdown, no explanation.\n\nResearch:\n${research.text}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              trend: { type: Type.STRING },
              crowdIsSaying: { type: Type.STRING },
              missingPiece: { type: Type.STRING },
              hookUSP: { type: Type.STRING },
            },
            required: ['trend', 'crowdIsSaying', 'missingPiece', 'hookUSP'],
          },
        },
      },
    });

    const raw = cleanJSON(extraction.text || '[]');
    await incrementUsage(auth.sb, auth.userId, 'gap_count');
    return NextResponse.json(JSON.parse(raw));
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
