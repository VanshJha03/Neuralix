import { createClient } from '@supabase/supabase-js';
import type { UserSettings, Interest, Idea, Message } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Auth helpers ─────────────────────────────────────────────────────────────
export const getAuthToken = async (): Promise<string | null> => {
    // First try the cached session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) return session.access_token;
    // If no session yet, try refreshing (handles page reload before storage hydrates)
    const { data: refreshed } = await supabase.auth.refreshSession();
    return refreshed.session?.access_token ?? null;
};

export const getCurrentUserId = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
};

// ─── influencers table shape ──────────────────────────────────────────────────
// CREATE TABLE influencers (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   user_id TEXT UNIQUE NOT NULL,
//   name TEXT DEFAULT 'Operator',
//   handle TEXT DEFAULT 'neural_link',
//   avatar_color TEXT DEFAULT '#ffffff',
//   custom_system_prompt TEXT,
//   x_post_images BOOLEAN DEFAULT true,
//   x_thread_images BOOLEAN DEFAULT true,
//   tier TEXT DEFAULT 'PRO',           -- 'PRO' | 'LTD'
//   styles TEXT[] DEFAULT '{}',
//   interests JSONB DEFAULT '[]',
//   ideas JSONB DEFAULT '[]',
//   memories TEXT[] DEFAULT '{}',
//   archive JSONB DEFAULT '[]',
//   -- usage counters (reset monthly by cron or server)
//   niche_count INTEGER DEFAULT 0,
//   gap_count INTEGER DEFAULT 0,
//   chat_count INTEGER DEFAULT 0,
//   content_count INTEGER DEFAULT 0,
//   image_count INTEGER DEFAULT 0,
//   trend_count INTEGER DEFAULT 0,
//   last_reset TEXT DEFAULT '',
//   created_at TIMESTAMPTZ DEFAULT now()
// );

type InfluencerRow = {
    user_id: string;
    name: string;
    handle: string;
    avatar_color: string;
    custom_system_prompt: string | null;
    x_post_images: boolean;
    x_thread_images: boolean;
    tier: string;
    styles: string[];
    interests: Interest[];
    ideas: Idea[];
    memories: string[];
    archive: Message[];
    niche_count: number;
    gap_count: number;
    chat_count: number;
    content_count: number;
    image_count: number;
    trend_count: number;
    last_reset: string;
};

// ─── Upsert helper ────────────────────────────────────────────────────────────
async function upsertInfluencer(userId: string, patch: Partial<InfluencerRow>) {
    const { error } = await supabase
        .from('influencers')
        .upsert({ user_id: userId, ...patch }, { onConflict: 'user_id' });
    if (error) throw error;
}

async function getInfluencer(userId: string): Promise<InfluencerRow | null> {
    const { data, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('user_id', userId)
        .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data ?? null;
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export async function dbFetchSettings(userId: string): Promise<Partial<UserSettings> | null> {
    const row = await getInfluencer(userId);
    if (!row) return null;

    const thisMonth = new Date().toISOString().substring(0, 7);
    // Reset counters if new month
    if (row.last_reset !== thisMonth) {
        await upsertInfluencer(userId, {
            niche_count: 0, gap_count: 0, chat_count: 0,
            content_count: 0, image_count: 0, trend_count: 0,
            last_reset: thisMonth,
        });
        row.niche_count = 0; row.gap_count = 0; row.chat_count = 0;
        row.content_count = 0; row.image_count = 0; row.trend_count = 0;
    }

    return {
        name: row.name,
        handle: row.handle,
        avatarColor: row.avatar_color,
        customSystemPrompt: row.custom_system_prompt ?? undefined,
        xPostImages: row.x_post_images,
        xThreadImages: row.x_thread_images,
        tier: row.tier as UserSettings['tier'],
        styles: row.styles,
        usage: {
            analytics: row.niche_count,
            totalAnalytics: row.niche_count,
            content: row.content_count,
            totalContent: row.content_count,
            image: row.image_count,
            gap: row.gap_count,
            chat: row.chat_count,
        },
    };
}

export async function dbSaveSettings(userId: string, settings: Partial<UserSettings>) {
    const patch: Partial<InfluencerRow> = {};
    if (settings.name !== undefined) patch.name = settings.name;
    if (settings.handle !== undefined) patch.handle = settings.handle;
    if (settings.avatarColor !== undefined) patch.avatar_color = settings.avatarColor;
    if (settings.customSystemPrompt !== undefined) patch.custom_system_prompt = settings.customSystemPrompt;
    if (settings.xPostImages !== undefined) patch.x_post_images = settings.xPostImages;
    if (settings.xThreadImages !== undefined) patch.x_thread_images = settings.xThreadImages;
    if (settings.tier !== undefined) patch.tier = settings.tier;
    if (settings.styles !== undefined) patch.styles = settings.styles;
    await upsertInfluencer(userId, patch);
}

// ─── Interests ────────────────────────────────────────────────────────────────
export async function dbFetchInterests(userId: string): Promise<Interest[]> {
    const row = await getInfluencer(userId);
    return row?.interests ?? [];
}

export async function dbSaveInterests(userId: string, interests: Interest[]) {
    await upsertInfluencer(userId, { interests });
}

// ─── Ideas ────────────────────────────────────────────────────────────────────
export async function dbFetchIdeas(userId: string): Promise<Idea[]> {
    const row = await getInfluencer(userId);
    return row?.ideas ?? [];
}

export async function dbSaveIdeas(userId: string, ideas: Idea[]) {
    await upsertInfluencer(userId, { ideas });
}

// ─── Memories ─────────────────────────────────────────────────────────────────
export async function dbFetchMemories(userId: string): Promise<string[]> {
    const row = await getInfluencer(userId);
    return row?.memories ?? [];
}

export async function dbSaveMemory(userId: string, packet: string) {
    const existing = await dbFetchMemories(userId);
    if (existing.includes(packet)) return;
    await upsertInfluencer(userId, { memories: [packet, ...existing].slice(0, 100) });
}

// ─── Archive ──────────────────────────────────────────────────────────────────
export async function dbFetchArchive(userId: string): Promise<Message[]> {
    const row = await getInfluencer(userId);
    return row?.archive ?? [];
}

export async function dbSaveArchive(userId: string, messages: Message[]) {
    await upsertInfluencer(userId, { archive: messages });
}

// ─── Usage increment (called from server) ────────────────────────────────────
export async function dbIncrementUsage(userId: string, field: 'niche_count' | 'gap_count' | 'chat_count' | 'content_count' | 'image_count' | 'trend_count') {
    const row = await getInfluencer(userId);
    const current = row?.[field] ?? 0;
    await upsertInfluencer(userId, { [field]: current + 1 });
}
