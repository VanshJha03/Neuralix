
import { NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(req: Request) {
    const auth = await verifyRequest(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const snap = await adminDb
        .collection('users').doc(auth.user.id)
        .collection('memories')
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();

    const packets = snap.docs.map(d => d.data().packet as string);
    return NextResponse.json(packets);
}

export async function POST(req: Request) {
    const auth = await verifyRequest(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { packet, category } = await req.json();
    if (!packet) return NextResponse.json({ error: 'No packet provided' }, { status: 400 });

    // Use a hash of the packet as doc ID to prevent duplicates (mirrors SQLite UNIQUE constraint)
    const docId = Buffer.from(packet).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 40);

    await adminDb
        .collection('users').doc(auth.user.id)
        .collection('memories').doc(docId)
        .set({
            packet,
            category: category || 'general',
            timestamp: FieldValue.serverTimestamp(),
        }, { merge: true });

    return NextResponse.json({ success: true });
}
