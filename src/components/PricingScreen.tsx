

'use client';

import React, { useState } from 'react';
import { Check, Zap, ShieldCheck, Rocket, Crown, Star, Loader2, Gift } from 'lucide-react';
import NeuralLogo from './NeuralLogo';
import { supabase, getAuthToken } from '@/lib/supabase';
import { PRICING_CONFIG } from '@/constants';

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
    <div className={`relative group p-8 rounded-[3rem] bg-zinc-950 border ${popular ? 'border-white/20' : 'border-zinc-900'} hover:border-white/30 transition-all duration-500 flex flex-col h-full shadow-2xl overflow-hidden`}>
        {popular && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-white text-black text-[10px] font-normal uppercase tracking-widest rounded-full shadow-2xl z-10">
                Architect Choice
            </div>
        )}

        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-zinc-900 border border-zinc-800 transition-all group-hover:scale-110 group-hover:rotate-3 shadow-inner`} style={{ color: accent }}>
            {icon}
        </div>

        <h3 className="text-2xl font-normal text-white tracking-tighter mb-1 uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }}>{name}</h3>
        <div className="flex items-baseline gap-2 mb-10">
            <span className="text-4xl font-normal text-white tracking-tighter">{price}</span>
            {period && <span className="text-[10px] text-zinc-600 font-normal uppercase tracking-[0.3em]">{period}</span>}
        </div>

        <ul className="space-y-5 mb-12 flex-1">
            {features.map((f, i) => (
                <li key={i} className="flex items-start gap-4">
                    <Check size={16} className="text-white/20 mt-0.5 shrink-0" />
                    <span className="text-[11px] text-zinc-500 font-normal uppercase tracking-tight leading-relaxed">{f}</span>
                </li>
            ))}
        </ul>

        <button
            onClick={onSelect}
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-normal uppercase tracking-[0.3em] text-[10px] transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-xl ${popular ? 'bg-white text-black hover:bg-zinc-200' : isFree ? 'bg-transparent border border-zinc-900 text-zinc-700 hover:border-zinc-700 hover:text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-white/40 hover:text-white'}`}
        >
            {loading ? <Loader2 size={14} className="animate-spin" /> : isFree ? 'Maintain Free' : `Initialize ${name}`}
        </button>
    </div>
);

interface PricingScreenProps {
    onSelectTier: (tier: string) => void;
}

const PricingScreen: React.FC<PricingScreenProps> = ({ onSelectTier }) => {
    const [loadingTier, setLoadingTier] = useState<string | null>(null);
    const [coupon, setCoupon] = useState('');
    const masterCoupon = process.env.NEXT_PUBLIC_COUPON_CODE || 'LTD2024';
    const isLTDUnlocked = coupon.toUpperCase() === masterCoupon.toUpperCase();

    const handleSelect = async (tierKey: string, isFree: boolean) => {
        if (isFree) {
            onSelectTier(tierKey);
            return;
        }

        setLoadingTier(tierKey);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Authentication required to bind trajectory.');
                return;
            }

            const token = await getAuthToken();
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
                throw new Error(data.error || 'Connection to Dodo failed');
            }
        } catch (error: any) {
            console.error('Checkout error:', error);
            alert(`Neural Link Error: ${error.message}`);
        } finally {
            setLoadingTier(null);
        }
    };

    const displayTiers = isLTDUnlocked ? [
        {
            ...PRICING_CONFIG.LTD_BASIC,
            name: 'LTD Basic',
            icon: <ShieldCheck size={28} />,
            accent: '#a1a1aa'
        },
        {
            ...PRICING_CONFIG.LTD_PRO,
            name: 'LTD Pro',
            icon: <Crown size={28} />,
            accent: '#ffffff',
            popular: true
        }
    ] : [
        {
            name: 'Free',
            tierKey: 'Free',
            price: '$0',
            period: '/mo',
            features: ['5 Trend Analysis (One-time)', '5 Post Drafting (One-time)', 'Research Studio: Disabled', '1 Niche Analysis'],
            icon: <Star size={28} />,
            accent: '#52525b',
            isFree: true
        },
        {
            ...PRICING_CONFIG.MONTHLY,
            name: 'Pro Monthly',
            icon: <Rocket size={28} />,
            accent: '#ffffff',
            popular: true
        },
        {
            ...PRICING_CONFIG.ANNUAL,
            name: 'Pro Annual',
            icon: <Zap size={28} />,
            accent: '#ffffff'
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] min-h-screen bg-black p-6 lg:p-12 overflow-y-auto selection:bg-white selection:text-black">
            <div className="max-w-6xl mx-auto flex flex-col items-center">
                <div className="mb-16 flex flex-col items-center text-center">
                    <NeuralLogo size={70} />
                    <h2 className="text-5xl lg:text-7xl font-normal text-white mt-10 tracking-tighter font-normal" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                        {isLTDUnlocked ? 'LIFETIME ACCESS' : 'EVOLUTION TIER'}
                    </h2>
                    <p className="text-zinc-600 text-[10px] lg:text-[13px] uppercase tracking-[0.6em] font-normal mt-6 max-w-xl leading-relaxed">
                        {isLTDUnlocked ? 'Exclusive lifetime trajectories unlocked via clearance code.' : 'Select your operational trajectory. Upgrade to unlock full neural capacity.'}
                    </p>
                </div>

                {/* Coupon Input */}
                <div className="mb-20 w-full max-w-xs relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-white transition-colors">
                        <Gift size={16} />
                    </div>
                    <input 
                        type="text" 
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        placeholder="ENTER ACCESS CODE"
                        className="w-full bg-zinc-950 border border-zinc-900 focus:border-white/20 rounded-2xl py-4 pl-12 pr-6 text-[10px] font-normal tracking-[0.3em] text-white placeholder:text-zinc-800 outline-none transition-all text-center uppercase"
                    />
                    {isLTDUnlocked && (
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] text-green-500 uppercase tracking-widest animate-pulse whitespace-nowrap">
                            LTD DEALS UNLOCKED
                        </div>
                    )}
                </div>

                <div className={`grid grid-cols-1 gap-8 w-full mb-20 ${isLTDUnlocked ? 'md:grid-cols-2 max-w-4xl' : 'md:grid-cols-3'}`}>
                    {displayTiers.map(t => (
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

                <div className="flex flex-col items-center gap-4 opacity-30">
                    <p className="text-zinc-500 text-[9px] uppercase tracking-[0.4em] font-normal text-center">
                        Secure Transmission by Dodo Payments · Encrypted Trajectory
                    </p>
                    <div className="flex items-center gap-8">
                        <div className="h-px w-12 bg-zinc-800" />
                        <ShieldCheck size={20} className="text-zinc-600" />
                        <div className="h-px w-12 bg-zinc-800" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingScreen;
