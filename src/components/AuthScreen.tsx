import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Check, Star, Rocket, ShieldCheck, Crown, Zap } from 'lucide-react';
import NeuralLogo from './NeuralLogo';

type AuthMode = 'login' | 'signup';

const AuthScreen: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const clearState = () => { setError(''); setSuccessMsg(''); };

    const handleGoogleLogin = async () => {
        setLoading(true);
        clearState();
        try {
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin }
            });
            if (oauthError) throw oauthError;
            // OAuth redirect will handle the rest
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        clearState();
        setLoading(true);

        try {
            if (mode === 'signup') {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: name } }
                });
                if (signUpError) throw signUpError;
                setSuccessMsg('Account created! Initializing neural sync...');
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                if (signInError) throw signInError;
            }
            window.location.reload();
        } catch (err: any) {
            setError(err.message);
        }
        setLoading(false);
    };

    const handleGuestLogin = async () => {
        clearState();
        setLoading(true);
        try {
            // Guest mode: sign in with a disposable anonymous-style account
            const guestEmail = `guest_${Date.now()}@creatiox.guest`;
            const guestPw = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
            const { error: signUpError } = await supabase.auth.signUp({ email: guestEmail, password: guestPw });
            if (signUpError) throw signUpError;
            window.location.reload();
        } catch (err: any) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black overflow-y-auto overflow-x-hidden scrollbar-hide">
            {/* Atmospheric Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[100px]" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
                />
            </div>

            {/* Hero Section */}
            <header className="relative z-10 pt-20 pb-12 lg:pt-32 lg:pb-24 px-6 text-center">
                <NeuralLogo size={80} />
                <h1 className="text-6xl lg:text-8xl font-normal tracking-tighter mt-12 mb-6 leading-[0.9]" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                    CreatioX
                </h1>
                <p className="text-zinc-600 uppercase tracking-[0.8em] text-[10px] lg:text-[12px] font-normal mb-12">
                    Creating Unique
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <button onClick={() => document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' })} className="px-10 py-5 bg-white text-black font-normal uppercase tracking-widest text-[10px] rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.1)] font-orbitron">
                        Access Platform
                    </button>
                    <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="px-10 py-5 bg-zinc-950 border border-zinc-900 text-zinc-500 font-normal uppercase tracking-widest text-[10px] rounded-2xl hover:border-zinc-700 hover:text-white transition-all active:scale-95 font-orbitron">
                        View Pricing
                    </button>
                </div>
            </header>

            {/* Auth Section */}
            <section id="auth" className="relative z-10 py-20 px-6">
                <div className="max-w-md mx-auto">
                    <div className="bg-zinc-950/80 backdrop-blur-3xl border border-zinc-900 rounded-[3rem] p-8 lg:p-12 shadow-2xl">
                        <h2 className="text-2xl font-normal mb-1 tracking-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                            {mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                        </h2>
                        <p className="text-zinc-600 text-xs uppercase tracking-widest font-normal mb-8">
                            {mode === 'login' ? 'Welcome back' : 'Start your journey'}
                        </p>

                        <div className="space-y-6">
                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full py-4 bg-zinc-900 border border-zinc-800 text-white font-normal text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all active:scale-[0.98]"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Connect with Google
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-px bg-zinc-900" />
                                <span className="text-[8px] font-normal uppercase text-zinc-800 font-normal">Account Credentials</span>
                                <div className="flex-1 h-px bg-zinc-900" />
                            </div>

                            <form onSubmit={handleEmailAuth} className="space-y-4">
                                {mode === 'signup' && (
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white text-sm placeholder:text-zinc-700 focus:outline-none focus:border-white/20 transition-all font-normal"
                                    />
                                )}
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white text-sm placeholder:text-zinc-700 focus:outline-none focus:border-white/20 transition-all font-normal"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-4 text-white text-sm placeholder:text-zinc-700 focus:outline-none focus:border-white/20 transition-all font-normal"
                                />

                                {error && (
                                    <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-2xl text-red-500 text-[10px] font-normal uppercase tracking-widest leading-loose">
                                        {error}
                                    </div>
                                )}
                                {successMsg && (
                                    <div className="p-4 bg-green-950/20 border border-green-900/30 rounded-2xl text-green-400 text-[10px] font-normal uppercase tracking-widest leading-loose">
                                        {successMsg}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 bg-white text-black font-normal uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 shadow-xl"
                                >
                                    {loading ? 'PROCESSING...' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                                </button>
                            </form>

                            <div className="mt-8 flex items-center gap-4">
                                <div className="flex-1 h-px bg-zinc-900" />
                                <span className="text-[9px] font-normal uppercase text-zinc-800">or</span>
                                <div className="flex-1 h-px bg-zinc-900" />
                            </div>

                            <button
                                onClick={handleGuestLogin}
                                className="w-full py-4 mt-6 bg-zinc-950 border border-zinc-900 text-zinc-500 font-normal text-[10px] uppercase tracking-widest rounded-2xl hover:text-white transition-all"
                            >
                                Guest Mode (Tier: Free)
                            </button>

                            <p className="text-center text-zinc-700 text-[10px] font-normal uppercase tracking-widest mt-8">
                                {mode === 'login' ? "New here? " : 'Already have an account? '}
                                <button
                                    onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); clearState(); }}
                                    className="text-white hover:underline ml-1"
                                >
                                    {mode === 'login' ? 'Sign Up' : 'Sign In'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </section>


            {/* Pricing Section */}
            <section id="pricing" className="relative z-10 py-32 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl lg:text-6xl font-normal tracking-tighter mb-4" style={{ fontFamily: "'Orbitron', sans-serif" }}>PRICING</h2>
                        <p className="text-zinc-600 uppercase tracking-[0.5em] text-[10px] font-normal">Operational Trajectories</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { name: 'Free', price: '$0', icon: <Star />, features: ['5 Trend Analysis (One-time)', '5 Post Drafting (One-time)', 'Research Studio: Disabled', '1 Niche Analysis'] },
                            { ...PRICING_CONFIG.MONTHLY, name: 'Pro Monthly', icon: <Rocket />, popular: true },
                            { ...PRICING_CONFIG.ANNUAL, name: 'Pro Annual', icon: <Zap /> }
                        ].map(t => (
                            <div key={t.name} className={`relative p-8 rounded-[3rem] bg-zinc-950 border ${t.popular ? 'border-white/20' : 'border-zinc-900'} hover:border-white/40 transition-all group overflow-hidden`}>
                                {t.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white text-black text-[9px] font-normal uppercase rounded-full shadow-2xl">RECOMMENDED</div>}
                                <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 text-zinc-600 group-hover:text-white transition-colors">{t.icon}</div>
                                <h3 className="text-xl font-normal mb-2 uppercase tracking-tighter font-normal" style={{ fontFamily: "'Orbitron', sans-serif" }}>{t.name}</h3>
                                <div className="flex items-baseline mb-8">
                                    <span className="text-3xl font-normal">{t.price}</span>
                                    {t.period && <span className="text-[10px] font-normal text-zinc-700 ml-1 uppercase">{t.period}</span>}
                                </div>
                                <ul className="space-y-4 mb-10">
                                    {t.features.map(f => (
                                        <li key={f} className="flex gap-3 items-start text-[11px] text-zinc-500 font-normal uppercase tracking-tight">
                                            <Check size={14} className="mt-1 flex-shrink-0 text-white/20" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <a href="#auth" className="block w-full py-4 text-center bg-zinc-900 text-white font-normal uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white hover:text-black transition-all">Select Tier</a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="relative z-10 py-12 text-center border-t border-zinc-900 mt-20">
                <p className="text-zinc-800 text-[10px] font-normal uppercase tracking-[0.5em]">© 2026 ArsCreatio · CreatioX · All rights reserved.</p>
            </footer>
        </div>
    );
};

export default AuthScreen;
