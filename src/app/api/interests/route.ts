
import { NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    const auth = await verifyRequest(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const snap = await adminDb
        .collection('users').doc(auth.user.id)
        .collection('interests')
        .get();

    const interests = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json(interests);
}

export async function POST(req: Request) {
    const auth = await verifyRequest(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const interests: { id: string; label: string; active: boolean }[] = await req.json();

    const collRef = adminDb.collection('users').doc(auth.user.id).collection('interests');

    // Delete all existing, then re-write (mirrors SQLite DELETE + INSERT pattern)
    const existing = await collRef.get();
    const batch = adminDb.batch();
    existing.docs.forEach(d => batch.delete(d.ref));
    interests.forEach(i => batch.set(collRef.doc(i.id), { label: i.label, active: i.active }));
    await batch.commit();

    return NextResponse.json({ success: true });
}
