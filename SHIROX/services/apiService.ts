/**
 * apiService.ts
 * 
 * All AI & data calls go through here.
 * This module calls YOUR backend (which holds the Gemini key).
 * Zero secrets in the browser.
 */

import { getAuthToken } from '../lib/supabase';
import { TaskMode, Interest, NicheContent, ViralPrediction, CreatorAnalysis, GapAnalysis, UserSettings, Message, Idea } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:2005';

// ── Core fetch helper (attaches JWT automatically) ────────────────────────────
async function apiFetch(path: string, options: RequestInit = {}) {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BACKEND_URL}${path}`, { ...options, headers });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `Request failed: ${res.status}`);
    }
    return res.json();
}

// ── Chat ──────────────────────────────────────────────────────────────────────
export const generateSHIROXResponse = async (
    prompt: string,
    mode: TaskMode,
    chatHistory: any[] = [],
    systemInstruction: string,
    userSettings?: UserSettings,
    signal?: AbortSignal
) => {
    const data = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt, mode, chatHistory, systemInstruction, userSettings }),
        signal,
    });
    return data; // { type, content, sources } or { type, data, text }
};

// ── Memory Extraction ─────────────────────────────────────────────────────────
export const extractNeuralMemory = async (messages: any[]): Promise<{ packet: string; category: string }[]> => {
    return apiFetch('/api/memory/extract', {
        method: 'POST',
        body: JSON.stringify({ messages }),
    });
};

// ── Marketing Content ─────────────────────────────────────────────────────────
export const generateMarketingContent = async (content: string, format: string, systemInstruction: string) => {
    const data = await apiFetch('/api/content/generate', {
        method: 'POST',
        body: JSON.stringify({ content, format, systemInstruction }),
    });
    return data.content;
};

export const refineMarketingContent = async (currentContent: string, refinement: string, format: string, systemInstruction: string) => {
    const data = await apiFetch('/api/content/refine', {
        method: 'POST',
        body: JSON.stringify({ currentContent, refinement, format, systemInstruction }),
    });
    return data.content;
};

// ── Trends ────────────────────────────────────────────────────────────────────
export const runViralPrediction = async (interests: Interest[]): Promise<ViralPrediction[]> => {
    const activeLabels = interests.filter(i => i.active).map(i => i.label).join(', ');
    return apiFetch('/api/trends/viral', { method: 'POST', body: JSON.stringify({ activeLabels }) });
};

export const runCreatorAnalysis = async (interests: Interest[]): Promise<CreatorAnalysis[]> => {
    const activeLabels = interests.filter(i => i.active).map(i => i.label).join(', ');
    return apiFetch('/api/trends/creators', { method: 'POST', body: JSON.stringify({ activeLabels }) });
};

export const runGapAnalysis = async (interests: Interest[]): Promise<GapAnalysis[]> => {
    const activeLabels = interests.filter(i => i.active).map(i => i.label).join(', ');
    return apiFetch('/api/trends/gaps', { method: 'POST', body: JSON.stringify({ activeLabels }) });
};

export const fetchLatestTrends = async (interests: Interest[]) => {
    const activeLabels = interests.filter(i => i.active).map(i => i.label).join(', ');
    if (!activeLabels) return { text: '', sources: [] };
    return apiFetch('/api/trends/latest', { method: 'POST', body: JSON.stringify({ activeLabels }) });
};

export const searchNicheContent = async (interests: Interest[]): Promise<NicheContent[]> => {
    const activeLabels = interests.filter(i => i.active).map(i => i.label).join(', ');
    if (!activeLabels) return [];
    return apiFetch('/api/trends/niche', { method: 'POST', body: JSON.stringify({ activeLabels }) });
};

// ── Neural Image ──────────────────────────────────────────────────────────────
export const generateNeuralImage = async (prompt: string): Promise<string | null> => {
    const data = await apiFetch('/api/image/generate', { method: 'POST', body: JSON.stringify({ prompt }) });
    return data.imageData;
};

// ── Settings (via backend, not direct DB) ────────────────────────────────────
export const fetchUserSettings = () => apiFetch('/api/settings');
export const saveUserSettings = (settings: Partial<UserSettings>) =>
    apiFetch('/api/settings', { method: 'POST', body: JSON.stringify(settings) });

// ── Memories ──────────────────────────────────────────────────────────────────
export const fetchMemories = (): Promise<string[]> => apiFetch('/api/memories');
export const saveMemory = (packet: string, category?: string) =>
    apiFetch('/api/memories', { method: 'POST', body: JSON.stringify({ packet, category }) });

// ── Interests ─────────────────────────────────────────────────────────────────
export const fetchInterests = () => apiFetch('/api/interests');
export const saveInterests = (interests: Interest[]) =>
    apiFetch('/api/interests', { method: 'POST', body: JSON.stringify(interests) });

// ── Ideas ─────────────────────────────────────────────────────────────────────
export const fetchIdeas = (): Promise<Idea[]> => apiFetch('/api/ideas');
export const saveIdeas = (ideas: Idea[]) =>
    apiFetch('/api/ideas', { method: 'POST', body: JSON.stringify(ideas) });

// ── Archive ───────────────────────────────────────────────────────────────────
export const fetchArchive = (): Promise<Message[]> => apiFetch('/api/archive');
export const saveArchive = (messages: Message[]) =>
    apiFetch('/api/archive', { method: 'POST', body: JSON.stringify({ messages }) });
