import React from 'react';
import { Zap, Shield, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LimitReachedModalProps {
    message: string;
    isGuest: boolean;
    onClose: () => void;
}

const LimitReachedModal: React.FC<LimitReachedModalProps> = ({ message, isGuest, onClose }) => {
    const handleSignUp = async () => {
        // Sign out from guest session so they can create a real account
        await supabase.auth.signOut();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-[#0a0a0a] border border-zinc-800 rounded-[2.5rem] p-8 shadow-[0_0_100px_rgba(255,255,255,0.04)] relative overflow-hidden">
                {/* Glow */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-zinc-700 hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>

                <div className="relative z-10 text-center">
                    {/* Icon */}
                    <div className="w-16 h-16 mx-auto mb-6 rounded-[1.25rem] bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <Shield size={28} className="text-zinc-500" />
                    </div>

                    <h3 className="text-xl font-black text-white mb-2 tracking-tighter italic">
                        Neural Limit Reached
                    </h3>
                    <p className="text-xs text-zinc-500 mb-6 leading-relaxed font-medium">
                        {message}
                    </p>

                    {isGuest && (
                        <>
                            {/* What they get */}
                            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl mb-5 text-left">
                                <p className="text-[9px] font-black uppercase tracking-widest text-white mb-3">Beta (Free) gets you:</p>
                                <ul className="space-y-2">
                                    {[
                                        '5× more analyses per day',
                                        '15 content generations/day',
                                        '10 AI images/day',
                                        'Unlimited Gap Analyses',
                                        'Data saved permanently',
                                    ].map(benefit => (
                                        <li key={benefit} className="flex items-center gap-2">
                                            <Zap size={10} className="text-white flex-shrink-0" />
                                            <span className="text-[10px] text-zinc-300 font-semibold">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={handleSignUp}
                                className="w-full py-4 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-zinc-100 active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-3"
                            >
                                Sign Up for Beta — It's Free
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-2 text-zinc-700 font-bold text-[10px] uppercase tracking-widest hover:text-zinc-400 transition-colors"
                            >
                                Continue as Guest
                            </button>
                        </>
                    )}

                    {!isGuest && (
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-zinc-900 text-zinc-400 font-bold text-xs rounded-xl hover:bg-zinc-800 transition-all"
                        >
                            Dismiss — Limits Reset Daily
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LimitReachedModal;
