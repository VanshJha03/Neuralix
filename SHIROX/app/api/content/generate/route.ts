import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { requireAuth, checkLimit, incrementUsage } from '@/lib/supabase-server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const limitErr = checkLimit(auth.row, auth.tier, 'content');
  if (limitErr) return NextResponse.json({ error: limitErr }, { status: 429 });

  const { content, format, systemInstruction, userSettings } = await req.json();
  try {
    let imageLogic = '', charLimit = '';
    if (format === 'X Post') {
      charLimit = 'STRICT: Under 280 chars total.';
      imageLogic = userSettings?.xPostImages ? 'Include one [IMAGE: prompt] at end.' : 'No [IMAGE:] tags.';
    } else if (format === 'X Thread') {
      charLimit = 'STRICT: Each post under 280 chars.';
      imageLogic = userSettings?.xThreadImages ? 'Include 1-4 [IMAGE: prompt] at transitions.' : 'No [IMAGE:] tags.';
    }
    const prompt = `Transform into viral ${format}: "${content}".\nFACT-FIRST: Use real company names, amounts, dates.\nVOICE: Bold, grounded, dark tech.\nCONSTRAINTS: No #VanshJha. ${charLimit}\nVISUALS: ${imageLogic}\nRESEARCH: Ground all facts via Google Search.`;
    const styles: string[] = userSettings?.styles || [];
    const finalSI = styles.length > 0 ? `${systemInstruction}\n\nSTYLE: ${styles.join(' and ')}` : systemInstruction;
    const response = await ai.models.generateContent({
      model: 'gemma-4-26b-it', contents: prompt,
      config: { systemInstruction: finalSI, temperature: 0.8, tools: [{ googleSearch: {} }] },
    });
    await incrementUsage(auth.sb, auth.userId, 'content_count');
    return NextResponse.json({ content: response.text || 'Synthesis failed.' });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
