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
  
  // Checking trend limit for discovery
  const limitErr = checkLimit(auth.row, auth.tier, 'trend');
  if (limitErr) return NextResponse.json({ error: limitErr }, { status: 429 });

  const { activeLabels } = await req.json();
  try {
    const response = await ai.models.generateContent({
      model: 'gemma-4-31b-it',
      contents: `Perform high-speed grounding search for niches: ${activeLabels}. 
      1. Find 4 hottest viral topics/themes from the last 7 days.
      2. Find top 4 creators currently dominating these niches on YT, X, or IG.
      
      Return ONLY a JSON object with 'topics' (array of strings) and 'creators' (array of objects).
      Creator object: { name, platform, style, successfulHooks: string[] }
      
      Skip intro and reasoning.`,
      config: { 
        tools: [{ googleSearch: {} }]
      },
    });

    await incrementUsage(auth.sb, auth.userId, 'trend_count');
    return NextResponse.json(JSON.parse(cleanJSON(response.text || '{}')));
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
