'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function PaymentSuccess() {
  const router = useRouter();
  const [status, setStatus] = useState<'polling' | 'confirmed' | 'timeout'>('polling');

  useEffect(() => {
    let attempts = 0;
    const MAX_ATTEMPTS = 12; // 12 × 2.5 s = 30 s max wait
    let interval: ReturnType<typeof setInterval>;

    const poll = async () => {
      attempts++;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/'); return; }

        const { data: row } = await supabase
          .from('influencers')
          .select('tier')
          .eq('user_id', user.id)
          .single();

        const tier = row?.tier as string | undefined;
        if (tier && (tier === 'PRO' || tier === 'LTD')) {
          clearInterval(interval);
          setStatus('confirmed');
          // Short delay so the user can read the success message
          setTimeout(() => router.push('/'), 1500);
          return;
        }
      } catch {
        // Swallow errors — keep polling
      }

      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(interval);
        setStatus('timeout');
        // Redirect anyway — the webhook may still arrive shortly
        setTimeout(() => router.push('/'), 2000);
      }
    };

    // First poll immediately, then every 2.5 s
    poll();
    interval = setInterval(poll, 2500);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 text-white">
      <div
        className="text-4xl font-normal tracking-tighter"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        {status === 'confirmed' ? '✓ Neural Link Upgraded' : 'Activating Access…'}
      </div>

      {status === 'polling' && (
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}

      <p className="text-zinc-500 text-sm">
        {status === 'confirmed'
          ? 'Redirecting to workspace…'
          : status === 'timeout'
          ? 'Taking longer than expected — redirecting…'
          : 'Verifying your subscription…'}
      </p>
    </div>
  );
}
