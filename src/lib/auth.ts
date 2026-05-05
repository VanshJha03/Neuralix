
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin for server-side operations
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const TIER_LIMITS: any = {
    'Free':        { analytics: 5,   content: 5,   image: 0,   gap: 0,   niche: 1,   chat: 10,  marketingStudio: false, isOneTime: true },
    'PRO':         { analytics: 30,  content: 100, image: 100, gap: 30,  niche: 30, chat: 500, marketingStudio: true,  marketingLimit: 100 },
    'LTD':         { analytics: 30,  content: 100, image: 100, gap: 30,  niche: 30, chat: 500, marketingStudio: true,  marketingLimit: 100 },
    'beta':        { analytics: 999, content: 999, image: 999, gap: 999, niche: 999, chat: 999, marketingStudio: true,  marketingLimit: 999 },
};

export interface UserAuth {
    id: string;
    email: string;
    tier: string;
}

export interface AuthResponse {
    user: UserAuth;
    settings: any;
    error?: string;
    status?: number;
}

export async function verifyRequest(req: Request): Promise<AuthResponse | { error: string; status: number }> {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return { error: 'No authorization header', status: 401 };
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify JWT with Supabase
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
        console.error('Supabase Auth Failure:', authError);
        return { error: 'Authentication Breach', status: 401 };
    }

    const userId = user.id;
    const userEmail = user.email || '';

    // Fetch user settings from influencers table
    const { data: influencer, error: dbError } = await supabaseAdmin
        .from('influencers')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (dbError || !influencer) {
        // Auto-create influencer if missing
        const { data: newInfluencer, error: createError } = await supabaseAdmin
            .from('influencers')
            .upsert({ 
                user_id: userId, 
                name: user.user_metadata?.full_name || 'Operator',
                handle: 'system_link',
                tier: 'Free'
            }, { onConflict: 'user_id' })
            .select()
            .single();

        if (createError) return { error: 'Database Error', status: 500 };
        return {
            user: { id: userId, email: userEmail, tier: 'Free' },
            settings: newInfluencer
        };
    }

    // Handle Month Reset (Logic same as frontend for consistency)
    const thisMonth = new Date().toISOString().substring(0, 7);
    if (influencer.last_reset !== thisMonth) {
        await supabaseAdmin
            .from('influencers')
            .update({
                niche_count: 0, gap_count: 0, chat_count: 0,
                content_count: 0, image_count: 0, trend_count: 0,
                last_reset: thisMonth,
            })
            .eq('user_id', userId);
        
        influencer.niche_count = 0;
        influencer.gap_count = 0;
        influencer.chat_count = 0;
        influencer.content_count = 0;
        influencer.image_count = 0;
        influencer.trend_count = 0;
    }

    return {
        user: { id: userId, email: userEmail, tier: influencer.tier || 'Free' },
        settings: influencer,
    };
}

export function checkLimit(type: string, user: any, settings: any) {
    const limits = TIER_LIMITS[user.tier] || TIER_LIMITS['Free'];

    if (type === 'marketingStudio' && !limits.marketingStudio) {
        return { error: 'PRO UPGRADE REQUIRED: Content Studio is reserved for professional tiers.' };
    }

    // Mapping type to DB column
    const columnMap: any = {
        'analytics': 'niche_count',
        'content': 'content_count',
        'image': 'image_count',
        'gap': 'gap_count',
        'chat': 'chat_count',
        'trend': 'trend_count'
    };

    const dbField = columnMap[type] || `${type}_count`;
    const usage = settings[dbField] ?? 0;

    if (usage >= (limits[type] ?? 0)) {
        return { error: `QUOTA REACHED: You have utilized your ${limits[type]} allocated ${type} packets. Upgrade for more access.` };
    }

    return null;
}

export async function incrementUsage(type: string, userId: string) {
    const columnMap: any = {
        'analytics': 'niche_count',
        'content': 'content_count',
        'image': 'image_count',
        'gap': 'gap_count',
        'chat': 'chat_count',
        'trend': 'trend_count'
    };
    const dbField = columnMap[type] || `${type}_count`;

    // Fetch current count
    const { data } = await supabaseAdmin
        .from('influencers')
        .select(dbField)
        .eq('user_id', userId)
        .single();
    
    if (data) {
        await supabaseAdmin
            .from('influencers')
            .update({ [dbField]: ((data as any)[dbField] || 0) + 1 })
            .eq('user_id', userId);
    }
}
