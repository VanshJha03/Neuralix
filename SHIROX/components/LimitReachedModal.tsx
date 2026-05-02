import React, { useState } from 'react';
import { Zap, Shield, X, Crown, ArrowRight, Loader2 } from 'lucide-react';

interface LimitReachedModalProps {
    message: string;
    isGuest: boolean;
    onClose: () => void;
}

const LimitReachedModal: React.FC<LimitReachedModalProps> = ({ message, isGuest, onClose }) => {
    const [loading, setLoading] = useState<'pro' | 'ltd' | null>(null);

    const handleUpgrade = async (tier: 'pro' | 'ltd') => {
        setLoading(tier);
        try {
            const res = await fetch(`/api/payments/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier }),
            });
            const data = await res.json();
            if (data.checkout_url) {
                window.location.href = data.checkout_url;
            }
        } catch (e) {
            console.error('Checkout error:', e);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0a0a0a] border border-zinc-800 rounded-[2.5rem] p-8 shadow-[0_0_100px_rgba(255,255,255,0.04)] relative overflow-hidden">
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-white/3 rounded-full blur-3xl pointer-events-none" />

                <button onClick={onClose} className="absolute top-6 right-6 text-zinc-700 hover:text-white transition-colors">
                    <X size={18} />
                </button>

                <div className="relative z-10">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-[1.25rem] bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <Shield size={28} className="text-zinc-500" />
                    </div>

                    <h3 className="text-xl font-black text-white mb-2 tracking-tighter italic text-center">
                        Monthly Limit Reached
                    </h3>
                    <p className="text-xs text-zinc-500 mb-8 leading-relaxed font-medium text-center">
                        {message.startsWith('NO_SUBSCRIPTION')
                            ? 'You need an active subscription to use this feature.'
                            : message.replace(/NEURAL LIMIT:.*?—\s*/i, '').replace(/\. Upgrade to continue\./i, '.')}
                    </p>

                    {/* Feature list */}
                    <div className="p-5 bg-white/5 border border-white/10 rounded-2xl mb-6">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-4">Both plans include:</p>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                '30 Niche Analytics/mo',
                                '30 Gap Analysis/mo',
                                '500 Chats/mo',
                                '100 Post Gen/mo',
                                '100 AI Images/mo',
                                '60 Trend Analysis/mo',
                            ].map(f => (
                                <div key={f} className="flex items-center gap-2">
                                    <Zap size={9} className="text-white flex-shrink-0" />
                                    <span className="text-[10px] text-zinc-300 font-semibold">{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upgrade buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <button
                            onClick={() => handleUpgrade('pro')}
                            disabled={!!loading}
                            className="flex flex-col items-center py-4 px-3 bg-zinc-900 border border-zinc-700 hover:border-white rounded-2xl transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading === 'pro' ? <Loader2 size={16} className="animate-spin mb-1" /> : <Zap size={16} className="mb-1 text-zinc-400" />}
                            <span className="text-[11px] font-black text-white uppercase tracking-wider">PRO</span>
                            <span className="text-[10px] text-zinc-500 font-bold">$49/mo</span>
                        </button>
                        <button
                            onClick={() => handleUpgrade('ltd')}
                            disabled={!!loading}
                            className="flex flex-col items-center py-4 px-3 bg-white border border-white rounded-2xl transition-all active:scale-95 disabled:opacity-50 hover:bg-zinc-100"
                        >
                            {loading === 'ltd' ? <Loader2 size={16} className="animate-spin mb-1 text-black" /> : <Crown size={16} className="mb-1 text-black" />}
                            <span className="text-[11px] font-black text-black uppercase tracking-wider">LTD</span>
                            <span className="text-[10px] text-zinc-600 font-bold">$129 once</span>
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-2.5 text-zinc-700 font-bold text-[10px] uppercase tracking-widest hover:text-zinc-400 transition-colors"
                    >
                        Dismiss — Limits reset monthly
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LimitReachedModal;
