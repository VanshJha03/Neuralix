
import React from 'react';
import { Zap, Shield, X } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface LimitReachedModalProps {
    message: string;
    onClose: () => void;
    tier?: string;
}

const LimitReachedModal: React.FC<LimitReachedModalProps> = ({ message, onClose, tier = 'Free' }) => {
    const isFree = tier === 'Free';

    const handleSignUp = async () => {
        await signOut(auth);
        await fetch('/api/auth/session', { method: 'DELETE' });
        onClose();
        window.location.href = '/#auth';
        window.location.reload();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-[#0a0a0a] border border-zinc-800 rounded-[2.5rem] p-8 shadow-[0_0_100px_rgba(255,255,255,0.04)] relative overflow-hidden">
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-zinc-700 hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>

                <div className="relative z-10 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-[1.25rem] bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <Shield size={28} className="text-zinc-500" />
                    </div>

                    <h3 className="text-xl font-normal text-white mb-2 tracking-tighter">
                        Neural Limit Reached
                    </h3>
                    <p className="text-xs text-zinc-500 mb-6 leading-relaxed font-normal">
                        {message}
                    </p>

                    {isFree ? (
                        <>
                            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl mb-5 text-left">
                                <p className="text-[9px] font-normal uppercase tracking-widest text-white mb-3">Upgrade for more capacity:</p>
                                <ul className="space-y-2">
                                    {[
                                        'Increased analysis limits',
                                        'More daily content scripts',
                                        'Advanced AI visual generation',
                                        'Permanent neural memory',
                                    ].map(benefit => (
                                        <li key={benefit} className="flex items-center gap-2">
                                            <Zap size={10} className="text-white flex-shrink-0" />
                                            <span className="text-[10px] text-zinc-300 font-normal">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={handleSignUp}
                                className="w-full py-4 bg-white text-black font-normal text-xs uppercase tracking-widest rounded-2xl hover:bg-zinc-100 active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-3"
                            >
                                Sign Up / Upgrade
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-zinc-900 text-zinc-400 font-normal text-xs rounded-xl hover:bg-zinc-800 transition-all"
                        >
                            Dismiss — Neural Reset at 00:00
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LimitReachedModal;
