import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { requireAuth, checkLimit, incrementUsage } from '@/lib/supabase-server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const limitErr = checkLimit(auth.row, auth.tier, 'niche');
  if (limitErr) return NextResponse.json({ error: limitErr }, { status: 429 });

  const { activeLabels } = await req.json();
  try {
    const response = await ai.models.generateContent({
      model: 'gemma-4-26b-a4b-it', contents: `Find real content from YT, IG, X for: ${activeLabels} last 4-7 days. Return 9 items JSON.`,
      config: { responseMimeType: 'application/json', responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, platform: { type: Type.STRING }, title: { type: Type.STRING }, channel: { type: Type.STRING }, views: { type: Type.STRING }, date: { type: Type.STRING }, url: { type: Type.STRING }, thumbnail: { type: Type.STRING } }, required: ['id', 'platform', 'title', 'channel', 'views', 'date', 'url', 'thumbnail'] } } },
    });
    await incrementUsage(auth.sb, auth.userId, 'niche_count');
    return NextResponse.json(JSON.parse(response.text?.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim() || '[]'));
  } catch (err: unknown) { return NextResponse.json({ error: (err as Error).message }, { status: 500 }); }
}
