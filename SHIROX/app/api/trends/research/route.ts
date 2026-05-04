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
  
  // Checking trend limit for parallel research
  const limitErr = checkLimit(auth.row, auth.tier, 'trend');
  if (limitErr) return NextResponse.json({ error: limitErr }, { status: 429 });

  const { activeLabels } = await req.json();
  try {
    const response = await ai.models.generateContent({
      model: 'gemma-4-31b-it',
      contents: `Perform an ultra-high-speed comprehensive market research for the following niches: ${activeLabels}.
      
      Task:
      1. VIRAL PREDICTOR: Find 4 hottest viral topics/themes from the last 7 days. For each, provide velocity (Early, Rising, Peak, Saturation), a score (0-100), and a concise 'why'.
      2. CREATORS: Find top 4 creators currently dominating these niches on YT, X, or IG. Creator object: { name, platform ('YT'|'X'|'IG'), style, successfulHooks: string[] }.
      3. GAP ANALYSIS: Find 3-4 market gaps. For each, identify 'trend', 'crowdIsSaying', 'missingPiece', and a 'hookUSP'.
      
      Return ONLY a JSON object with 'predictions', 'creators', and 'gaps'.
      Skip all intro and reasoning. Use Google Search for real-time grounding.`,
      config: { 
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictions: {
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
              }
            },
            creators: {
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
              }
            },
            gaps: {
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
              }
            }
          },
          required: ['predictions', 'creators', 'gaps'],
        },
      },
    });

    await incrementUsage(auth.sb, auth.userId, 'trend_count');
    return NextResponse.json(JSON.parse(cleanJSON(response.text || '{}')));
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
