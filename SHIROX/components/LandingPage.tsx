
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const LandingPage: React.FC<{ onGetStarted: (tier?: string) => void }> = ({ onGetStarted }) => {
    const [isLifetime, setIsLifetime] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        (entry.target as HTMLElement).style.opacity = '1';
                        (entry.target as HTMLElement).style.transform = 'translateY(0)';
                    }
                });
            },
            { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
        );

        // Small delay so elements are in DOM before observing
        const timer = setTimeout(() => {
            containerRef.current?.querySelectorAll('.reveal').forEach(el => {
                observer.observe(el);
            });
        }, 50);

        return () => { clearTimeout(timer); observer.disconnect(); };
    }, []);

    return (
        <div ref={containerRef} className="bg-black text-white leading-relaxed antialiased overflow-x-hidden">
            <style dangerouslySetInnerHTML={{ __html: `
                .reveal {
                    opacity: 0;
                    transform: translateY(28px);
                    transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .lp-nav a, .lp-nav button { font-family: 'Outfit', sans-serif; }
                .lp-heading { font-family: 'Outfit', sans-serif; }
            `}} />

            {/* ── Nav ── */}
            <nav className="lp-nav fixed top-0 left-0 right-0 h-[72px] bg-black/80 backdrop-blur-3xl border-b border-white/10 z-[1000] flex items-center">
                <div className="max-w-[1240px] mx-auto w-full px-6 md:px-10 flex justify-between items-center">
                    <a href="#" className="text-[1.3rem] tracking-tight text-white flex items-center gap-3">
                        <div className="w-5 h-5 border border-white rounded-full" />
                        Creatio
                    </a>
                    <div className="hidden md:flex gap-9 text-[0.82rem] tracking-wider text-zinc-400">
                        <a href="#analysis" className="hover:text-white transition-colors">Analysis</a>
                        <a href="#generation" className="hover:text-white transition-colors">Generation</a>
                        <a href="#sync" className="hover:text-white transition-colors">Social Sync</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                    </div>
                    <button onClick={onGetStarted} className="bg-white text-black px-5 py-2 rounded-sm text-[0.8rem] tracking-wider hover:opacity-90 transition-all">
                        Connect Link
                    </button>
                </div>
            </nav>

            {/* ── Hero ── */}
            <header className="min-h-[95vh] flex flex-col justify-center items-center text-center px-6 md:px-10 pt-[100px]">
                <span className="text-[0.65rem] text-zinc-500 tracking-[0.3em] uppercase mb-8">Intelligence Matrix v4.2</span>
                <h1 className="lp-heading text-[clamp(3.5rem,10vw,8rem)] tracking-[-0.05em] leading-[0.9] mb-10 text-white">
                    Architecting Viral Influence.
                </h1>
                <p className="text-[1.15rem] text-zinc-400 max-w-[680px] mx-auto leading-relaxed mb-14">
                    A high-fidelity workspace designed for deep content research, niche dominance, and automated social distribution. Engineered for the future of digital sovereignty.
                </p>
                <div>
                    <button onClick={onGetStarted} className="bg-white text-black px-10 py-4 rounded-sm text-[0.8rem] tracking-[0.2em] hover:scale-[0.98] transition-all">
                        Launch Matrix
                    </button>
                </div>
                {/* App Dashboard Mockup */}
                <div className="w-full max-w-[1100px] bg-zinc-950 border border-white/5 rounded-lg mt-10 overflow-hidden hidden sm:block" style={{ height: '520px' }}>
                    {/* Window chrome */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/40">
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                        <span className="ml-3 text-[0.6rem] text-zinc-600 tracking-[0.3em] uppercase">Creatio — Neural Workspace</span>
                    </div>
                    <div className="flex" style={{ height: 'calc(520px - 41px)' }}>
                        {/* Sidebar */}
                        <div className="w-[200px] border-r border-white/5 bg-black/30 flex flex-col py-4 px-3 gap-1 flex-shrink-0">
                            <div className="flex items-center gap-2 px-3 py-2 mb-3">
                                <div className="w-3 h-3 rounded-full border border-white/40" />
                                <span className="text-[0.65rem] text-white tracking-tight">Creatio</span>
                            </div>
                            {['Chat', 'Search', 'Ideas', 'Marketing', 'Analytics', 'Settings'].map((item, i) => (
                                <div key={item} className={`flex items-center gap-2.5 px-3 py-2 rounded text-[0.65rem] tracking-wide ${i === 0 ? 'bg-white/10 text-white' : 'text-zinc-600'}`}>
                                    <div className={`w-1 h-1 rounded-full flex-shrink-0 ${i === 0 ? 'bg-white' : 'bg-zinc-700'}`} />
                                    {item}
                                </div>
                            ))}
                            <div className="mt-auto px-3 py-2 flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex-shrink-0" />
                                <span className="text-[0.6rem] text-zinc-600">Operator</span>
                            </div>
                        </div>
                        {/* Main content */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="flex-1 p-5 space-y-4 overflow-hidden">
                                <div className="flex justify-end">
                                    <div className="bg-white/10 rounded-lg px-4 py-2.5 max-w-[60%] text-[0.7rem] text-zinc-300 leading-relaxed">
                                        Analyze autonomous AI agents and identify the top 3 content gaps.
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start">
                                    <div className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0 mt-0.5 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                                    </div>
                                    <div className="bg-zinc-900/80 border border-white/5 rounded-lg px-4 py-3 max-w-[75%] text-[0.7rem] text-zinc-400 leading-relaxed space-y-1.5">
                                        <p className="text-white/80">Neural analysis complete. Three high-velocity gaps identified:</p>
                                        <p>1. <span className="text-white/70">Agent-to-agent communication protocols</span> — underserved by 84%.</p>
                                        <p>2. <span className="text-white/70">Real-world deployment case studies</span> — demand outpacing supply 3:1.</p>
                                        <p>3. <span className="text-white/70">Cost-efficiency benchmarks</span> — zero authoritative voices in this niche.</p>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <div className="bg-white/10 rounded-lg px-4 py-2.5 max-w-[50%] text-[0.7rem] text-zinc-300 leading-relaxed">
                                        Generate a viral X thread on gap #1.
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start">
                                    <div className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0 mt-0.5 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                                    </div>
                                    <div className="bg-zinc-900/80 border border-white/5 rounded-lg px-4 py-3 max-w-[75%] text-[0.7rem] text-zinc-400 leading-relaxed">
                                        <span className="text-white/80">Thread drafted.</span> 7 posts · 1,840 chars · Grounded in 4 live sources.
                                        <div className="mt-2 flex gap-2">
                                            <span className="px-2 py-0.5 bg-white/10 rounded text-[0.55rem] text-zinc-400">Copy Thread</span>
                                            <span className="px-2 py-0.5 bg-white/10 rounded text-[0.55rem] text-zinc-400">Save Idea</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Input bar */}
                            <div className="px-5 pb-4">
                                <div className="flex items-center gap-3 bg-zinc-900/60 border border-white/5 rounded-lg px-4 py-3">
                                    <span className="text-[0.65rem] text-zinc-600 flex-1">Ask Creatio anything...</span>
                                    <div className="flex gap-2">
                                        <span className="text-[0.55rem] text-zinc-700 px-2 py-1 border border-zinc-800 rounded">Fast</span>
                                        <span className="text-[0.55rem] text-zinc-700 px-2 py-1 border border-zinc-800 rounded">Research</span>
                                    </div>
                                    <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Mobile mockup — chat only, no sidebar */}
                <div className="w-full bg-zinc-950 border border-white/5 rounded-lg mt-10 overflow-hidden sm:hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/40">
                        <div className="w-2 h-2 rounded-full bg-zinc-700" /><div className="w-2 h-2 rounded-full bg-zinc-700" /><div className="w-2 h-2 rounded-full bg-zinc-700" />
                        <span className="ml-2 text-[0.55rem] text-zinc-600 tracking-widest uppercase">Creatio</span>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="flex justify-end">
                            <div className="bg-white/10 rounded-lg px-3 py-2 max-w-[80%] text-[0.65rem] text-zinc-300 leading-relaxed">Identify top 3 content gaps in autonomous AI.</div>
                        </div>
                        <div className="flex gap-2 items-start">
                            <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0 mt-0.5 flex items-center justify-center"><div className="w-1 h-1 rounded-full bg-white/60" /></div>
                            <div className="bg-zinc-900/80 border border-white/5 rounded-lg px-3 py-2.5 text-[0.65rem] text-zinc-400 leading-relaxed space-y-1">
                                <p className="text-white/80">Three gaps found:</p>
                                <p>1. Agent-to-agent protocols — 84% underserved.</p>
                                <p>2. Real deployment cases — demand 3× supply.</p>
                                <p>3. Cost benchmarks — zero authority voices.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-zinc-900/60 border border-white/5 rounded-lg px-3 py-2.5 mt-2">
                            <span className="text-[0.6rem] text-zinc-600 flex-1">Ask Creatio anything...</span>
                            <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Analysis ── */}
            <section id="analysis" className="py-24 md:py-40 px-6 md:px-10 max-w-[1240px] mx-auto">
                <div className="max-w-[700px] mb-20">
                    <span className="text-[0.65rem] text-zinc-500 tracking-[0.3em] uppercase mb-6 block">01. Research & Discovery</span>
                    <h2 className="reveal lp-heading text-[clamp(2.2rem,6vw,3.8rem)] tracking-tight leading-[1.05] mb-7">Mining the Signal from the Noise.</h2>
                    <p className="reveal text-zinc-400 text-[1.05rem] leading-relaxed">Our neural engines scan the digital landscape to identify untapped opportunities before they become mainstream. Position your brand where the attention is going, not where it has been.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 border border-white/10">
                    {[
                        { num: 'SYSTEM.ANALYSIS', title: 'Niche Analysis', desc: 'Quantify audience sentiment and keyword saturation. Break down complex market dynamics into actionable data points for your next campaign.' },
                        { num: 'SYSTEM.IDENTIFY', title: 'Gap Analysis', desc: 'Discover the content your competitors are afraid to touch. Highlight the conversational voids where your voice can achieve maximum resonance.' },
                        { num: 'SYSTEM.PREDICT', title: 'Trend Management', desc: 'Monitor real-time cultural shifts across platforms. Our predictive models help you catch viral waves during their initial ascent.' }
                    ].map((f, i) => (
                        <div key={i} className={`reveal bg-black p-8 md:p-14 border border-white/5 hover:bg-zinc-950 transition-all ${i === 2 ? 'sm:col-span-2 md:col-span-1' : ''}`}>
                            <span className="text-[0.6rem] text-zinc-600 mb-6 block">{f.num}</span>
                            <h3 className="lp-heading text-[1.4rem] tracking-tight mb-5">{f.title}</h3>
                            <p className="text-[0.9rem] text-zinc-500 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Generation ── */}
            <section id="generation" className="py-24 md:py-40 px-6 md:px-10 max-w-[1240px] mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10 md:gap-24 items-center">
                    <div className="reveal">
                        <span className="text-[0.65rem] text-zinc-500 tracking-[0.3em] uppercase mb-6 block">02. Automated Production</span>
                        <h2 className="lp-heading text-[clamp(2.2rem,6vw,3.8rem)] tracking-tight leading-[1.05] mb-7">Content Without Compromise.</h2>
                        <p className="text-zinc-400 text-[1.05rem] leading-relaxed mb-10">Leverage our generative matrix to produce high-fidelity text and visuals that reflect your unique brand identity.</p>
                        <div className="space-y-6">
                            {[
                                { tag: 'A', title: 'Social Media Content Gen', desc: 'Automated drafting of threads, articles, and long-form scripts tailored to your cognitive style.' },
                                { tag: 'B', title: 'Image Generation Matrix', desc: 'Context-aware visual assets created specifically to complement your narrative architecture.' }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-6 py-6 border-t border-white/10">
                                    <span className="text-[0.8rem] text-zinc-600">{item.tag}</span>
                                    <div>
                                        <p className="text-[0.9rem] text-white mb-1">{item.title}</p>
                                        <p className="text-[0.8rem] text-zinc-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Marketing Studio mockup */}
                    <div className="reveal bg-zinc-950 border border-white/10 rounded-lg overflow-hidden flex flex-col h-[320px] sm:h-auto sm:[aspect-ratio:4/3]">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/40">
                            <div className="w-2 h-2 rounded-full bg-zinc-700" />
                            <span className="text-[0.55rem] text-zinc-600 tracking-[0.3em] uppercase">Marketing Studio</span>
                        </div>
                        <div className="flex-1 p-5 flex flex-col gap-3">
                            <div className="flex gap-2 mb-1 flex-wrap">
                                {['X Post', 'X Thread', 'IG Caption', 'Script'].map((f, i) => (
                                    <span key={f} className={`px-3 py-1 rounded text-[0.6rem] tracking-wide ${i === 1 ? 'bg-white/10 text-white' : 'text-zinc-600 border border-zinc-800'}`}>{f}</span>
                                ))}
                            </div>
                            <div className="bg-black/40 border border-white/5 rounded p-3 flex-1 space-y-2 overflow-hidden">
                                <p className="text-[0.65rem] text-white/80 leading-relaxed">OpenAI just deployed GPT-5 agents that can autonomously manage entire workflows — no human in the loop.</p>
                                <p className="text-[0.65rem] text-zinc-500 leading-relaxed">This isn't a chatbot upgrade. It's the first real signal that knowledge work is being restructured at the infrastructure level.</p>
                                <p className="text-[0.65rem] text-zinc-500 leading-relaxed">The companies that survive won't resist this. They'll redesign their org charts around it.</p>
                                <div className="flex gap-1 flex-wrap pt-1">
                                    {['#AI', '#Automation', '#FutureOfWork'].map(tag => (
                                        <span key={tag} className="text-[0.55rem] text-zinc-600">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 py-2 bg-white/5 border border-white/10 rounded text-center text-[0.6rem] text-zinc-400">Refine</div>
                                <div className="flex-1 py-2 bg-white text-black rounded text-center text-[0.6rem] font-normal">Post to X</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Sync / Distribution ── */}
            <section id="sync" className="py-24 md:py-40 px-6 md:px-10 max-w-[1240px] mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10 md:gap-24 items-center">
                    {/* Trend Radar mockup */}
                    <div className="reveal order-2 lg:order-1 bg-zinc-950 border border-white/10 rounded-lg overflow-hidden flex flex-col h-[320px] sm:h-auto sm:[aspect-ratio:4/3]">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/40">
                            <div className="w-2 h-2 rounded-full bg-zinc-700" />
                            <span className="text-[0.55rem] text-zinc-600 tracking-[0.3em] uppercase">Trend Radar</span>
                        </div>
                        <div className="flex-1 p-5 flex flex-col gap-3 overflow-hidden">
                            {[
                                { topic: 'Autonomous AI Agents', velocity: 'Rising', score: 91, color: 'text-green-500' },
                                { topic: 'Swarm Robotics', velocity: 'Early', score: 78, color: 'text-blue-400' },
                                { topic: 'AI in Fintech', velocity: 'Peak', score: 85, color: 'text-yellow-500' },
                                { topic: 'LLM Cost Benchmarks', velocity: 'Early', score: 72, color: 'text-blue-400' },
                            ].map((t) => (
                                <div key={t.topic} className="flex items-center gap-3 py-2.5 border-b border-white/5">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[0.7rem] text-white/80 truncate">{t.topic}</p>
                                        <p className={`text-[0.6rem] ${t.color} mt-0.5`}>{t.velocity}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <div className="w-20 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-white/40 rounded-full" style={{ width: `${t.score}%` }} />
                                        </div>
                                        <span className="text-[0.6rem] text-zinc-500 w-6 text-right">{t.score}</span>
                                    </div>
                                </div>
                            ))}
                            <div className="mt-auto pt-2 flex gap-2">
                                <div className="flex-1 py-2 bg-white/5 border border-white/10 rounded text-center text-[0.6rem] text-zinc-400">Refresh</div>
                                <div className="flex-1 py-2 bg-white/5 border border-white/10 rounded text-center text-[0.6rem] text-zinc-400">Generate Content</div>
                            </div>
                        </div>
                    </div>
                    <div className="reveal order-1 lg:order-2">
                        <span className="text-[0.65rem] text-zinc-500 tracking-[0.3em] uppercase mb-6 block">03. Distribution</span>
                        <h2 className="lp-heading text-[clamp(2.2rem,6vw,3.8rem)] tracking-tight leading-[1.05] mb-7">Direct Neural Distribution.</h2>
                        <p className="text-zinc-400 text-[1.05rem] leading-relaxed mb-10">Remove the friction between ideation and publication. Our direct sync technology allows for instant deployment across your primary channels.</p>
                        <div className="space-y-6">
                            {[
                                { tag: '+', title: 'Direct Sync with X', desc: 'Schedule and post threads directly to your profile without leaving the workspace. Full media support included.' },
                                { tag: '+', title: 'Multi-Account Management', desc: 'Scale your presence across multiple identities and niches from a single unified dashboard.' }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-6 py-6 border-t border-white/10">
                                    <span className="text-[0.8rem] text-zinc-600">{item.tag}</span>
                                    <div>
                                        <p className="text-[0.9rem] text-white mb-1">{item.title}</p>
                                        <p className="text-[0.8rem] text-zinc-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Workflow ── */}
            <section className="py-24 md:py-40 px-6 md:px-10 max-w-[1240px] mx-auto text-center">
                <span className="text-[0.65rem] text-zinc-500 tracking-[0.3em] uppercase mb-8 block">Workflow</span>
                <h2 className="reveal lp-heading text-[clamp(2.2rem,6vw,3.8rem)] tracking-tight leading-[1.05] mb-20">The Architecture of Output.</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 text-left">
                    {[
                        { title: '01. Memory Sync', desc: 'The AI learns your goals and past research to build a persistent knowledge ledger.' },
                        { title: '02. Intelligence Analysis', desc: 'Scan for gaps and trends to ensure your content is positioned for maximum impact.' },
                        { title: '03. Neural Draft', desc: 'Generate optimized drafts and visual assets using your chosen cognitive style.' },
                        { title: '04. Final Deployment', desc: 'Review and push your content directly to social platforms with zero friction.' }
                    ].map((step, i) => (
                        <div key={i} className="reveal">
                            <h4 className="lp-heading text-[0.9rem] mb-3">{step.title}</h4>
                            <p className="text-[0.8rem] text-zinc-500 leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Pricing ── */}
            <section id="pricing" className="py-40 px-6 md:px-10 max-w-[1240px] mx-auto">
                <span className="text-[0.65rem] text-zinc-500 tracking-[0.3em] uppercase mb-8 block text-center">Investment</span>
                <h2 className="reveal lp-heading text-[clamp(2.2rem,6vw,3.8rem)] tracking-tight leading-[1.05] mb-4 text-center">Scale Your Intelligence.</h2>
                <p className="reveal text-zinc-500 text-center text-[0.85rem] mb-12">Choose the plan that fits your growth trajectory.</p>

                {/* Toggle Switch */}
                <div className="reveal flex justify-center items-center gap-4 mb-16">
                    <span className={`text-[0.7rem] tracking-widest uppercase transition-colors ${!isLifetime ? 'text-white' : 'text-zinc-600'}`}>Monthly</span>
                    <button 
                        onClick={() => setIsLifetime(!isLifetime)}
                        className="w-14 h-7 bg-zinc-900 border border-white/10 rounded-full relative p-1 transition-all hover:border-white/20"
                    >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 ease-out ${isLifetime ? 'translate-x-7' : 'translate-x-0'}`} />
                    </button>
                    <span className={`text-[0.7rem] tracking-widest uppercase transition-colors ${isLifetime ? 'text-white' : 'text-zinc-600'}`}>Lifetime</span>
                    {isLifetime && (
                        <span className="text-[0.55rem] bg-white text-black px-2 py-0.5 rounded-sm tracking-tighter animate-pulse">MOST POPULAR</span>
                    )}
                </div>

                <div className="max-w-[480px] mx-auto">
                    <div className={`reveal transition-all duration-500 ${isLifetime ? 'bg-white text-black' : 'bg-zinc-950 border border-white/10 text-white'} p-8 md:p-12 rounded-sm flex flex-col relative overflow-hidden`}>
                        {isLifetime && (
                            <div className="absolute top-0 right-0 p-4">
                                <span className="text-[0.55rem] bg-black text-white px-2 py-1 tracking-[0.2em] uppercase">Limited Offer</span>
                            </div>
                        )}
                        
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <span className={`text-[0.6rem] tracking-[0.3em] uppercase mb-2 block ${isLifetime ? 'text-zinc-500' : 'text-zinc-500'}`}>
                                    {isLifetime ? 'Full Access' : 'Monthly Access'}
                                </span>
                                <h3 className={`lp-heading text-3xl ${isLifetime ? 'text-black' : 'text-white'}`}>
                                    {isLifetime ? 'LTD' : 'PRO'}
                                </h3>
                            </div>
                        </div>

                        <div className="flex items-baseline gap-1 my-8">
                            <span className="lp-heading text-6xl tracking-tighter">
                                ${isLifetime ? '129' : '49'}
                            </span>
                            <span className={`text-base font-outfit ${isLifetime ? 'text-zinc-500' : 'text-zinc-600'}`}>
                                {isLifetime ? 'once' : '/mo'}
                            </span>
                        </div>

                        <ul className={`text-[0.85rem] space-y-4 mb-12 flex-1 ${isLifetime ? 'text-zinc-700' : 'text-zinc-400'}`}>
                            {[
                                '30 Niche Analytics / month',
                                '30 Gap Analysis / month',
                                '500 User Chats / month',
                                '100 Post Generations / month',
                                '100 Images embedded with posts',
                                '60 Trend Analysis / month',
                                isLifetime ? 'Lifetime support & updates' : 'Standard support',
                                isLifetime ? 'Early access to v5.0' : 'v4.2 core features',
                            ].map((f, i) => (
                                <li key={i} className="flex items-start gap-4">
                                    <span className={`${isLifetime ? 'text-zinc-300' : 'text-zinc-700'} mt-1`}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </span>
                                    <span>{f}</span>
                                </li>
                            ))}
                        </ul>

                        <button 
                            onClick={() => onGetStarted(isLifetime ? 'LTD' : 'PRO')} 
                            className={`w-full py-5 text-[0.75rem] tracking-[0.2em] uppercase transition-all duration-300 ${
                                isLifetime 
                                ? 'bg-black text-white hover:opacity-80' 
                                : 'border border-white/10 text-white hover:bg-white hover:text-black'
                            }`}
                        >
                            {isLifetime ? 'Get Lifetime Access' : 'Get Started Now'}
                        </button>
                        
                        <p className={`text-center text-[0.65rem] mt-6 ${isLifetime ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            {isLifetime ? 'Secure one-time payment. No hidden fees.' : 'Cancel anytime. No long-term commitment.'}
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="py-16 px-6 md:px-10 max-w-[1240px] mx-auto border-t border-white/5">
                <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-20">
                    <div className="flex flex-col gap-3">
                        <a href="#" className="lp-heading text-[1.3rem] tracking-tight text-white flex items-center gap-3">
                            <div className="w-5 h-5 border border-white rounded-full" />
                            Creatio
                        </a>
                        <p className="text-[0.7rem] text-zinc-600 max-w-[200px] leading-relaxed">
                            An AI content intelligence platform by <span className="text-zinc-400">VYNDRIQ</span>.
                        </p>
                    </div>
                    <div className="flex gap-16 flex-wrap">
                        <div className="min-w-[100px]">
                            <h5 className="text-[0.7rem] text-zinc-600 tracking-[0.2em] uppercase mb-6">Platform</h5>
                            <div className="flex flex-col gap-3 text-[0.8rem] text-zinc-500">
                                <a href="#analysis" className="hover:text-white transition-colors">Analysis</a>
                                <a href="#generation" className="hover:text-white transition-colors">Generation</a>
                                <a href="#sync" className="hover:text-white transition-colors">Distribution</a>
                                <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                            </div>
                        </div>
                        <div className="min-w-[100px]">
                            <h5 className="text-[0.7rem] text-zinc-600 tracking-[0.2em] uppercase mb-6">Legal</h5>
                            <div className="flex flex-col gap-3 text-[0.8rem] text-zinc-500">
                                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                                <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                            </div>
                        </div>
                        <div className="min-w-[100px]">
                            <h5 className="text-[0.7rem] text-zinc-600 tracking-[0.2em] uppercase mb-6">Connect</h5>
                            <div className="flex flex-col gap-3 text-[0.8rem] text-zinc-500">
                                <a
                                    href="https://x.com/JhaVansh03"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white transition-colors flex items-center gap-2"
                                >
                                    Twitter / X
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                </a>
                                <span className="flex items-center gap-2 cursor-default select-none">
                                    Discord
                                    <span className="text-[0.5rem] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-sm tracking-widest uppercase">Soon</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-[0.7rem] text-zinc-700">
                    <p>© 2026 <span className="text-zinc-600">VYNDRIQ</span>. All rights reserved.</p>
                    <p>Creatio is a product of VYNDRIQ — built for the creators of tomorrow.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

