
import { adminAuth, adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const TIER_LIMITS: any = {
    'Free':       { analytics: 5,   content: 5,   image: 0,   gap: 0,   niche: 1,   chat: 10,  marketingStudio: false, isOneTime: true },
    'PRO_MONTHLY':{ analytics: 5,   content: 10,  image: 5,   gap: 5,   niche: 5,   chat: 100, marketingStudio: true,  marketingLimit: 10 },
    'LTD':        { analytics: 2,   content: 5,   image: 2,   gap: 3,   niche: 3,   chat: 50,  marketingStudio: true,  marketingLimit: 5 },
    'LTD_PRO':    { analytics: 5,   content: 10,  image: 10,  gap: 5,   niche: 5,   chat: 999, marketingStudio: true,  marketingLimit: 10 },
    'beta':       { analytics: 999, content: 999, image: 999, gap: 999, niche: 999, chat: 999, marketingStudio: true,  marketingLimit: 999 },
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
    let userId = 'local-operator-001';
    let userEmail = 'operator@local.dev';

    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        const idToken = authHeader.split('Bearer ')[1];
        try {
            const decodedToken = await adminAuth.verifyIdToken(idToken);
            userId = decodedToken.uid;
            userEmail = decodedToken.email || userEmail;
        } catch (error) {
            console.error('Neural Auth Failure:', error);
            return { error: 'Authentication Breach', status: 401 };
        }
    }

    const today = new Date().toISOString().split('T')[0];
    const thisMonth = today.substring(0, 7);
    const settingsRef = adminDb.collection('users').doc(userId).collection('data').doc('settings');
    const snap = await settingsRef.get();

    let settings: any;

    if (!snap.exists) {
        // First time user — create defaults
        settings = {
            user_id: userId,
            name: 'Operator',
            handle: 'neural_link',
            avatarColor: '#ffffff',
            customSystemPrompt: '',
            styles: '[]',
            linkedAccounts: '[]',
            xPostImages: true,
            xThreadImages: true,
            tier: 'Free',
            daily_analytics_count: 0,
            daily_content_count: 0,
            daily_image_count: 0,
            daily_chat_count: 0,
            total_analytics_count: 0,
            total_content_count: 0,
            monthly_gap_count: 0,
            last_usage_reset: today,
            last_monthly_reset: thisMonth,
        };
        await settingsRef.set(settings);
    } else {
        settings = snap.data()!;

        // Daily reset
        if (settings.last_usage_reset !== today) {
            const resetFields = {
                daily_analytics_count: 0,
                daily_content_count: 0,
                daily_image_count: 0,
                daily_chat_count: 0,
                last_usage_reset: today,
            };
            await settingsRef.update(resetFields);
            Object.assign(settings, resetFields);
        }

        // Monthly reset
        if (settings.last_monthly_reset !== thisMonth) {
            const monthlyReset = { monthly_gap_count: 0, last_monthly_reset: thisMonth };
            await settingsRef.update(monthlyReset);
            Object.assign(settings, monthlyReset);
        }
    }

    // ── Monthly subscription expiry check ──────────────────────────────────
    if (settings.tier === 'PRO_MONTHLY' && settings.subscriptionExpiry) {
        const expiry = new Date(settings.subscriptionExpiry);
        if (expiry < new Date()) {
            const downgradeFields = { tier: 'Free', subscriptionExpiry: null, subscriptionId: null };
            await settingsRef.update(downgradeFields);
            Object.assign(settings, downgradeFields);
            console.log(`⏰ PRO_MONTHLY expired for user ${userId} — downgraded to Free`);
        }
    }

    return {
        user: { id: userId, email: userEmail, tier: settings.tier || 'Free' },
        settings,
    };
}

export function checkLimit(type: string, user: any, settings: any) {
    const limits = TIER_LIMITS[user.tier] || TIER_LIMITS['Free'];

    if (type === 'marketingStudio' && !limits.marketingStudio) {
        return { error: 'MARKETING STUDIO RESTRICTED: Join PRO/LTD for access.' };
    }

    const usageField = `daily_${type}_count`;
    const totalField = `total_${type}_count`;

    if (limits.isOneTime) {
        if ((settings[totalField] ?? 0) >= limits[type]) {
            return { error: `ONE-TIME LIMIT REACHED: ${limits[type]} ${type} packets. Join PRO/LTD for daily resets.` };
        }
    } else {
        if ((settings[usageField] ?? 0) >= limits[type]) {
            return { error: `DAILY QUOTA REACHED: ${limits[type]} ${type} packets. Wait for next neural cycle or upgrade.` };
        }
    }

    return null;
}

export async function incrementUsage(type: string, userId: string) {
    const settingsRef = adminDb.collection('users').doc(userId).collection('data').doc('settings');
    await settingsRef.update({
        [`daily_${type}_count`]: FieldValue.increment(1),
        [`total_${type}_count`]: FieldValue.increment(1),
    });
}
