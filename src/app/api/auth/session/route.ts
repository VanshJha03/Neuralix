
import { auth } from 'firebase-admin';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    const { idToken } = await request.json();

    // Set session expiration to 5 days
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    try {
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
        const cookieStore = await cookies();
        
        cookieStore.set('session', sessionCookie, {
            maxAge: expiresIn,
            httpOnly: true,
            secure: true,
            path: '/',
        });

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}

export async function DELETE() {
    (await cookies()).delete('session');
    return NextResponse.json({ status: 'success' });
}
