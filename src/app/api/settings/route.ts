
import { NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    const auth = await verifyRequest(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    return NextResponse.json(auth.settings);
}

export async function POST(req: Request) {
    const auth = await verifyRequest(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await req.json();
    const { name, handle, avatarColor, customSystemPrompt, styles, linkedAccounts, xPostImages, xThreadImages, tier } = body;

    const settingsRef = adminDb
        .collection('users')
        .doc(auth.user.id)
        .collection('data')
        .doc('settings');

    await settingsRef.update({
        ...(name !== undefined && { name }),
        ...(handle !== undefined && { handle }),
        ...(avatarColor !== undefined && { avatarColor }),
        ...(customSystemPrompt !== undefined && { customSystemPrompt }),
        ...(styles !== undefined && { styles: JSON.stringify(styles) }),
        ...(linkedAccounts !== undefined && { linkedAccounts: JSON.stringify(linkedAccounts) }),
        ...(xPostImages !== undefined && { xPostImages }),
        ...(xThreadImages !== undefined && { xThreadImages }),
        ...(tier !== undefined && { tier }),
    });

    return NextResponse.json({ success: true });
}
