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
      model: 'gemma-4-26b-a4b-it',
      contents: `Find top performing creators in these niches: ${activeLabels} on YouTube, X, and Instagram. Return ONLY a valid JSON array, no markdown.\n\nFor each creator include: name, platform (YT/X/IG), content style, and 3 successful viral hooks.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              platform: { type: Type.STRING, enum: ['YT', 'X', 'IG'] },
              style: { type: Type.STRING },
              successfulHooks: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['name', 'platform', 'style', 'successfulHooks'],
          },
        },
      },
    });
    await incrementUsage(auth.sb, auth.userId, 'trend_count');
    return NextResponse.json(JSON.parse(cleanJSON(response.text || '[]')));
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
