
import { NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    const auth = await verifyRequest(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const snap = await adminDb
        .collection('users').doc(auth.user.id)
        .collection('archive')
        .orderBy('order', 'asc')
        .get();

    const messages = snap.docs.map(d => {
        const data = d.data();
        return { id: d.id, role: data.role, content: data.content, mode: data.mode };
    });
    return NextResponse.json(messages);
}

export async function POST(req: Request) {
    const auth = await verifyRequest(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { messages }: { messages: { id: string; role: string; content: string; mode: string }[] } = await req.json();

    const collRef = adminDb.collection('users').doc(auth.user.id).collection('archive');

    const existing = await collRef.get();
    const batch = adminDb.batch();
    existing.docs.forEach(d => batch.delete(d.ref));
    messages.forEach((msg, idx) => batch.set(collRef.doc(msg.id), {
        role: msg.role,
        content: msg.content,
        mode: msg.mode,
        order: idx,
    }));
    await batch.commit();

    return NextResponse.json({ success: true });
}
