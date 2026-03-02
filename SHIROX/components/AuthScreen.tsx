import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

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

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        clearState();
        setLoading(true);

        if (mode === 'signup') {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: name } },
            });
            if (error) setError(error.message);
            else setSuccessMsg('Account created! Check your email to confirm, then sign in.');
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) setError(error.message);
        }
        setLoading(false);
    };

    const handleGuestLogin = async () => {
        clearState();
        setLoading(true);
        const { error } = await supabase.auth.signInAnonymously();
        if (error) setError(error.message);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden py-8">
            {/* Atmospheric BG */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-700/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-700/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Grid overlay */}
            <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }}
            />

            <div className="relative z-10 w-full max-w-md px-6">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1
                        className="text-4xl lg:text-5xl font-black tracking-tighter bg-gradient-to-b from-white via-white to-zinc-700 bg-clip-text text-transparent italic"
                        style={{ fontFamily: "'Orbitron', sans-serif" }}
                    >
                        ArsCreatio
                    </h1>
                    <p className="text-zinc-700 uppercase tracking-[0.5em] text-[8px] lg:text-[9px] font-black mt-2">
                        Neural Intelligence Matrix
                    </p>
                </div>

                {/* Auth Card */}
                <div className="bg-zinc-950/70 backdrop-blur-2xl border border-zinc-900 rounded-2xl p-6 lg:p-8 shadow-2xl">
                    <h2 className="text-white font-bold text-xl mb-1">
                        {mode === 'login' ? 'Welcome back.' : 'Create account.'}
                    </h2>
                    <p className="text-zinc-600 text-sm mb-6">
                        {mode === 'login' ? 'Sign in to access your Neural Workspace.' : 'Join Beta — it\'s free. Get 10x the limits of a guest.'}
                    </p>

                    <form onSubmit={handleEmailAuth} className="space-y-3">
                        {mode === 'signup' && (
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                            />
                        )}
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                        />

                        {error && (
                            <p className="text-red-500 text-xs font-medium border border-red-900/40 bg-red-950/20 rounded-xl px-4 py-3">
                                {error}
                            </p>
                        )}
                        {successMsg && (
                            <p className="text-green-400 text-xs font-medium border border-green-900/40 bg-green-950/20 rounded-xl px-4 py-3">
                                {successMsg}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black font-bold py-3 px-4 rounded-xl hover:bg-zinc-100 active:scale-[0.98] transition-all shadow-lg disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account (Free Beta)'}
                        </button>
                    </form>

                    {/* Toggle Mode */}
                    <p className="text-center text-zinc-700 text-xs mt-5">
                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); clearState(); }}
                            className="text-white font-bold hover:underline"
                        >
                            {mode === 'login' ? 'Sign Up Free' : 'Sign In'}
                        </button>
                    </p>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 my-4">
                    <div className="flex-1 h-px bg-zinc-900" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-700">or</span>
                    <div className="flex-1 h-px bg-zinc-900" />
                </div>

                {/* Guest Card */}
                <div className="bg-zinc-950/60 backdrop-blur-xl border border-zinc-900/80 rounded-2xl p-5">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-3">Guest Access</p>

                    {/* Comparison grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="p-3 bg-zinc-900/50 border border-zinc-800/60 rounded-xl">
                            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-2">Guest Limits</p>
                            <ul className="space-y-1.5">
                                {['1 Analysis/day', '3 Posts/day', '0 AI Images', '1 Gap/month'].map(l => (
                                    <li key={l} className="flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-zinc-700 flex-shrink-0" />
                                        <span className="text-[9px] text-zinc-600 font-semibold">{l}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-3 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden">
                            <div className="absolute -top-1 -right-1 px-2 py-0.5 bg-white rounded-bl-lg">
                                <span className="text-[7px] font-black uppercase text-black tracking-wider">FREE</span>
                            </div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-white mb-2">Beta Access</p>
                            <ul className="space-y-1.5">
                                {['5 Analyses/day', '15 Posts/day', '10 AI Images/day', 'Unlimited Gaps'].map(l => (
                                    <li key={l} className="flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-white flex-shrink-0" />
                                        <span className="text-[9px] text-white font-semibold">{l}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <button
                        onClick={handleGuestLogin}
                        disabled={loading}
                        className="w-full py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold text-xs rounded-xl hover:bg-zinc-800 hover:text-white active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {loading ? 'Connecting...' : 'Continue as Guest →'}
                    </button>
                    <p className="text-center text-[9px] text-zinc-700 font-bold mt-2">
                        Guest data is not saved permanently.
                    </p>
                </div>

                <p className="text-center text-zinc-800 text-[10px] mt-6 uppercase tracking-widest">
                    © 2026 ArsX · ArsCreatio
                </p>
            </div>
        </div>
    );
};

export default AuthScreen;
