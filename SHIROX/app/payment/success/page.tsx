'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentSuccess() {
  const router = useRouter();
  useEffect(() => {
    // Give webhook a moment to process, then redirect home
    const t = setTimeout(() => router.push('/'), 3000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-white">
      <div className="text-4xl font-black tracking-tighter" style={{ fontFamily: "'Orbitron', sans-serif" }}>
        Neural Link Upgraded
      </div>
      <p className="text-zinc-500 text-sm">Redirecting to workspace...</p>
    </div>
  );
}
