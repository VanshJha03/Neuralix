
'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function PaymentSuccessPage() {
    const [status, setStatus] = useState<'checking' | 'done' | 'timeout'>('checking');
    const [dots, setDots] = useState('');

    useEffect(() => {
        // Animated dots
        const dotInterval = setInterval(() => {
            setDots(d => d.length >= 3 ? '' : d + '.');
        }, 400);
        return () => clearInterval(dotInterval);
    }, []);

    useEffect(() => {
        let attempts = 0;
        const MAX_ATTEMPTS = 20; // 20 × 3s = 60s max

        const check = async () => {
            attempts++;
            const user = auth.currentUser;
            if (!user) return;

            try {
                const token = await user.getIdToken(true); // force refresh
                const res = await fetch('/api/settings', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();

                if (data.tier && data.tier !== 'Free') {
                    setStatus('done');
                    clearInterval(pollInterval);
                    setTimeout(() => { window.location.href = '/'; }, 2000);
                } else if (attempts >= MAX_ATTEMPTS) {
                    setStatus('timeout');
                    clearInterval(pollInterval);
                }
            } catch (e) {
                console.error('Poll error:', e);
            }
        };

        // Also wait for auth to be ready
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) check(); // initial check
        });

        const pollInterval = setInterval(check, 3000);

        return () => {
            clearInterval(pollInterval);
            unsubscribe();
        };
    }, []);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 p-8">
            <div
                className="text-3xl font-normal tracking-tighter text-white font-normal"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
                Creatiox
            </div>

            {status === 'checking' && (
                <>
                    <div className="w-16 h-16 rounded-full border-2 border-zinc-800 border-t-white animate-spin" />
                    <div className="text-center space-y-2">
                        <p className="text-white font-normal uppercase tracking-widest text-sm">
                            Syncing Neural Link{dots}
                        </p>
                        <p className="text-zinc-600 text-[10px] uppercase tracking-widest">
                            Verifying payment &amp; upgrading your tier
                        </p>
                    </div>
                </>
            )}

            {status === 'done' && (
                <>
                    <div className="w-16 h-16 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-3xl">
                        ✓
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-white font-normal uppercase tracking-widest text-sm">Access Granted</p>
                        <p className="text-zinc-600 text-[10px] uppercase tracking-widest">Redirecting to Creatiox...</p>
                    </div>
                </>
            )}

            {status === 'timeout' && (
                <div className="text-center space-y-4">
                    <p className="text-white font-normal uppercase tracking-widest text-sm">Still processing...</p>
                    <p className="text-zinc-500 text-[11px] max-w-xs text-center leading-relaxed">
                        Your payment was received. It may take a moment to activate. Try refreshing the app in a few seconds.
                    </p>
                    <button
                        onClick={() => { window.location.href = '/'; }}
                        className="px-6 py-3 bg-white text-black text-[10px] font-normal uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all"
                    >
                        Go to App
                    </button>
                </div>
            )}
        </div>
    );
}
