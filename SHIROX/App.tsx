
import React, { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { fetchUserSettings, saveUserSettings, fetchMemories, saveMemory, fetchInterests, saveInterests, fetchIdeas, saveIdeas, fetchArchive, saveArchive } from './services/apiService';
import AuthScreen from './components/AuthScreen';
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
import { Idea, Message, Interest, ViewType, UserSettings, NicheAnalyticsData } from './types';
import { INITIAL_INTERESTS, DEFAULT_SYSTEM_PROMPT } from './constants';

// ─── Loading Screen ───────────────────────────────────────────────────────────
const NeuralLoader: React.FC = () => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
    <div
      className="text-4xl font-black tracking-tighter bg-gradient-to-b from-white via-white to-zinc-800 bg-clip-text text-transparent italic"
      style={{ fontFamily: "'Orbitron', sans-serif" }}
    >
      ArsCreatio
    </div>
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
    <p className="text-zinc-700 text-[10px] uppercase tracking-[0.5em] font-black">Syncing Neural Link...</p>
  </div>
);

// ─── Main App ─────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>('chat');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [neuralMemories, setNeuralMemories] = useState<string[]>([]);

  // ── Limit Modal State ──────────────────────────────────────────────────────
  const [limitModal, setLimitModal] = useState<{ message: string } | null>(null);

  const [userSettings, setUserSettings] = useState<UserSettings>({
    name: 'Operator',
    email: '',
    handle: 'neural_link',
    avatarColor: '#ffffff',
    customSystemPrompt: DEFAULT_SYSTEM_PROMPT,
    linkedAccounts: [],
    xPostImages: true,
    xThreadImages: true,
  });

  const [interests, setInterests] = useState<Interest[]>(INITIAL_INTERESTS);
  const [ideas, setIdeas] = useState<Idea[]>(() => {
    const saved = localStorage.getItem('ArsCreatio_ideas');
    return saved ? JSON.parse(saved) : [];
  });
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('ArsCreatio_messages');
    return saved ? JSON.parse(saved) : [];
  });

  const [nicheAnalyticsData, setNicheAnalyticsData] = useState<NicheAnalyticsData>({
    predictions: [],
    creators: [],
    gaps: [],
  });

  // ── Global limit-reached handler ────────────────────────────────────────────
  // Children call this when they get a 429 / LIMIT error from the backend
  const onLimitReached = useCallback((message: string) => {
    setLimitModal({ message });
  }, []);

  // ── Auth State Listener ───────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
      // Clear data on sign-out / session change
      if (!session) {
        setMessages([]);
        setNeuralMemories([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Sync Neural Data from Backend ──────────────────────────────────────────
  useEffect(() => {
    if (!session) return;

    const syncNeuralData = async () => {
      try {
        console.log('Initiating Authenticated Neural Sync...');

        const settings = await fetchUserSettings();
        if (settings?.name) {
          setUserSettings(prev => ({
            ...prev,
            ...settings,
            email: session.user.email || prev.email,
          }));
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
  }, [session]);

  // ── Persist Settings to Backend ───────────────────────────────────────────
  useEffect(() => {
    if (!session || userSettings.name === 'Operator') return;
    saveUserSettings(userSettings).catch(() => { });
  }, [userSettings, session]);

  // ── Persist Interests ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!session || interests.length === 0) return;
    localStorage.setItem('ArsCreatio_interests', JSON.stringify(interests));
    saveInterests(interests).catch(() => { });
  }, [interests, session]);

  // ── Persist Ideas ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!session) return;
    localStorage.setItem('ArsCreatio_ideas', JSON.stringify(ideas));
    saveIdeas(ideas).catch(() => { });
  }, [ideas, session]);

  // ── Persist Messages ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!session) return;
    localStorage.setItem('ArsCreatio_messages', JSON.stringify(messages));
    saveArchive(messages).catch(() => { });
  }, [messages, session]);

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
    if (confirm('Permanently wipe ArsCreatio neural session?')) setMessages([]);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMessages([]);
    setNeuralMemories([]);
    setUserSettings({ name: 'Operator', email: '', handle: 'neural_link', avatarColor: '#ffffff', customSystemPrompt: DEFAULT_SYSTEM_PROMPT, linkedAccounts: [] });
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

  // ── Detect if user is a guest (anonymous) ─────────────────────────────────
  const isGuest = !!session && !session.user.email;

  // ── Render ────────────────────────────────────────────────────────────────
  if (authLoading) return <NeuralLoader />;
  if (!session) return <AuthScreen />;

  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden selection:bg-white/10 relative">
      {/* Global Limit Modal */}
      {limitModal && (
        <LimitReachedModal
          message={limitModal.message}
          isGuest={isGuest}
          onClose={() => setLimitModal(null)}
        />
      )}

      <Sidebar
        activeView={activeView}
        setActiveView={(v) => { setActiveView(v); setIsMobileMenuOpen(false); }}
        onClearMemory={handleClearMemory}
        userSettings={userSettings}
        onSignOut={handleSignOut}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
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
            <span className="text-sm font-black tracking-tighter uppercase italic" style={{ fontFamily: "'Orbitron', sans-serif" }}>ArsCreatio</span>
          </div>
          <div className="w-8 h-8 rounded-full flex-shrink-0 border border-zinc-800" style={{ background: userSettings.avatarColor }} />
        </div>

        {/* Guest Banner */}
        {isGuest && (
          <div className="lg:hidden hidden" />
        )}

        <div className="absolute top-6 right-8 z-10 hidden lg:flex items-center gap-4">
          {/* Guest indicator */}
          {isGuest && (
            <button
              onClick={() => supabase.auth.signOut()}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-[9px] font-black tracking-widest text-amber-400 uppercase hover:bg-amber-500/20 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Guest Mode · Sign Up Free
            </button>
          )}
          <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-full text-[10px] font-black tracking-[0.3em] text-zinc-400 uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Neural Link: Active
          </div>
          <button
            onClick={() => setIsTerminalOpen(true)}
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-[10px] font-bold text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
          >
            <kbd className="font-sans">⌘</kbd>K
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
          {activeView === 'search' && (
            <SearchManager ideas={ideas} messages={messages} setActiveView={setActiveView} />
          )}
          {activeView === 'ideas' && (
            <IdeasManager ideas={ideas} setIdeas={setIdeas} />
          )}
          {activeView === 'interests' && (
            <InterestsManager interests={interests} setInterests={setInterests} />
          )}
          {activeView === 'marketing' && (
            <MarketingStudio ideas={ideas} interests={interests} userSettings={userSettings} systemInstruction={enhancedSystemPrompt} onDeleteIdea={onDeleteIdea} />
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
            <SettingsManager userSettings={userSettings} setUserSettings={setUserSettings} />
          )}
        </div>

        <TrendsManager
          interests={interests}
          onSaveIdea={onSaveIdea}
          userSettings={userSettings}
          systemInstruction={enhancedSystemPrompt}
          onLimitReached={onLimitReached}
        />
        <OmniTerminal isOpen={isTerminalOpen} setIsOpen={setIsTerminalOpen} onCommand={handleTerminalCommand} />
      </main>
    </div>
  );
};

export default App;
