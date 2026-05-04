/**
 * apiService.ts — All data & AI calls.
 * Auth: Supabase. Storage: Supabase influencers table (via lib/supabase.ts for
 * client-side data, and via backend for AI routes that need the Gemini key).
 */

import { supabase, getAuthToken, getCurrentUserId } from '../lib/supabase';
import {
    dbFetchSettings, dbSaveSettings,
    dbFetchInterests, dbSaveInterests,
    dbFetchIdeas, dbSaveIdeas,
    dbFetchMemories, dbSaveMemory,
    dbFetchArchive, dbSaveArchive,
} from '../lib/supabase';
import type { TaskMode, Interest, NicheContent, ViralPrediction, CreatorAnalysis, GapAnalysis, UserSettings, Message, Idea } from '../types';

const BACKEND_URL = ''; // Next.js: API routes are same-origin

// ── Core fetch helper (attaches Supabase JWT automatically) ──────────────────
async function apiFetch(path: string, options: RequestInit = {}) {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(path, { ...options, headers });
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
    return apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt, mode, chatHistory, systemInstruction, userSettings }),
        signal,
    });
};

// ── Memory Extraction ─────────────────────────────────────────────────────────
export const extractNeuralMemory = async (messages: any[]): Promise<{ packet: string; category: string }[]> => {
    return apiFetch('/api/memory/extract', {
        method: 'POST',
        body: JSON.stringify({ messages }),
    });
};

// ── Marketing Content ─────────────────────────────────────────────────────────
export const generateMarketingContent = async (content: string, format: string, systemInstruction: string, userSettings?: UserSettings) => {
    const data = await apiFetch('/api/content/generate', {
        method: 'POST',
        body: JSON.stringify({ content, format, systemInstruction, userSettings }),
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
export const runNicheDiscovery = async (interests: Interest[]): Promise<{ topics: string[], creators: CreatorAnalysis[] }> => {
    const activeLabels = interests.filter(i => i.active).map(i => i.label).join(', ');
    return apiFetch('/api/trends/discover', { method: 'POST', body: JSON.stringify({ activeLabels }) });
};

export const runNicheDetails = async (topics: string[]): Promise<ViralPrediction[]> => {
    return apiFetch('/api/trends/details', { method: 'POST', body: JSON.stringify({ topics }) });
};

export const runViralPrediction = async (interests: Interest[]): Promise<ViralPrediction[]> => {
    const activeLabels = interests.filter(i => i.active).map(i => i.label).join(', ');
    return apiFetch('/api/trends/viral', { method: 'POST', body: JSON.stringify({ activeLabels }) });
};

export const runCreatorAnalysis = async (interests: Interest[]): Promise<CreatorAnalysis[]> => {
    const activeLabels = interests.filter(i => i.active).map(i => i.label).join(', ');
    return apiFetch('/api/trends/creators', { method: 'POST', body: JSON.stringify({ activeLabels }) });
};

export const runGapAnalysis = async (interests: Interest[], topics?: string[]): Promise<GapAnalysis[]> => {
    const activeLabels = interests.filter(i => i.active).map(i => i.label).join(', ');
    return apiFetch('/api/trends/gaps', { method: 'POST', body: JSON.stringify({ activeLabels, topics }) });
};

export const runParallelResearch = async (interests: Interest[]): Promise<NicheAnalyticsData> => {
    const activeLabels = interests.filter(i => i.active).map(i => i.label).join(', ');
    return apiFetch('/api/trends/research', { method: 'POST', body: JSON.stringify({ activeLabels }) });
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

// ── Settings — direct Supabase ────────────────────────────────────────────────
export const fetchUserSettings = async (): Promise<Partial<UserSettings> | null> => {
    const uid = await getCurrentUserId();
    if (!uid) return null;
    return dbFetchSettings(uid);
};

export const saveUserSettings = async (settings: Partial<UserSettings>) => {
    const uid = await getCurrentUserId();
    if (!uid) return;
    return dbSaveSettings(uid, settings);
};

// ── Memories — direct Supabase ────────────────────────────────────────────────
export const fetchMemories = async (): Promise<string[]> => {
    const uid = await getCurrentUserId();
    if (!uid) return [];
    return dbFetchMemories(uid);
};

export const saveMemory = async (packet: string, _category?: string) => {
    const uid = await getCurrentUserId();
    if (!uid) return;
    return dbSaveMemory(uid, packet);
};

// ── Interests — direct Supabase ───────────────────────────────────────────────
export const fetchInterests = async (): Promise<Interest[]> => {
    const uid = await getCurrentUserId();
    if (!uid) return [];
    return dbFetchInterests(uid);
};

export const saveInterests = async (interests: Interest[]) => {
    const uid = await getCurrentUserId();
    if (!uid) return;
    return dbSaveInterests(uid, interests);
};

// ── Ideas — direct Supabase ───────────────────────────────────────────────────
export const fetchIdeas = async (): Promise<Idea[]> => {
    const uid = await getCurrentUserId();
    if (!uid) return [];
    return dbFetchIdeas(uid);
};

export const saveIdeas = async (ideas: Idea[]) => {
    const uid = await getCurrentUserId();
    if (!uid) return;
    return dbSaveIdeas(uid, ideas);
};

// ── Archive — direct Supabase ─────────────────────────────────────────────────
export const fetchArchive = async (): Promise<Message[]> => {
    const uid = await getCurrentUserId();
    if (!uid) return [];
    return dbFetchArchive(uid);
};

export const saveArchive = async (messages: Message[]) => {
    const uid = await getCurrentUserId();
    if (!uid) return;
    return dbSaveArchive(uid, messages);
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const createCheckoutSession = async (tier: string): Promise<{ checkout_url: string }> => {
    return apiFetch('/api/payments/checkout', {
        method: 'POST',
        body: JSON.stringify({ tier }),
    });
};
