import React, { useState } from 'react';
import { Check, Zap, Crown, Loader2 } from 'lucide-react';
import NeuralLogo from './NeuralLogo';

const FEATURES = [
    '30 Niche Analytics / month',
    '30 Gap Analysis / month',
    '500 User Chats / month',
    '100 Post Generations / month',
    '100 Images embedded with posts',
    '60 Trend Analysis / month',
];

interface PricingScreenProps {
    onSelectTier: (tier: string) => void;
}

const PricingScreen: React.FC<PricingScreenProps> = ({ onSelectTier }) => {
    const [loading, setLoading] = useState<'PRO' | 'LTD' | null>(null);

    const handleClick = async (tier: 'PRO' | 'LTD') => {
        setLoading(tier);
        try {
            await onSelectTier(tier);
        } finally {
            // Keep loading until redirect happens — don't reset
        }
    };

    return (
        <div className="min-h-dvh bg-black flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto">
            <div className="max-w-4xl w-full mx-auto flex flex-col items-center">
                <div className="mb-12 flex flex-col items-center text-center">
                    <NeuralLogo size={52} />
                    <h2 className="text-3xl lg:text-5xl font-normal text-white mt-8 tracking-tighter font-normal" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                        Activate Your Plan
                    </h2>
                    <p className="text-zinc-600 text-[11px] uppercase tracking-[0.4em] font-normal mt-3">
                        A subscription is required to access Creatio
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                    {/* PRO Monthly */}
                    <div className="relative p-8 rounded-[2.5rem] bg-zinc-950 border border-zinc-800 hover:border-zinc-600 transition-all flex flex-col">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 text-zinc-400">
                            <Zap size={22} />
                        </div>
                        <h3 className="text-2xl font-normal text-white tracking-tighter uppercase mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>PRO</h3>
                        <p className="text-zinc-600 text-[10px] uppercase tracking-widest mb-6">Monthly · Cancel anytime</p>
                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-4xl font-normal text-white">$49</span>
                            <span className="text-xs text-zinc-600 font-normal uppercase tracking-widest">/mo</span>
                        </div>
                        <ul className="space-y-3 mb-10 flex-1">
                            {FEATURES.map(f => (
                                <li key={f} className="flex items-start gap-3">
                                    <Check size={13} className="text-zinc-500 mt-0.5 shrink-0" />
                                    <span className="text-[11px] text-zinc-400 font-normal uppercase tracking-tight leading-tight">{f}</span>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => handleClick('PRO')}
                            disabled={!!loading}
                            className="w-full py-4 rounded-xl font-normal uppercase tracking-[0.2em] text-[10px] border border-zinc-700 text-zinc-300 hover:border-white hover:text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading === 'PRO' ? <><Loader2 size={14} className="animate-spin" /> Redirecting...</> : 'Start PRO — $49/mo'}
                        </button>
                    </div>

                    {/* LTD */}
                    <div className="relative p-8 rounded-[2.5rem] bg-white border border-white flex flex-col">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black text-white text-[9px] font-normal uppercase tracking-widest rounded-full shadow-xl">
                            Best Value
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-black/10 flex items-center justify-center mb-6 text-black">
                            <Crown size={22} />
                        </div>
                        <h3 className="text-2xl font-normal text-black tracking-tighter uppercase mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>LTD</h3>
                        <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-6">Lifetime · Pay once</p>
                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-4xl font-normal text-black">$129</span>
                            <span className="text-xs text-zinc-500 font-normal uppercase tracking-widest">once</span>
                        </div>
                        <ul className="space-y-3 mb-10 flex-1">
                            {FEATURES.map(f => (
                                <li key={f} className="flex items-start gap-3">
                                    <Check size={13} className="text-zinc-500 mt-0.5 shrink-0" />
                                    <span className="text-[11px] text-zinc-700 font-normal uppercase tracking-tight leading-tight">{f}</span>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => handleClick('LTD')}
                            disabled={!!loading}
                            className="w-full py-4 rounded-xl font-normal uppercase tracking-[0.2em] text-[10px] bg-black text-white hover:bg-zinc-900 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading === 'LTD' ? <><Loader2 size={14} className="animate-spin" /> Redirecting...</> : 'Get Lifetime — $129'}
                        </button>
                    </div>
                </div>

                <p className="text-zinc-700 text-[10px] uppercase tracking-widest mt-10 text-center">
                    All limits reset monthly · Secure checkout via Dodo Payments
                </p>

                {/* Sign out link */}
                <button
                    onClick={() => { import('../lib/supabase').then(m => m.supabase.auth.signOut()); }}
                    className="mt-6 text-zinc-800 hover:text-zinc-600 text-[10px] uppercase tracking-widest transition-colors"
                >
                    Sign out
                </button>
            </div>
        </div>
    );
};

export default PricingScreen;
