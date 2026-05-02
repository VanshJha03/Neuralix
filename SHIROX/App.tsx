'use client';

import { supabase } from './lib/supabase';
import React, { useState, useEffect, useCallback } from 'react';
import { LogOut } from 'lucide-react';
import { fetchUserSettings, saveUserSettings, fetchMemories, saveMemory, fetchInterests, saveInterests, fetchIdeas, saveIdeas, fetchArchive, saveArchive } from './services/apiService';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import IdeasManager from './components/IdeasManager';
import SearchManager from './components/SearchManager';
import TrendsManager from './components/TrendsManager';
import InterestsManager from './components/InterestsManager';
import MarketingStudio from './components/MarketingStudio';
import OmniTerminal from './components/OmniTerminal';
import SettingsManager from './components/SettingsManager';
import NicheAnalytics from './components/NicheAnalytics';
import LimitReachedModal from './components/LimitReachedModal';
import PricingScreen from './components/PricingScreen';
import PublicHome from './components/PublicHome';
import Navbar from './components/Navbar';
import { Idea, Message, Interest, ViewType, UserSettings, NicheAnalyticsData } from './types';
import { INITIAL_INTERESTS, DEFAULT_SYSTEM_PROMPT } from './constants';

// ─── Loading Screen ───────────────────────────────────────────────────────────
const NeuralLoader: React.FC = () => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
    <div
      className="text-4xl font-normal tracking-tighter bg-gradient-to-b from-white via-white to-zinc-800 bg-clip-text text-transparent font-normal"
      style={{ fontFamily: "'Orbitron', sans-serif" }}
    >
      Creatio
    </div>
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
    <p className="text-zinc-700 text-[10px] uppercase tracking-[0.5em] font-normal">Syncing Neural Link...</p>
  </div>
);

// ─── Main App ─────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('chat');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [neuralMemories, setNeuralMemories] = useState<string[]>([]);

  // ── Limit Modal State ──────────────────────────────────────────────────────
  const [limitModal, setLimitModal] = useState<{ message: string } | null>(null);
  const [showPricingOnce, setShowPricingOnce] = useState(false);

  const [userSettings, setUserSettings] = useState<UserSettings>({
    name: 'Operator',
    email: '',
    handle: 'neural_link',
    avatarColor: '#ffffff',
    customSystemPrompt: DEFAULT_SYSTEM_PROMPT,
    linkedAccounts: [],
    xPostImages: true,
    xThreadImages: true,
    tier: undefined,
    usage: {
      analytics: 0,
      totalAnalytics: 0,
      content: 0,
      totalContent: 0,
      image: 0,
      gap: 0,
      chat: 0,
    }
  });

  const [interests, setInterests] = useState<Interest[]>(INITIAL_INTERESTS);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  // Load from localStorage on client only
  useEffect(() => {
    const savedIdeas = localStorage.getItem('Creatio_ideas');
    if (savedIdeas) setIdeas(JSON.parse(savedIdeas));
    const savedMessages = localStorage.getItem('Creatio_messages');
    if (savedMessages) setMessages(JSON.parse(savedMessages));
  }, []);

  const [nicheAnalyticsData, setNicheAnalyticsData] = useState<NicheAnalyticsData>({
    predictions: [],
    creators: [],
    gaps: [],
  });

  // ── Session Sync (Supabase) ────────────────────────────────────────────────
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session?.user ?? null);
      setAuthLoading(false);
    });
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Global limit-reached handler ────────────────────────────────────────────
  const onLimitReached = useCallback((message: string) => {
    setLimitModal({ message });
  }, []);

  // ── Sync Neural Data from Backend ──────────────────────────────────────────
  useEffect(() => {
    const syncNeuralData = async () => {
      try {
        console.log('Initiating Local Neural Sync...');

        const settings = await fetchUserSettings();
        if (settings) {
          setUserSettings(prev => ({
            ...prev,
            ...settings,
          }));
          // If newly logged in or just testing, show pricing
          if (!localStorage.getItem('Creatio_pricing_shown')) {
            setShowPricingOnce(true);
            localStorage.setItem('Creatio_pricing_shown', 'true');
          }
        } else if (session) {
          // Auto-create user settings if not found but session exists
          const initialSettings = {
            ...userSettings,
            email: session.email,
            name: session.user_metadata?.full_name || session.user_metadata?.name || 'Operator',
          };
          setUserSettings(initialSettings);
          await saveUserSettings(initialSettings);
        }

        const serverInterests = await fetchInterests();
        if (serverInterests && serverInterests.length > 0) {
          setInterests(serverInterests);
        }

        const memories = await fetchMemories();
        setNeuralMemories(memories);

        const serverIdeas = await fetchIdeas();
        if (serverIdeas && serverIdeas.length > 0) {
          setIdeas(serverIdeas);
        } else if (ideas.length > 0) {
          await saveIdeas(ideas);
        }

        const serverArchive = await fetchArchive();
        if (serverArchive && serverArchive.length > 0) {
          setMessages(serverArchive);
        } else if (messages.length > 0) {
          await saveArchive(messages);
        }

        console.log('Neural Sync Complete.');
      } catch (err) {
        console.warn('Neural sync failed. Using local cache.', err);
      }
    };

    syncNeuralData();
  }, []); // Run once on mount

  // ── Sync Auth State to User Settings ──────────────────────────────────────
  useEffect(() => {
    if (session && (!userSettings.email || userSettings.name === 'Operator')) {
      setUserSettings(prev => ({
        ...prev,
        email: session.email || prev.email,
        name: session.user_metadata?.full_name || session.user_metadata?.name || prev.name,
      }));
    }
  }, [session]);

  // ── Persist Settings to Backend ───────────────────────────────────────────
  useEffect(() => {
    saveUserSettings(userSettings).catch(() => { });
  }, [userSettings]);

  // ── Persist Interests ──────────────────────────────────────────────────────
  useEffect(() => {
    if (interests.length === 0) return;
    localStorage.setItem('Creatio_interests', JSON.stringify(interests));
    saveInterests(interests).catch(() => { });
  }, [interests]);

  const handleSelectTier = async (tier: string) => {
    try {
      const res = await fetch(`/api/payments/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.checkout_url) window.location.href = data.checkout_url;
      else throw new Error(data.error || 'No checkout URL returned');
    } catch (e) {
      console.error('Checkout failed:', e);
      alert('Could not start checkout. Please try again.');
    }
  };

  // ── Persist Ideas ──────────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('Creatio_ideas', JSON.stringify(ideas));
    saveIdeas(ideas).catch(() => { });
  }, [ideas]);

  // ── Persist Messages ───────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('Creatio_messages', JSON.stringify(messages));
    saveArchive(messages).catch(() => { });
  }, [messages]);

  // ── Keyboard Shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setIsTerminalOpen(prev => !prev); }
      if (e.key === 'Escape') setIsTerminalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleClearMemory = () => {
    if (confirm('Permanently wipe Creatio neural session?')) setMessages([]);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('Creatio_pricing_shown');
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const onSaveIdea = (idea: Idea) => setIdeas(prev => [idea, ...prev]);
  const onDeleteIdea = (id: string) => {
    if (confirm('Permanently remove this research pillar?')) setIdeas(prev => prev.filter(i => i.id !== id));
  };

  const onCommitMemory = async (packet: string) => {
    try {
      await saveMemory(packet, 'manual');
      setNeuralMemories(prev => [packet, ...prev]);
    } catch (err) {
      console.error('Memory sync failure', err);
    }
  };

  const handleTerminalCommand = useCallback((cmd: string, args: string) => {
    switch (cmd) {
      case 'goto':
      case 'nav':
        if (['chat', 'search', 'ideas', 'marketing', 'interests', 'settings', 'analytics'].includes(args)) {
          setActiveView(args as ViewType);
        }
        break;
      case 'niche':
        setInterests(prev => [...prev, { id: Date.now().toString(), label: args, active: true }]);
        setActiveView('interests');
        break;
      case 'clear':
        handleClearMemory();
        break;
      default:
        break;
    }
  }, []);

  // ── System Prompt ──────────────────────────────────────────────────────────
  const enhancedSystemPrompt = `
${DEFAULT_SYSTEM_PROMPT}

${userSettings.styles && userSettings.styles.length > 0
      ? `COGNITIVE STYLE OVERRIDE:\nApply a blend of ${userSettings.styles.join(' and ')} style to your responses.`
      : ''}

NEURAL LEDGER (Prior Context Archives):
${neuralMemories.length > 0
      ? neuralMemories.map((m, i) => `${i + 1}. ${m}`).join('\n')
      : 'Empty state. Initializing fresh intelligence.'}

CRITICAL: Do not repeat these memories verbatim. Use them to understand user goals, past decisions, and current projects.
  `.trim();

  // ── Render ────────────────────────────────────────────────────────────────
  if (authLoading) return <NeuralLoader />;
  if (!session) return <PublicHome />;

  // User is locked if on Free tier
  const isLocked = !userSettings.tier || userSettings.tier === 'Free';

  return (
    <div className="flex h-dvh w-full bg-black text-white overflow-hidden selection:bg-white/10 relative flex-col">
      <Navbar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        userSettings={userSettings} 
        onSignOut={handleSignOut} 
        isLocked={isLocked}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - Mobile Only */}
        <Sidebar
          activeView={activeView}
          setActiveView={(v) => { setActiveView(v); setIsMobileMenuOpen(false); }}
          onClearMemory={handleClearMemory}
          userSettings={userSettings}
          onSignOut={handleSignOut}
          isMobileOpen={isMobileMenuOpen}
          setIsMobileOpen={setIsMobileMenuOpen}
          isLocked={isLocked}
        />

        <main className="flex-1 relative flex flex-col bg-zinc-950/50 min-w-0">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-zinc-900 bg-black/50 backdrop-blur-xl z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 text-zinc-400 hover:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </button>
              <span className="text-sm font-normal tracking-tighter uppercase font-normal" style={{ fontFamily: "'Orbitron', sans-serif" }}>Creatio</span>
            </div>
            <div className="w-8 h-8 rounded-full flex-shrink-0 border border-zinc-800" style={{ background: userSettings.avatarColor }} />
          </div>

          <div className="absolute top-6 right-8 z-10 hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-full text-[10px] font-normal tracking-[0.3em] text-zinc-400 uppercase">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Neural Link: Active
            </div>
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
                isLocked={isLocked}
              />
            )}
            {activeView === 'search' && (
              <SearchManager ideas={ideas} messages={messages} setActiveView={setActiveView} isLocked={isLocked} />
            )}
            {activeView === 'ideas' && (
              <IdeasManager ideas={ideas} setIdeas={setIdeas} isLocked={isLocked} />
            )}
            {activeView === 'interests' && (
              <InterestsManager interests={interests} setInterests={setInterests} isLocked={isLocked} />
            )}
            {activeView === 'marketing' && (
              <MarketingStudio ideas={ideas} interests={interests} userSettings={userSettings} systemInstruction={enhancedSystemPrompt} onDeleteIdea={onDeleteIdea} isLocked={isLocked} />
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
                isLocked={isLocked}
              />
            )}
            {activeView === 'settings' && (
              <SettingsManager userSettings={userSettings} setUserSettings={setUserSettings} />
            )}
          </div>

          <TrendsManager
            interests={interests}
            onSaveIdea={onSaveIdea}
            userSettings={userSettings}
            systemInstruction={enhancedSystemPrompt}
            onLimitReached={onLimitReached}
            isLocked={isLocked}
          />
          <OmniTerminal isOpen={isTerminalOpen} setIsOpen={setIsTerminalOpen} onCommand={handleTerminalCommand} />
        </main>
      </div>

      {limitModal && (
        <LimitReachedModal
          message={limitModal.message}
          onClose={() => setLimitModal(null)} isGuest={false} />
      )}

      {showPricingOnce && isLocked && (
        <PricingScreen onSelectTier={handleSelectTier} />
      )}
    </div>
  );
};

export default App;
