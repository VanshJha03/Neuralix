
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/SHIROX/lib/supabase';

export default function PaymentSuccessPage() {
    const [status, setStatus] = useState<'checking' | 'done' | 'timeout'>('checking');
    const [dots, setDots] = useState('');

    useEffect(() => {
        const dotInterval = setInterval(() => {
            setDots(d => d.length >= 3 ? '' : d + '.');
        }, 400);
        return () => clearInterval(dotInterval);
    }, []);

    useEffect(() => {
        let attempts = 0;
        const MAX_ATTEMPTS = 15; // 15 × 3s = 45s max

        const checkStatus = async () => {
            attempts++;
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('influencers')
                    .select('tier')
                    .eq('user_id', user.id)
                    .single();

                if (data && data.tier !== 'Free') {
                    setStatus('done');
                    clearInterval(pollInterval);
                    setTimeout(() => { window.location.href = '/'; }, 2000);
                } else if (attempts >= MAX_ATTEMPTS) {
                    setStatus('timeout');
                    clearInterval(pollInterval);
                }
            } catch (e) {
                console.error('Tier sync error:', e);
            }
        };

        const pollInterval = setInterval(checkStatus, 3000);
        checkStatus(); // Initial check

        return () => clearInterval(pollInterval);
    }, []);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 p-8 text-white">
            <div
                className="text-3xl font-normal tracking-tighter text-white font-normal"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
                CreatioX
            </div>

            {status === 'checking' && (
                <>
                    <div className="w-16 h-16 rounded-full border-2 border-zinc-900 border-t-white animate-spin" />
                    <div className="text-center space-y-2">
                        <p className="text-white font-normal uppercase tracking-widest text-xs">
                            Syncing Workspace{dots}
                        </p>
                        <p className="text-zinc-600 text-[9px] uppercase tracking-widest">
                            Verifying payment & upgrading your account
                        </p>
                    </div>
                </>
            )}

            {status === 'done' && (
                <>
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl animate-in zoom-in-90 duration-500">
                        ✓
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-white font-normal uppercase tracking-widest text-xs">Upgrade Complete</p>
                        <p className="text-zinc-600 text-[9px] uppercase tracking-widest">Redirecting to workspace...</p>
                    </div>
                </>
            )}

            {status === 'timeout' && (
                <div className="text-center space-y-4 animate-in fade-in duration-700">
                    <p className="text-white font-normal uppercase tracking-widest text-xs">Still processing...</p>
                    <p className="text-zinc-500 text-[10px] max-w-xs text-center leading-relaxed uppercase tracking-wide">
                        Your payment was received. It may take a moment to activate. Try refreshing in a few seconds.
                    </p>
                    <button
                        onClick={() => { window.location.href = '/'; }}
                        className="px-8 py-4 bg-white text-black text-[10px] font-normal uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all shadow-xl"
                    >
                        Go to Workspace
                    </button>
                </div>
            )}
        </div>
    );
}
