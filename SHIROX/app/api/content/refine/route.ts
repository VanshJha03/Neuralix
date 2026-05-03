import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { requireAuth, checkLimit, incrementUsage } from '@/lib/supabase-server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const limitErr = checkLimit(auth.row, auth.tier, 'content');
  if (limitErr) return NextResponse.json({ error: limitErr }, { status: 429 });

  const { currentContent, refinement, format, systemInstruction } = await req.json();
  try {
    const response = await ai.models.generateContent({
      model: 'gemma-4-26b-a4b-it',
      contents: `Current content:\n"${currentContent}"\n\nRefinement:\n"${refinement}"\n\nFormat: ${format}\n\nRefine while keeping the same voice.`,
      config: { systemInstruction, temperature: 0.7 },
    });
    await incrementUsage(auth.sb, auth.userId, 'content_count');
    return NextResponse.json({ content: response.text || 'Refinement failed.' });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
