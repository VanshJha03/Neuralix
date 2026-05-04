import React, { useState } from 'react';
import { Check, Zap, Crown, Loader2, Ticket } from 'lucide-react';
import NeuralLogo from './NeuralLogo';

const FULL_FEATURES = [
    '30 Niche Analytics / month',
    '30 Gap Analysis / month',
    '500 User Chats / month',
    '100 Post Generations / month',
    '100 Images embedded with posts',
    '60 Trend Analysis / month',
];

const HALF_FEATURES = [
    '15 Niche Analytics / month',
    '15 Gap Analysis / month',
    '250 User Chats / month',
    '50 Post Generations / month',
    '50 Images embedded with posts',
    '30 Trend Analysis / month',
];

const DOUBLE_FEATURES = [
    '60 Niche Analytics / month',
    '60 Gap Analysis / month',
    '1000 User Chats / month',
    '200 Post Generations / month',
    '200 Images embedded with posts',
    '120 Trend Analysis / month',
];

interface PricingScreenProps {
    onSelectTier: (tier: string) => void;
}

const PricingScreen: React.FC<PricingScreenProps> = ({ onSelectTier }) => {
    const [loading, setLoading] = useState<string | null>(null);
    const [coupon, setCoupon] = useState('');
    const [isSecretRevealed, setIsSecretRevealed] = useState(false);

    const handleCouponCheck = (val: string) => {
        setCoupon(val);
        // Verify WAVE18 coupon code - case insensitive, trim whitespace
        const isValidCoupon = val.trim().toUpperCase() === 'WAVE18';
        if (isValidCoupon) {
            setIsSecretRevealed(true);
        }
    };

    const handleClick = async (tier: string) => {
        setLoading(tier);
        try {
            await onSelectTier(tier);
        } finally {
            // Keep loading until redirect happens
        }
    };

    return (
        <div className="min-h-full bg-black flex flex-col items-center justify-start p-6 lg:p-12 overflow-y-auto">
            <div className="max-w-4xl w-full mx-auto flex flex-col items-center mt-4 sm:mt-12">
                <div className="mb-8 flex flex-col items-center text-center">
                    <NeuralLogo size={52} />
                    <h2 className="text-3xl lg:text-5xl font-normal text-white mt-8 tracking-tighter">
                        Activate Professional Plan
                    </h2>
                    <p className="text-zinc-600 text-[11px] uppercase tracking-[0.4em] font-normal mt-3">
                        {isSecretRevealed ? 'Secret Tiers Unlocked' : 'A subscription is required to access CreatioX'}
                    </p>
                </div>

                {/* Coupon Input - High Visibility */}
                <div className="mb-12 w-full max-w-sm relative group">
                    <div className="absolute inset-0 bg-white/5 rounded-2xl blur-xl group-focus-within:bg-white/10 transition-all"></div>
                    <div className={`relative bg-zinc-950 border rounded-2xl py-1.5 flex items-center transition-all ${isSecretRevealed ? 'border-green-700 bg-green-950/20' : 'border-zinc-800 group-focus-within:border-zinc-700'}`}>
                        <div className={`pl-5 transition-colors ${isSecretRevealed ? 'text-green-500' : 'text-zinc-700 group-focus-within:text-white'}`}>
                            <Ticket size={16} />
                        </div>
                        {!isSecretRevealed ? (
                            <>
                                <input
                                    type="text"
                                    value={coupon}
                                    onChange={(e) => handleCouponCheck(e.target.value)}
                                    placeholder="HAVE A COUPON CODE?"
                                    className="w-full bg-transparent border-none py-3 pl-4 pr-32 text-[11px] uppercase tracking-[0.3em] text-white placeholder:text-zinc-800 focus:outline-none"
                                />
                                <button
                                    onClick={() => handleCouponCheck(coupon)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-white text-black text-[9px] uppercase tracking-widest font-normal rounded-xl hover:bg-zinc-200 transition-all active:scale-95"
                                >
                                    Verify
                                </button>
                            </>
                        ) : (
                            <span className="w-full py-3 pl-4 text-[11px] uppercase tracking-[0.3em] text-green-400 font-normal">
                                ✓ Coupon Verified · LTD Tiers Unlocked
                            </span>
                        )}
                    </div>
                    {coupon.length > 0 && !isSecretRevealed && (
                        <p className="absolute -bottom-6 left-0 w-full text-center text-[9px] uppercase tracking-widest text-zinc-600">
                            Verifying code...
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                    {!isSecretRevealed ? (
                        <>
                            {/* MONTHLY */}
                            <div className="relative p-8 rounded-[2.5rem] bg-zinc-950 border border-zinc-800 hover:border-zinc-600 transition-all flex flex-col">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 text-zinc-400">
                                    <Zap size={22} />
                                </div>
                                <h3 className="text-2xl font-normal text-white tracking-tight uppercase mb-1">Professional</h3>
                                <p className="text-zinc-600 text-[10px] uppercase tracking-widest mb-6">Monthly · Cancel anytime</p>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-normal text-white">$69</span>
                                    <span className="text-xs text-zinc-600 font-normal uppercase tracking-widest">/mo</span>
                                </div>
                                <ul className="space-y-3 mb-10 flex-1">
                                    {FULL_FEATURES.map(f => (
                                        <li key={f} className="flex items-start gap-3">
                                            <Check size={13} className="text-zinc-500 mt-0.5 shrink-0" />
                                            <span className="text-[11px] text-zinc-400 font-normal uppercase tracking-tight leading-tight">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => handleClick('MONTHLY')}
                                    disabled={!!loading}
                                    className="w-full py-4 rounded-xl font-normal uppercase tracking-[0.2em] text-[10px] border border-zinc-700 text-zinc-300 hover:border-white hover:text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading === 'MONTHLY' ? <><Loader2 size={14} className="animate-spin" /> Redirecting...</> : 'Select Monthly — $69'}
                                </button>
                            </div>

                            {/* YEARLY */}
                            <div className="relative p-8 rounded-[2.5rem] bg-white border border-white flex flex-col">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black text-white text-[9px] font-normal uppercase tracking-widest rounded-full shadow-xl">
                                    Save 65%
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-black/10 flex items-center justify-center mb-6 text-black">
                                    <Crown size={22} />
                                </div>
                                <h3 className="text-2xl font-normal text-black tracking-tight uppercase mb-1">Elite Access</h3>
                                <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-6">Yearly · Full Access</p>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-normal text-black">$299</span>
                                    <span className="text-xs text-zinc-500 font-normal uppercase tracking-widest">/year</span>
                                </div>
                                <ul className="space-y-3 mb-10 flex-1">
                                    {FULL_FEATURES.map(f => (
                                        <li key={f} className="flex items-start gap-3">
                                            <Check size={13} className="text-zinc-500 mt-0.5 shrink-0" />
                                            <span className="text-[11px] text-zinc-700 font-normal uppercase tracking-tight leading-tight">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => handleClick('YEARLY')}
                                    disabled={!!loading}
                                    className="w-full py-4 rounded-xl font-normal uppercase tracking-[0.2em] text-[10px] bg-black text-white hover:bg-zinc-900 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading === 'YEARLY' ? <><Loader2 size={14} className="animate-spin" /> Redirecting...</> : 'Select Yearly — $299'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* LTD 49 (Half Features) */}
                            <div className="relative p-8 rounded-[2.5rem] bg-zinc-950 border border-zinc-800 hover:border-zinc-600 transition-all flex flex-col">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 text-zinc-400">
                                    <Ticket size={22} />
                                </div>
                                <h3 className="text-2xl font-normal text-white tracking-tight uppercase mb-1">Starter</h3>
                                <p className="text-zinc-600 text-[10px] uppercase tracking-widest mb-6">Lifetime · Limited Features</p>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-normal text-white">$49</span>
                                    <span className="text-xs text-zinc-600 font-normal uppercase tracking-widest">once</span>
                                </div>
                                <ul className="space-y-3 mb-10 flex-1">
                                    {HALF_FEATURES.map(f => (
                                        <li key={f} className="flex items-start gap-3">
                                            <Check size={13} className="text-zinc-500 mt-0.5 shrink-0" />
                                            <span className="text-[11px] text-zinc-400 font-normal uppercase tracking-tight leading-tight">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => handleClick('LTD_49')}
                                    disabled={!!loading}
                                    className="w-full py-4 rounded-xl font-normal uppercase tracking-[0.2em] text-[10px] border border-zinc-700 text-zinc-300 hover:border-white hover:text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading === 'LTD_49' ? <><Loader2 size={14} className="animate-spin" /> Redirecting...</> : 'Get LTD — $49'}
                                </button>
                            </div>

                            {/* LTD 129 (Full Features) */}
                            <div className="relative p-8 rounded-[2.5rem] bg-white border border-white flex flex-col">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-600 text-white text-[9px] font-normal uppercase tracking-widest rounded-full shadow-xl">
                                    Best Deal
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-black/10 flex items-center justify-center mb-6 text-black">
                                    <Crown size={22} />
                                </div>
                                <h3 className="text-2xl font-normal text-black tracking-tight uppercase mb-1">Lifetime</h3>
                                <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-6">Lifetime · Double Access</p>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-normal text-black">$129</span>
                                    <span className="text-xs text-zinc-500 font-normal uppercase tracking-widest">once</span>
                                </div>
                                <ul className="space-y-3 mb-10 flex-1">
                                    {DOUBLE_FEATURES.map(f => (
                                        <li key={f} className="flex items-start gap-3">
                                            <Check size={13} className="text-zinc-500 mt-0.5 shrink-0" />
                                            <span className="text-[11px] text-zinc-700 font-normal uppercase tracking-tight leading-tight">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => handleClick('LTD_129')}
                                    disabled={!!loading}
                                    className="w-full py-4 rounded-xl font-normal uppercase tracking-[0.2em] text-[10px] bg-black text-white hover:bg-zinc-900 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading === 'LTD_129' ? <><Loader2 size={14} className="animate-spin" /> Redirecting...</> : 'Get Lifetime — $129'}
                                </button>
                            </div>
                        </>
                    )}
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
