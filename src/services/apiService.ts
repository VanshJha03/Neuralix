/**
 * apiService.ts
 *
 * All AI and data calls go through here.
 * This module calls the backend so secrets stay out of the browser.
 */

import { auth } from '../lib/firebase';
import {
    TaskMode,
    Interest,
    NicheContent,
    ViralPrediction,
    CreatorAnalysis,
    GapAnalysis,
    UserSettings,
    Message,
    Idea,
} from '../types';

const BACKEND_URL = '';

async function apiFetch(path: string, options: RequestInit = {}) {
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : null;

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
    return data;
};

export const extractNeuralMemory = async (messages: any[]): Promise<{ packet: string; category: string }[]> => {
    return apiFetch('/api/memory/extract', {
        method: 'POST',
        body: JSON.stringify({ messages }),
    });
};

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

export const generateNeuralImage = async (prompt: string): Promise<string | null> => {
    const data = await apiFetch('/api/image/generate', { method: 'POST', body: JSON.stringify({ prompt }) });
    return data.imageData;
};

export const fetchUserSettings = () => apiFetch('/api/settings');

export const createCheckoutSession = async (tier: Exclude<NonNullable<UserSettings['tier']>, 'Free' | 'beta'>) => {
    const res = await apiFetch('/api/checkout/create', {
        method: 'POST',
        body: JSON.stringify({ tierKey: tier }),
    });
    return { checkoutUrl: res.checkout_url };
};
