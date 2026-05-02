
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
    { id: 'chat' as ViewType, icon: MessageSquare, label: 'Neural AI' },
    { id: 'analytics' as ViewType, icon: BarChart3, label: 'Analytics' },
    { id: 'marketing' as ViewType, icon: Megaphone, label: 'Marketing' },
    { id: 'interests' as ViewType, icon: Fingerprint, label: 'Interests' },
    { id: 'ideas' as ViewType, icon: Lightbulb, label: 'Ideas' },
    { id: 'settings' as ViewType, icon: Settings, label: 'Config' },
  ];

  return (
    <nav className="hidden lg:grid grid-cols-3 items-center px-6 py-2.5 bg-black/90 backdrop-blur-2xl border-b border-zinc-900/80 z-50 flex-shrink-0">

      {/* ── Left: Brand ── */}
      <div
        className="flex items-center gap-2.5 cursor-pointer group w-fit"
        onClick={() => setActiveView('chat')}
      >
        <NeuralLogo size={26} />
        <h1
          className="text-base font-normal tracking-tighter text-white group-hover:text-zinc-300 transition-colors"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          Creatio
        </h1>
      </div>

      {/* ── Center: Nav Pills ── */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-0.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800/70 shadow-xl">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            const locked = isLocked && item.id !== 'chat' && item.id !== 'settings';
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                title={item.label}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-normal uppercase tracking-widest transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-black shadow-md'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <item.icon size={12} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="hidden xl:inline">{item.label}</span>
                {locked && (
                  <Lock size={8} className={`${isActive ? 'text-black/40' : 'text-zinc-700'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right: Status + User ── */}
      <div className="flex items-center justify-end gap-3">

        {/* Neural link status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900/60 border border-zinc-800/50 rounded-full">
          <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[8px] font-normal uppercase tracking-[0.3em] text-zinc-500">Online</span>
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
