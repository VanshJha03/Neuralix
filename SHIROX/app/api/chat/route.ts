import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { requireAuth, checkLimit, incrementUsage, upsertRow, getRow } from '@/lib/supabase-server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const limitErr = checkLimit(auth.row, auth.tier, 'chat');
  if (limitErr) return NextResponse.json({ error: limitErr }, { status: 429 });

  const { prompt, mode, chatHistory, systemInstruction: origSI, userSettings } = await req.json();
  const { userId, tier, sb } = auth;

  // Image / Imagine mode
  const isImageRequest = /generate image|draw|show me|create a picture|imagine a visual|visual concept/i.test(prompt);
  if (isImageRequest || mode === 'Imagine') {
    try {
      const imgRes = await ai.models.generateContent({
        model: 'gemma-4-31b-it',
        contents: { parts: [{ text: `Generate a high-quality futuristic marketing visual for: ${prompt}. Dark tech aesthetic, glowing red accents. No text in image.` }] },
        config: { responseModalities: ['IMAGE', 'TEXT'] },
      });
      let imageData: string | null = null, textData = '';
      for (const part of imgRes.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) imageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        else if (part.text) textData += part.text;
      }
      if (imageData) {
        await incrementUsage(sb, userId, 'chat_count');
        return NextResponse.json({ type: 'image', data: imageData, text: textData || 'Visual synthesis complete.' });
      }
    } catch (e: unknown) { console.error('Image gen failed:', (e as Error).message); }
  }

  const styles: string[] = userSettings?.styles || [];
  const styleOverride = styles.length > 0 ? `\nCOGNITIVE STYLE OVERRIDE: Apply a blend of ${styles.join(' and ')} style.` : '';
  // gemma-3-1b-it does NOT support systemInstruction — prepend it to the first user message instead
  const fullSystemContext = `${userSettings?.customSystemPrompt || origSI}${styleOverride}`;

  // Default: gemma-3-1b-it for chat (fast, conversational)
  // Default: gemma-4-31b-it for chat (fast, conversational)
  // Deep Research: gemma-4-31b-it with Google Search (powerful, grounded)
  let modelName = 'gemma-4-31b-it';
  const config: Record<string, unknown> = {
    temperature: 0.8,
    tools: [{ functionDeclarations: [
      { name: 'commitToMemory', description: 'Save fact to neural memory.', parameters: { type: Type.OBJECT, properties: { packet: { type: Type.STRING }, category: { type: Type.STRING } }, required: ['packet'] } },
    ]}],
  };
  if (mode === 'Deep Research') {
    modelName = 'gemma-4-31b-it';
    config.tools = [{ googleSearch: {} }];
  }

  try {
    const enhancedPrompt = chatHistory.length <= 1
      ? `Operator: ${userSettings?.name} (@${userSettings?.handle})\n\nPrompt: ${prompt}`
      : prompt;

    // Inject system context into the first user message since gemma-3-1b-it has no systemInstruction
    const firstMessageText = chatHistory.length === 0
      ? `[SYSTEM CONTEXT]\n${fullSystemContext}\n\n[USER]\n${mode} Context: ${enhancedPrompt}`
      : `${mode} Context: ${enhancedPrompt}`;

    let contents = [...chatHistory, { role: 'user', parts: [{ text: firstMessageText }] }];
    let response = await ai.models.generateContent({ model: modelName, contents, config });

    // Tool call loop — gemma-3-1b-it doesn't use function calling, but gemma-4-26b-a4b-it (Deep Research) might
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let calls: any[] = response.candidates?.[0]?.content?.parts?.filter((p: any) => p.functionCall) || [];
    while (calls.length > 0) {
      contents.push({ role: response.candidates?.[0]?.content?.role || 'model', parts: response.candidates?.[0]?.content?.parts || [] });
      const toolResults = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const call of calls as any[]) {
        let result: Record<string, unknown> = {};
        if (call.functionCall?.name === 'commitToMemory') {
          const row = await getRow(sb, userId);
          const existing: string[] = (row?.memories as string[]) || [];
          const packet = call.functionCall.args?.packet as string;
          await upsertRow(sb, userId, { memories: [packet, ...existing].slice(0, 100) });
          result = { success: true };
        }
        toolResults.push({ functionResponse: { name: call.functionCall?.name, response: result } });
      }
      contents.push({ role: 'user', parts: toolResults });
      response = await ai.models.generateContent({ model: modelName, contents, config });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calls = response.candidates?.[0]?.content?.parts?.filter((p: any) => p.functionCall) || [];
    }

    await incrementUsage(sb, userId, 'chat_count');
    return NextResponse.json({
      type: 'text',
      content: response.text || 'Neural link complete.',
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
    });
  } catch (error: unknown) {
    console.error('Chat Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
