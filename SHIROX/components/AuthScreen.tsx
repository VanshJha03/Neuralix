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
            // On success, App.tsx onAuthStateChange fires and handles redirect
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
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
                <div className="text-center mb-10">
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

                {/* Card */}
                <div className="bg-zinc-950/70 backdrop-blur-2xl border border-zinc-900 rounded-2xl p-6 lg:p-8 shadow-2xl">
                    <h2 className="text-white font-bold text-xl mb-1">
                        {mode === 'login' ? 'Welcome back.' : 'Create account.'}
                    </h2>
                    <p className="text-zinc-600 text-sm mb-6">
                        {mode === 'login' ? 'Sign in to access your Neural Workspace.' : 'Join and start creating.'}
                    </p>

                    {/* Email Form */}
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
                            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    {/* Toggle Mode */}
                    <p className="text-center text-zinc-700 text-xs mt-5">
                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); clearState(); }}
                            className="text-white font-bold hover:underline"
                        >
                            {mode === 'login' ? 'Sign Up' : 'Sign In'}
                        </button>
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
