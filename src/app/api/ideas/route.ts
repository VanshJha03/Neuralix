
import { NextResponse } from 'next/server';
import { verifyRequest } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    const auth = await verifyRequest(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const snap = await adminDb
        .collection('users').doc(auth.user.id)
        .collection('ideas')
        .orderBy('timestamp', 'desc')
        .get();

    const ideas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json(ideas);
}

export async function POST(req: Request) {
    const auth = await verifyRequest(req);
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const ideas: { id: string; title: string; content: string; type: string; timestamp: number }[] = await req.json();

    const collRef = adminDb.collection('users').doc(auth.user.id).collection('ideas');

    const existing = await collRef.get();
    const batch = adminDb.batch();
    existing.docs.forEach(d => batch.delete(d.ref));
    ideas.forEach(idea => batch.set(collRef.doc(idea.id), {
        title: idea.title,
        content: idea.content,
        type: idea.type,
        timestamp: idea.timestamp,
    }));
    await batch.commit();

    return NextResponse.json({ success: true });
}
