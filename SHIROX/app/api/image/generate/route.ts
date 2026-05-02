import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { requireAuth, checkLimit, incrementUsage } from '@/lib/supabase-server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const limitErr = checkLimit(auth.row, auth.tier, 'image');
  if (limitErr) return NextResponse.json({ error: limitErr }, { status: 429 });

  const { prompt } = await req.json();
  try {
    const response = await ai.models.generateContent({
      model: 'gemma-4-31b-it',
      contents: { parts: [{ text: `Generate futuristic marketing visual: ${prompt}. Dark tech, glowing red accents. No text.` }] },
      config: { responseModalities: ['IMAGE', 'TEXT'] },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        await incrementUsage(auth.sb, auth.userId, 'image_count');
        return NextResponse.json({ imageData: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` });
      }
    }
    return NextResponse.json({ imageData: null });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
