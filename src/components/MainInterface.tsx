
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LogOut } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ChatInterface from '@/components/ChatInterface';
import IdeasManager from '@/components/IdeasManager';
import SearchManager from '@/components/SearchManager';
import TrendsManager from '@/components/TrendsManager';
import InterestsManager from '@/components/InterestsManager';
import MarketingStudio from '@/components/MarketingStudio';
import OmniTerminal from '@/components/OmniTerminal';
import SettingsManager from '@/components/SettingsManager';
import NicheAnalytics from '@/components/NicheAnalytics';
import LimitReachedModal from '@/components/LimitReachedModal';
import PricingScreen from '@/components/PricingScreen';
import { Idea, Message, Interest, ViewType, UserSettings, NicheAnalyticsData } from '@/types';
import { DEFAULT_SYSTEM_PROMPT } from '@/constants';
import * as actions from '@/app/actions';

interface MainInterfaceProps {
    initialSettings: UserSettings;
    initialInterests: Interest[];
    initialMemories: string[];
    initialIdeas: Idea[];
    initialArchive: Message[];
}

export default function MainInterface({
    initialSettings,
    initialInterests,
    initialMemories,
    initialIdeas,
    initialArchive
}: MainInterfaceProps) {
    const [activeView, setActiveView] = useState<ViewType>('chat');
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [userSettings, setUserSettings] = useState<UserSettings>(initialSettings);
    const [interests, setInterests] = useState<Interest[]>(initialInterests);
    const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
    const [messages, setMessages] = useState<Message[]>(initialArchive);
    const [neuralMemories, setNeuralMemories] = useState<string[]>(initialMemories);

    const [limitModal, setLimitModal] = useState<{ message: string } | null>(null);
    const [showPricingOnce, setShowPricingOnce] = useState(false);

    const [nicheAnalyticsData, setNicheAnalyticsData] = useState<NicheAnalyticsData>({
        predictions: [],
        creators: [],
        gaps: [],
    });

    // ── Sync pricing visibility ──────────────────────────────────────────────
    useEffect(() => {
        const hasSeenPricing = localStorage.getItem('CreatioXx_pricing_shown');
        if (userSettings.tier === 'Free' && !hasSeenPricing) {
            setShowPricingOnce(true);
        }
    }, [userSettings.tier]);

    // ── Sync Auth state to user settings ────────────────────────────────────
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const user = session?.user;
            if (user && (!userSettings.email || userSettings.name === 'Operator')) {
                const updatedSettings = {
                    ...userSettings,
                    email: user.email || userSettings.email,
                    name: user.user_metadata?.full_name || user.email?.split('@')[0] || userSettings.name
                };
                setUserSettings(updatedSettings);
                actions.saveUserSettings(updatedSettings).catch(() => { });
            }
        });
        return () => subscription.unsubscribe();
    }, [userSettings]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        await fetch('/api/auth/session', { method: 'DELETE' });
        localStorage.removeItem('CreatioXx_pricing_shown');
        window.location.reload();
    };

    const onSaveIdea = async (idea: Idea) => {
        const newIdeas = [idea, ...ideas];
        setIdeas(newIdeas);
        await actions.saveIdeas(newIdeas);
    };

    const onDeleteIdea = async (id: string) => {
        if (!confirm('Permanently remove this research pillar?')) return;
        const newIdeas = ideas.filter(i => i.id !== id);
        setIdeas(newIdeas);
        await actions.saveIdeas(newIdeas);
    };

    const onCommitMemory = async (packet: string) => {
        setNeuralMemories(prev => [packet, ...prev]);
        await actions.saveMemory(packet, 'manual');
    };

    const onLimitReached = useCallback((message: string) => {
        setLimitModal({ message });
    }, []);

    const handleTerminalCommand = useCallback((cmd: string, args: string) => {
        if (['goto', 'nav'].includes(cmd) && ['chat', 'search', 'ideas', 'marketing', 'interests', 'settings', 'analytics'].includes(args)) {
            setActiveView(args as ViewType);
        }
    }, []);

    const enhancedSystemPrompt = `
${userSettings.customSystemPrompt || DEFAULT_SYSTEM_PROMPT}

NEURAL LEDGER (Prior Context Archives):
${neuralMemories.length > 0 ? neuralMemories.map((m, i) => `${i + 1}. ${m}`).join('\n') : 'Empty state.'}
    `.trim();

    return (
        <div className="flex h-screen w-full bg-black text-white overflow-hidden selection:bg-white/10 relative">
            {limitModal && (
                <LimitReachedModal
                    message={limitModal.message}
                    onClose={() => setLimitModal(null)}
                />
            )}

            {showPricingOnce && (
                <PricingScreen
                    onSelectTier={async (tier) => {
                        await actions.saveUserSettings({ tier: tier as any });
                        localStorage.setItem('CreatioXx_pricing_shown', 'true');
                        setShowPricingOnce(false);
                    }}
                />
            )}

            <Sidebar
                activeView={activeView}
                setActiveView={(v) => { setActiveView(v); setIsMobileMenuOpen(false); }}
                onClearMemory={() => setMessages([])}
                userSettings={userSettings}
                onSignOut={handleSignOut}
                isMobileOpen={isMobileMenuOpen}
                setIsMobileOpen={setIsMobileMenuOpen}
            />

            <main className="flex-1 relative flex flex-col bg-zinc-950/50 min-w-0">
                <div className="absolute top-6 right-8 z-10 hidden lg:flex items-center gap-4">
                    <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-full text-[10px] font-normal tracking-[0.3em] text-zinc-400 uppercase">
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Neural Link: Active
                    </div>
                    <button onClick={handleSignOut} className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-[10px] font-normal text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-2">
                        <LogOut size={12} /> Disconnect
                    </button>
                </div>

                <div className="flex-1 overflow-auto">
                    {activeView === 'chat' && (
                        <ChatInterface
                            messages={messages}
                            setMessages={setMessages}
                            onSaveIdea={onSaveIdea}
                            onCommitMemory={onCommitMemory}
                            userSettings={userSettings}
                            systemInstruction={enhancedSystemPrompt}
                        />
                    )}
                    {activeView === 'search' && <SearchManager ideas={ideas} messages={messages} setActiveView={setActiveView} />}
                    {activeView === 'ideas' && (
                        <IdeasManager
                            ideas={ideas}
                            setIdeas={(update) => {
                                const nextIdeas = typeof update === 'function' ? update(ideas) : update;
                                setIdeas(nextIdeas);
                                actions.saveIdeas(nextIdeas);
                            }}
                        />
                    )}
                    {activeView === 'interests' && (
                        <InterestsManager
                            interests={interests}
                            setInterests={(update) => {
                                const nextInterests = typeof update === 'function' ? update(interests) : update;
                                setInterests(nextInterests);
                                actions.saveInterests(nextInterests);
                            }}
                        />
                    )}
                    {activeView === 'marketing' && (
                        <MarketingStudio
                            ideas={ideas}
                            interests={interests}
                            userSettings={userSettings}
                            systemInstruction={enhancedSystemPrompt}
                            onDeleteIdea={onDeleteIdea}
                        />
                    )}
                    {activeView === 'analytics' && (
                        <NicheAnalytics
                            interests={interests}
                            onSaveIdea={onSaveIdea}
                            userSettings={userSettings}
                            systemInstruction={enhancedSystemPrompt}
                            data={nicheAnalyticsData}
                            onUpdateData={setNicheAnalyticsData}
                            onLimitReached={onLimitReached}
                        />
                    )}
                    {activeView === 'settings' && (
                        <SettingsManager
                            userSettings={userSettings}
                            setUserSettings={(update) => {
                                const nextSettings = typeof update === 'function' ? update(userSettings) : update;
                                setUserSettings(nextSettings);
                                actions.saveUserSettings(nextSettings);
                            }}
                        />
                    )}                </div>

                <TrendsManager interests={interests} onSaveIdea={onSaveIdea} userSettings={userSettings} systemInstruction={enhancedSystemPrompt} onLimitReached={onLimitReached} />
                <OmniTerminal isOpen={isTerminalOpen} setIsOpen={setIsTerminalOpen} onCommand={handleTerminalCommand} />
            </main>
        </div>
    );
}
