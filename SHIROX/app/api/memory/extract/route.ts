import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { requireAuth } from '@/lib/supabase-server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { messages } = await req.json();
  const conversationText = messages.map((m: { role: string; content: string }) => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
  try {
    const response = await ai.models.generateContent({
      model: 'gemma-4-26b-it',
      contents: `Extract 2-3 Neural Memory Packets from this conversation:\n${conversationText}\nReturn JSON array.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { packet: { type: Type.STRING }, category: { type: Type.STRING } }, required: ['packet', 'category'] } },
      },
    });
    return NextResponse.json(JSON.parse(response.text?.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim() || '[]'));
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
