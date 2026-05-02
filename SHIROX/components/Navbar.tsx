
import React from 'react';
import { ViewType, UserSettings } from '../types';
import NeuralLogo from './NeuralLogo';
import {
  MessageSquare,
  BarChart3,
  Megaphone,
  Fingerprint,
  Lightbulb,
  Settings,
  Search,
  LogOut,
  Lock,
} from 'lucide-react';

interface NavbarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  userSettings: UserSettings;
  onSignOut: () => void;
  isLocked?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  userSettings,
  onSignOut,
  isLocked = false,
}) => {
  const navItems = [
    { id: 'chat' as ViewType, icon: MessageSquare, label: 'AI Assistant' },
    { id: 'analytics' as ViewType, icon: BarChart3, label: 'Analytics' },
    { id: 'marketing' as ViewType, icon: Megaphone, label: 'Marketing' },
    { id: 'interests' as ViewType, icon: Fingerprint, label: 'Interests' },
    { id: 'ideas' as ViewType, icon: Lightbulb, label: 'Ideas' },
    { id: 'settings' as ViewType, icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="hidden lg:grid grid-cols-3 items-center px-10 h-[90px] bg-black border-b border-white/5 z-[60] flex-shrink-0 shadow-[0_10px_50px_rgba(0,0,0,0.9)]">

      {/* ── Left: Brand ── */}
      <div
        className="flex items-center gap-4 cursor-pointer group w-fit"
        onClick={() => setActiveView('chat')}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 blur-xl rounded-full animate-pulse"></div>
          <NeuralLogo size={36} />
        </div>
        <div>
          <h1 className="text-xl font-normal tracking-tighter text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>Creatio</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[7px] font-normal uppercase tracking-[0.4em] text-zinc-500">v5.1 System Active</span>
          </div>
        </div>
      </div>

      {/* ── Center: Nav Pills ── */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1.5 bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-3xl">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            const locked = isLocked && item.id !== 'chat' && item.id !== 'settings';
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`relative flex items-center gap-3 px-6 py-3.5 rounded-xl text-[10px] font-normal uppercase tracking-[0.2em] transition-all duration-300 ${
                  isActive
                    ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-105'
                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={15} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="hidden xl:inline">{item.label}</span>
                {locked && (
                  <Lock size={10} className={`${isActive ? 'text-black/40' : 'text-zinc-700'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right: Status + User ── */}
      <div className="flex items-center justify-end gap-3">

        {/* AI status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900/60 border border-zinc-800/50 rounded-full">
          <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[8px] font-normal uppercase tracking-[0.3em] text-zinc-500">AI Active</span>
        </div>

        {/* Search */}
        <button
          onClick={() => setActiveView('search')}
          className={`p-1.5 rounded-lg transition-all duration-200 ${
            activeView === 'search'
              ? 'text-white bg-white/10'
              : 'text-zinc-500 hover:text-white hover:bg-white/5'
          }`}
        >
          <Search size={15} />
        </button>

        <div className="h-4 w-px bg-zinc-800" />

        {/* User block */}
        <div className="flex items-center gap-2">
          <div className="text-right leading-tight">
            <p className="text-[9px] font-normal uppercase tracking-widest text-zinc-300">
              {userSettings.name}
            </p>
            <p className="text-[8px] text-zinc-600 font-normal">{userSettings.tier || 'Free'}</p>
          </div>
          <div
            className="w-7 h-7 rounded-full border border-zinc-800 flex items-center justify-center text-[9px] font-normal text-white flex-shrink-0 shadow-md"
            style={{ background: userSettings.avatarColor }}
          >
            {userSettings.name.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={onSignOut}
            className="p-1.5 text-zinc-700 hover:text-red-400 transition-colors rounded-lg hover:bg-red-950/20"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
