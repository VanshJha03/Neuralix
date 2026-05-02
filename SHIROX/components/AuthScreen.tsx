import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Check, Zap, Crown, Eye, EyeOff } from 'lucide-react';

type AuthMode = 'login' | 'signup';

const AuthScreen: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const clearState = () => { setError(''); setSuccessMsg(''); };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearState();
        setLoading(true);
        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: name } },
                });
                if (error) throw error;
                setSuccessMsg('Account created. Check your email to confirm, then sign in.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                // onAuthStateChange in App.tsx handles the redirect
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Authentication failed.');
        }
        setLoading(false);
    };

    const FEATURES = [
        '30 Niche Analytics / month',
        '30 Gap Analysis / month',
        '500 Chats / month',
        '100 Post Generations / month',
        '100 AI Images / month',
        '60 Trend Analysis / month',
    ];

    return (
        <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row overflow-hidden">
            {/* ── Left panel — branding + pricing ── */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 border-r border-zinc-900 relative overflow-hidden">
                {/* subtle grid bg */}
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

                {/* Logo */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-5 h-5 border border-white rounded-full" />
                        <span className="text-lg font-black tracking-tighter" style={{ fontFamily: "'Orbitron', sans-serif" }}>Creatio</span>
                    </div>
                    <p className="text-zinc-700 text-[10px] uppercase tracking-[0.4em]">Neural Intelligence Matrix v5.0</p>
                </div>

                {/* Pricing cards */}
                <div className="relative z-10 space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-6">Choose your plan after signing up</p>

                    {/* PRO */}
                    <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-white">PRO</p>
                                <p className="text-[10px] text-zinc-600 uppercase">Monthly</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-white">$49</span>
                                <span className="text-xs text-zinc-600 ml-1">/mo</span>
                            </div>
                        </div>
                        <ul className="space-y-1.5">
                            {FEATURES.map(f => (
                                <li key={f} className="flex items-center gap-2 text-[10px] text-zinc-500">
                                    <Check size={10} className="text-zinc-600 flex-shrink-0" /> {f}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* LTD */}
                    <div className="p-6 bg-white rounded-2xl relative">
                        <div className="absolute -top-3 left-4 px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-full">Best Value</div>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-black">LTD</p>
                                <p className="text-[10px] text-zinc-500 uppercase">Lifetime</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-black">$129</span>
                                <span className="text-xs text-zinc-500 ml-1">once</span>
                            </div>
                        </div>
                        <ul className="space-y-1.5">
                            {FEATURES.map(f => (
                                <li key={f} className="flex items-center gap-2 text-[10px] text-zinc-600">
                                    <Check size={10} className="text-zinc-500 flex-shrink-0" /> {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <p className="relative z-10 text-zinc-800 text-[10px] uppercase tracking-[0.3em]">© 2026 ArsX · Creatio</p>
            </div>

            {/* ── Right panel — auth form ── */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 lg:py-0 relative">
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/3 rounded-full blur-[100px] pointer-events-none" />

                {/* Mobile logo */}
                <div className="lg:hidden flex items-center gap-2 mb-12">
                    <div className="w-4 h-4 border border-white rounded-full" />
                    <span className="text-base font-black tracking-tighter" style={{ fontFamily: "'Orbitron', sans-serif" }}>Creatio</span>
                </div>

                <div className="w-full max-w-sm relative z-10">
                    <h2 className="text-2xl font-black tracking-tighter mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                    </h2>
                    <p className="text-zinc-600 text-[11px] uppercase tracking-widest mb-8">
                        {mode === 'login' ? 'Enter your credentials to continue' : 'Set up your neural profile'}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        {mode === 'signup' && (
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block mb-1.5">Name</label>
                                <input
                                    type="text"
                                    placeholder="Your name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    autoComplete="name"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors"
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block mb-1.5">Email</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3.5 text-white text-sm placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 block mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Min. 6 characters"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3.5 pr-12 text-white text-sm placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(p => !p)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3.5 bg-red-950/20 border border-red-900/30 rounded-xl text-red-400 text-[11px] leading-relaxed">
                                {error}
                            </div>
                        )}
                        {successMsg && (
                            <div className="p-3.5 bg-green-950/20 border border-green-900/30 rounded-xl text-green-400 text-[11px] leading-relaxed">
                                {successMsg}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.15em] text-[11px] rounded-xl hover:bg-zinc-100 transition-all active:scale-[0.98] disabled:opacity-40 mt-2"
                        >
                            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-zinc-700 text-[11px] mt-6">
                        {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                        {' '}
                        <button
                            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); clearState(); }}
                            className="text-white hover:underline underline-offset-2"
                        >
                            {mode === 'login' ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>

                    {/* Mobile pricing teaser */}
                    <div className="lg:hidden mt-12 pt-8 border-t border-zinc-900">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4 text-center">Plans</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-center">
                                <p className="text-xs font-black text-white uppercase">PRO</p>
                                <p className="text-lg font-black text-white">$49<span className="text-xs text-zinc-600">/mo</span></p>
                            </div>
                            <div className="p-4 bg-white rounded-xl text-center">
                                <p className="text-xs font-black text-black uppercase">LTD</p>
                                <p className="text-lg font-black text-black">$129<span className="text-xs text-zinc-500"> once</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;
