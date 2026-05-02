
'use client';

import React, { useState } from 'react';
import { Check, Zap, ShieldCheck, Rocket, Crown, Star, Loader2 } from 'lucide-react';
import NeuralLogo from './NeuralLogo';
import { auth } from '@/lib/firebase';

interface TierCardProps {
    name: string;
    price: string;
    period?: string;
    features: string[];
    icon: React.ReactNode;
    popular?: boolean;
    onSelect: () => void;
    accent: string;
    isFree?: boolean;
    loading?: boolean;
}

const TierCard: React.FC<TierCardProps> = ({ name, price, period, features, icon, popular, onSelect, accent, isFree, loading }) => (
    <div className={`relative group p-6 rounded-[2.5rem] bg-zinc-950 border ${popular ? 'border-white/20' : 'border-zinc-900'} hover:border-white/30 transition-all duration-500 flex flex-col h-full shadow-2xl`}>
        {popular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl">
                Most Popular
            </div>
        )}

        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-zinc-900 border border-zinc-800 transition-all group-hover:scale-110`} style={{ color: accent }}>
            {icon}
        </div>

        <h3 className="text-xl font-black text-white tracking-tighter mb-1 uppercase lg:text-2xl">{name}</h3>
        <div className="flex items-baseline gap-1 mb-8">
            <span className="text-3xl font-black text-white italic">{price}</span>
            {period && <span className="text-xs text-zinc-600 font-bold uppercase tracking-widest">{period}</span>}
        </div>

        <ul className="space-y-4 mb-10 flex-1">
            {features.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                    <Check size={14} className="text-zinc-500 mt-0.5 shrink-0" />
                    <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-tight leading-tight">{f}</span>
                </li>
            ))}
        </ul>

        <button
            onClick={onSelect}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all transform active:scale-95 flex items-center justify-center gap-2 ${popular ? 'bg-white text-black hover:bg-zinc-200' : isFree ? 'bg-transparent border border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-white/40 hover:text-white'}`}
        >
            {loading ? <Loader2 size={14} className="animate-spin" /> : isFree ? 'Continue Free' : `Activate ${name}`}
        </button>
    </div>
);

interface PricingScreenProps {
    onSelectTier: (tier: string) => void;
}

const PricingScreen: React.FC<PricingScreenProps> = ({ onSelectTier }) => {
    const [loadingTier, setLoadingTier] = useState<string | null>(null);

    const handleSelect = async (tierKey: string, isFree: boolean) => {
        if (isFree) {
            onSelectTier(tierKey);
            return;
        }

        setLoadingTier(tierKey);
        try {
            const user = auth.currentUser;
            if (!user) {
                alert('Authentication required.');
                return;
            }

            const token = await user.getIdToken();
            const response = await fetch('/api/checkout/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ tierKey }),
            });

            const data = await response.json();
            if (data.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                throw new Error(data.error || 'Failed to initiate checkout');
            }
        } catch (error: any) {
            console.error('Checkout error:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoadingTier(null);
        }
    };

    const tiers = [
        {
            name: 'Free',
            tierKey: 'Free',
            price: '$0',
            features: ['5 Trend Analyses (one-time)', '5 AI Posts (one-time)', 'Marketing Studio: Disabled', '1 Niche Analysis', 'Gap Analysis: None'],
            icon: <Star size={24} />,
            accent: '#71717a',
            isFree: true,
        },
        {
            name: 'PRO Monthly',
            tierKey: 'PRO_MONTHLY',
            price: '$19.99',
            period: '/mo',
            features: ['5 Analyses / day', '10 AI Posts / day', 'Marketing Studio (10 / day)', '5 Niche Analyses / day', '5 Gap Analyses / day', '100 AI Chats / day'],
            icon: <Rocket size={24} />,
            popular: true,
            accent: '#ffffff',
            isFree: false,
        },
        {
            name: 'LTD',
            tierKey: 'LTD',
            price: '$79.99',
            features: ['2 Analyses / day', '5 AI Posts / day', 'Marketing Studio (5 / day)', '3 Niche Analyses / day', '3 Gap Analyses / day', '50 AI Chats / day'],
            icon: <ShieldCheck size={24} />,
            accent: '#a1a1aa',
            isFree: false,
        },
        {
            name: 'LTD Pro',
            tierKey: 'LTD_PRO',
            price: '$139.99',
            features: ['5 Analyses / day', '10 AI Posts / day', 'Marketing Studio (10 / day)', '5 Niche Analyses / day', '5 Gap Analyses / day', '999 AI Chats / day'],
            icon: <Crown size={24} />,
            accent: '#e4e4e7',
            isFree: false,
        },
    ];

    return (
        <div className="fixed inset-0 z-[100] min-h-screen bg-black p-6 lg:p-12 overflow-y-auto">
            <div className="max-w-6xl mx-auto flex flex-col items-center">
                <div className="mb-12 flex flex-col items-center text-center">
                    <NeuralLogo size={60} />
                    <h2 className="text-4xl lg:text-6xl font-black text-white mt-8 tracking-tighter italic" style={{ fontFamily: "'Orbitron', sans-serif" }}>Choose Your Evolution</h2>
                    <p className="text-zinc-600 text-[10px] lg:text-[12px] uppercase tracking-[0.5em] font-black mt-4 max-w-md">Upgrade your neural capacity. Select the tier that matches your trajectory.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-12">
                    {tiers.map(t => (
                        <TierCard
                            key={t.tierKey}
                            name={t.name}
                            price={t.price}
                            period={t.period}
                            features={t.features}
                            icon={t.icon}
                            popular={t.popular}
                            accent={t.accent}
                            isFree={t.isFree}
                            loading={loadingTier === t.tierKey}
                            onSelect={() => handleSelect(t.tierKey, t.isFree)}
                        />
                    ))}
                </div>

                <p className="text-zinc-800 text-[9px] uppercase tracking-widest font-black text-center">
                    Payments secured by Dodo Payments · All prices in USD
                </p>
            </div>
        </div>
    );
};

export default PricingScreen;
