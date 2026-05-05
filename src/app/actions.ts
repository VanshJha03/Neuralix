
'use server';

import { getAuthToken } from '../lib/supabase';

async function apiFetch(path: string, options: RequestInit = {}) {
    const token = await getAuthToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // In server actions, we use absolute URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}${path}`, { ...options, headers, cache: 'no-store' });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `Request failed: ${res.status}`);
    }
    return res.json();
}

export async function saveUserSettings(settings: Record<string, any>) {
    try {
        await apiFetch('/api/settings', {
            method: 'POST',
            body: JSON.stringify(settings),
        });
    } catch (err) {
        console.error('saveUserSettings failed:', err);
    }
}

export async function saveIdeas(ideas: any[]) {
    try {
        await apiFetch('/api/ideas', {
            method: 'POST',
            body: JSON.stringify(ideas),
        });
    } catch (err) {
        console.error('saveIdeas failed:', err);
    }
}

export async function saveInterests(interests: any[]) {
    try {
        await apiFetch('/api/interests', {
            method: 'POST',
            body: JSON.stringify(interests),
        });
    } catch (err) {
        console.error('saveInterests failed:', err);
    }
}

export async function saveMemory(packet: string, category: string) {
    try {
        await apiFetch('/api/memories', {
            method: 'POST',
            body: JSON.stringify({ packet, category }),
        });
    } catch (err) {
        console.error('saveMemory failed:', err);
    }
}

export async function saveArchive(messages: any[]) {
    try {
        await apiFetch('/api/archive', {
            method: 'POST',
            body: JSON.stringify({ messages }),
        });
    } catch (err) {
        console.error('saveArchive failed:', err);
    }
}
