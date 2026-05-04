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

  const { activeLabels, topics } = await req.json();
  try {
    const topicContext = topics ? `Focus on these specific viral topics: ${topics.join(', ')}.` : `Research niches: ${activeLabels}.`;
    
    const response = await ai.models.generateContent({
      model: 'gemma-4-31b-it',
      contents: `Perform high-speed grounding search for market gaps. ${topicContext}
      Find 3-4 trends. For each, identify the common narrative vs the missing perspective.
      Return ONLY a JSON array. Skip intro and reasoning.`,
      config: { 
        tools: [{ googleSearch: {} }],
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

    const raw = cleanJSON(response.text || '[]');
    await incrementUsage(auth.sb, auth.userId, 'gap_count');
    return NextResponse.json(JSON.parse(raw));
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
