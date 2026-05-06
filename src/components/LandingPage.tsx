
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

const LandingPage: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
    useEffect(() => {
        const observerOptions = { threshold: 0.1 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('opacity-100', 'translate-y-0');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }, []);

    return (
        <div className="bg-black text-white selection:bg-white/10 selection:text-white font-normal leading-relaxed antialiased">
            <style jsx global>{`
                * {
                    font-weight: 400 !important;
                    font-style: normal !important;
                }
                .reveal {
                    opacity: 0;
                    transform: translateY(24px);
                    transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>

            <nav className="fixed top-0 left-0 right-0 h-[72px] bg-black/70 backdrop-blur-3xl border-b border-white/10 z-[1000] flex items-center">
                <div className="max-w-[1240px] mx-auto w-full px-10 flex justify-between items-center">
                    <a href="#" className="font-outfit text-[1.3rem] tracking-tight text-white flex items-center gap-3">
                        <div className="w-5 h-5 border border-white rounded-full"></div>
                        CreatioX
                    </a>
                    <div className="hidden md:flex gap-9 text-[0.82rem] tracking-wider text-zinc-400">
                        <a href="#analysis" className="hover:text-white transition-colors">Analysis</a>
                        <a href="#generation" className="hover:text-white transition-colors">Generation</a>
                        <a href="#sync" className="hover:text-white transition-colors">Social Sync</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                    </div>
                    <button onClick={onGetStarted} className="font-outfit bg-white text-black px-5 py-2 rounded-sm text-[0.8rem] tracking-wider hover:opacity-90 transition-all">
                        Get Started
                    </button>
                </div>
            </nav>

            <header className="min-h-[95vh] flex flex-col justify-center items-center text-center px-10 pt-[100px]">
                <span className="text-[0.65rem] text-zinc-500 tracking-[0.3em] uppercase mb-8">Creating Unique</span>
                <h1 className="reveal font-outfit text-[clamp(3.5rem,10vw,8rem)] tracking-[-0.05em] leading-[0.9] mb-10">Architecting Influence.</h1>
                <p className="reveal text-[1.15rem] text-zinc-400 max-w-[680px] mx-auto leading-relaxed mb-14">
                    A high-fidelity workspace designed for deep content research, niche dominance, and automated social distribution. Engineered for the future of digital sovereignty.
                </p>
                <div className="reveal">
                    <button onClick={onGetStarted} className="font-outfit bg-white text-black px-10 py-4 rounded-sm text-[0.8rem] tracking-[0.2em] hover:scale-[0.98] transition-all">
                        Open Workspace
                    </button>
                </div>
                <div className="reveal w-full max-w-[1100px] h-[500px] bg-zinc-950 border border-white/5 rounded-lg mt-10 relative flex items-center justify-center overflow-hidden">
                    <div className="w-[80%] h-[60%] border border-white/5 relative">
                        <div className="absolute top-5 left-5 w-10 h-px bg-white/20"></div>
                        <div className="absolute bottom-5 right-5 w-24 h-px bg-white/20"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center text-[0.6rem] tracking-[0.5em] uppercase text-zinc-700">System Active</div>
                </div>
            </header>

            <section id="analysis" className="py-40 px-10 max-w-[1240px] mx-auto">
                <div className="max-w-[700px] mb-20">
                    <span className="text-[0.65rem] text-zinc-500 tracking-[0.3em] uppercase mb-6 block">01. Research & Discovery</span>
                    <h2 className="reveal font-outfit text-[clamp(2.2rem,6vw,3.8rem)] tracking-tight leading-[1.05] mb-7">Mining the Signal from the Noise.</h2>
                    <p className="reveal text-zinc-400 text-[1.05rem] leading-relaxed">Our intelligence engines scan the digital landscape to identify untapped opportunities before they become mainstream. Position your brand where the attention is going, not where it has been.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 border border-white/10 bg-white/5">
                    {[
                        { num: 'SYSTEM.ANALYSIS', title: 'Niche Analysis', desc: 'Quantify audience sentiment and keyword saturation. We break down complex market dynamics into actionable data points for your next campaign.' },
                        { num: 'SYSTEM.IDENTIFY', title: 'Gap Analysis', desc: 'Discover the content your competitors are afraid to touch. We highlight the conversational voids where your voice can achieve maximum resonance.' },
                        { num: 'SYSTEM.PREDICT', title: 'Trend Management', desc: 'Monitor real-time cultural shifts across platforms. Our predictive models help you catch viral waves during their initial ascent.' }
                    ].map((f, i) => (
                        <div key={i} className="reveal bg-black p-14 border border-white/5 hover:bg-zinc-950 transition-all">
                            <span className="text-[0.6rem] text-zinc-600 mb-6 block">{f.num}</span>
                            <h3 className="font-outfit text-[1.4rem] tracking-tight mb-5">{f.title}</h3>
                            <p className="text-[0.9rem] text-zinc-500 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="generation" className="py-40 px-10 max-w-[1240px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <div className="reveal">
                        <span className="text-[0.65rem] text-zinc-500 tracking-[0.3em] uppercase mb-6 block">02. Automated Production</span>
                        <h2 className="font-outfit text-[clamp(2.2rem,6vw,3.8rem)] tracking-tight leading-[1.05] mb-7">Content Without Compromise.</h2>
                        <p className="text-zinc-400 text-[1.05rem] leading-relaxed mb-10">Leverage our generation engine to produce high-fidelity text and visuals that reflect your unique brand identity.</p>

                        <div className="space-y-6">
                            {[
                                { tag: 'A', title: 'Social Media Content Gen', desc: 'Automated drafting of threads, articles, and long-form scripts tailored to your cognitive style.' },
                                { tag: 'B', title: 'Image Generation', desc: 'Context-aware visual assets created specifically to complement your brand narrative.' }
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
                    <div className="reveal aspect-[4/3] bg-zinc-950 border border-white/10 flex items-center justify-center text-[0.6rem] tracking-[0.2em] text-zinc-700 uppercase">
                        [ Analysis Output ]
                    </div>
                </div>
            </section>

            <section id="sync" className="py-40 px-10 max-w-[1240px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <div className="reveal order-2 lg:order-1 aspect-[4/3] bg-zinc-950 border border-white/10 flex items-center justify-center text-[0.6rem] tracking-[0.2em] text-zinc-700 uppercase">
                        [ Distribution Bridge ]
                    </div>
                    <div className="reveal order-1 lg:order-2">
                        <span className="text-[0.65rem] text-zinc-500 tracking-[0.3em] uppercase mb-6 block">03. Distribution</span>
                        <h2 className="font-outfit text-[clamp(2.2rem,6vw,3.8rem)] tracking-tight leading-[1.05] mb-7">Direct Distribution.</h2>
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

            <section className="py-40 px-10 max-w-[1240px] mx-auto text-center">
                <span className="text-[0.65rem] text-zinc-500 tracking-[0.3em] uppercase mb-8 block">Workflow</span>
                <h2 className="reveal font-outfit text-[clamp(2.2rem,6vw,3.8rem)] tracking-tight leading-[1.05] mb-20">The Architecture of Output.</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-left">
                    {[
                        { title: '01. Memory Sync', desc: 'The AI learns your goals and past research to build a persistent knowledge ledger.' },
                        { title: '02. Intelligence Analysis', desc: 'Scan for gaps and trends to ensure your content is positioned for maximum impact.' },
                        { title: '03. Content Draft', desc: 'Generate optimized drafts and visual assets using your chosen brand style.' },
                        { title: '04. Final Deployment', desc: 'Review and push your content directly to social platforms with zero friction.' }
                    ].map((step, i) => (
                        <div key={i} className="reveal">
                            <h4 className="font-outfit text-[0.9rem] mb-3">{step.title}</h4>
                            <p className="text-[0.8rem] text-zinc-500 leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>


            <section id="pricing" className="py-40 px-10 max-w-[1240px] mx-auto">
                <span className="text-[0.65rem] text-zinc-500 tracking-[0.3em] uppercase mb-8 block text-center">Investment</span>
                <h2 className="reveal font-outfit text-[clamp(2.2rem,6vw,3.8rem)] tracking-tight leading-[1.05] mb-20 text-center">Scale Your Intelligence.</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="reveal border border-white/5 p-14 rounded-sm flex flex-col bg-zinc-950/20">
                        <span className="text-[0.65rem] text-zinc-500 tracking-[0.3em] uppercase mb-8 block">Subscription</span>
                        <h3 className="text-xl mb-2">Pro Monthly</h3>
                        <div className="font-outfit text-4xl my-8">$49<span className="text-sm text-zinc-600 ml-1">/mo</span></div>
                        <ul className="text-[0.85rem] text-zinc-500 space-y-4 mb-12 flex-1">
                            <li>— 50 Niche Analysis / mo</li>
                            <li>— 50 Research Studio Artifacts</li>
                            <li>— Unlimited Idea Combining</li>
                            <li>— 100 Trend Reports / mo</li>
                            <li>— Full Neural Chat Enabled</li>
                        </ul>
                        <button onClick={onGetStarted} className="w-full py-4 border border-white/10 text-white text-[0.8rem] tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-all">Select Monthly</button>
                    </div>
                    <div className="reveal bg-zinc-950 border border-white/20 p-14 rounded-sm flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 bg-white text-black text-[10px] font-normal uppercase tracking-widest">Recommended</div>
                        <span className="text-[0.65rem] text-white tracking-[0.3em] uppercase mb-8 block">Subscription</span>
                        <h3 className="text-xl mb-2">Pro Annual</h3>
                        <div className="font-outfit text-4xl my-8">$299<span className="text-sm text-zinc-600 ml-1">/yr</span></div>
                        <ul className="text-[0.85rem] text-zinc-400 space-y-4 mb-12 flex-1">
                            <li>— 80 Niche Analysis / mo</li>
                            <li>— 100 Research Studio Artifacts</li>
                            <li>— Ultimate Idea Combinations</li>
                            <li>— 200 Trend Reports / mo</li>
                            <li>— Priority Processing & Chat</li>
                        </ul>
                        <button onClick={onGetStarted} className="w-full py-4 bg-white text-black text-[0.8rem] tracking-[0.2em] uppercase hover:opacity-90 transition-all">Select Annual</button>
                    </div>
                </div>
                <p className="mt-12 text-center text-[0.6rem] text-zinc-700 uppercase tracking-widest font-normal">
                    LTD Access available for enterprise partners with clearance code.
                </p>
            </section>

            <footer className="py-24 px-10 max-w-[1240px] mx-auto border-t border-white/5">
                <div className="flex flex-col md:flex-row justify-between items-start gap-20 mb-24">
                    <a href="#" className="font-outfit text-[1.3rem] tracking-tight text-white flex items-center gap-3">
                        <div className="w-5 h-5 border border-white rounded-full"></div>
                        CreatioX
                    </a>
                    <div className="flex gap-20 flex-wrap">
                        <div className="min-w-[100px]">
                            <h5 className="text-[0.7rem] text-zinc-600 tracking-[0.2em] uppercase mb-6">Platform</h5>
                            <div className="flex flex-col gap-3 text-[0.8rem] text-zinc-500">
                                <a href="#analysis" className="hover:text-white transition-colors">Analysis</a>
                                <a href="#generation" className="hover:text-white transition-colors">Generation</a>
                                <a href="#sync" className="hover:text-white transition-colors">Distribution</a>
                            </div>
                        </div>
                        <div className="min-w-[100px]">
                            <h5 className="text-[0.7rem] text-zinc-600 tracking-[0.2em] uppercase mb-6">Company</h5>
                            <div className="flex flex-col gap-3 text-[0.8rem] text-zinc-500">
                                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                            </div>
                        </div>
                        <div className="min-w-[100px]">
                            <h5 className="text-[0.7rem] text-zinc-600 tracking-[0.2em] uppercase mb-6">Connect</h5>
                            <div className="flex flex-col gap-3 text-[0.8rem] text-zinc-500">
                                <a href="#" className="hover:text-white transition-colors">Twitter / X</a>
                                <a href="#" className="hover:text-white transition-colors">Discord</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center text-[0.7rem] text-zinc-700">
                    <p>© 2026 CreatioX Intelligence Labs. All rights reserved.</p>
                    <p>Built for the creators of tomorrow.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
