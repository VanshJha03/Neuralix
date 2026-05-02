
import {
  Search,
  MessageSquare,
  Lightbulb,
  Trash2,
  Megaphone,
  Fingerprint,
  Settings,
  BarChart3,
  ChevronRight,
  LogOut,
  Lock
} from 'lucide-react';
import NeuralLogo from './NeuralLogo';
import React, { useState } from 'react';
import { ViewType, UserSettings } from '../types';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  onClearMemory: () => void;
  onSignOut: () => void;
  userSettings: UserSettings;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  isLocked?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  onClearMemory,
  onSignOut,
  userSettings,
  isMobileOpen,
  setIsMobileOpen,
  isLocked = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: 'chat' as ViewType, icon: MessageSquare, label: "Neural AI" },
    { id: 'analytics' as ViewType, icon: BarChart3, label: "Niche Analytics" },
    { id: 'marketing' as ViewType, icon: Megaphone, label: "Marketing Studio" },
    { id: 'interests' as ViewType, icon: Fingerprint, label: "Interest Markers" },
    { id: 'ideas' as ViewType, icon: Lightbulb, label: "Idea Bank" },
    { id: 'settings' as ViewType, icon: Settings, label: "Neural Config" },
  ];

  const Item = ({ id, icon: Icon, label }: { id: ViewType, icon: any, label: string }) => (
    <button
      onClick={() => setActiveView(id)}
      className={`w-full flex items-center justify-start gap-4 p-4 rounded-2xl transition-all duration-300 group relative ${activeView === id
        ? 'bg-white/10 text-white shadow-xl backdrop-blur-md'
        : 'text-zinc-400 hover:text-white hover:bg-white/5'
        }`}
    >
      <Icon size={20} className={activeView === id ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'} />
      <span className={`text-[11px] font-normal uppercase tracking-widest truncate ${isCollapsed && 'lg:hidden'}`}>{label}</span>
      {isLocked && id !== 'chat' && id !== 'settings' && <Lock size={10} className="ml-auto text-zinc-600" />}

      {isCollapsed && (
        <div className="hidden lg:block absolute left-full ml-4 px-3 py-1 bg-zinc-900/90 border border-zinc-800 text-white text-[10px] font-normal uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 whitespace-nowrap shadow-2xl backdrop-blur-xl">
          {label}
        </div>
      )}
    </button>
  );

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen?.(false)}
        />
      )}

      <div className={`lg:hidden fixed inset-y-0 left-0 h-full bg-zinc-900/90 backdrop-blur-3xl border-r border-zinc-800/50 flex flex-col transition-all duration-500 z-50 ${isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full'}`}>
        {/* Brand */}
        <div className="p-8 mb-8 flex items-center gap-4 cursor-pointer" onClick={() => setActiveView('chat')}>
          <NeuralLogo size={42} />
          {!isCollapsed && (
            <div>
              <h1 className="text-2xl font-normal tracking-tighter text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>Creatio</h1>
              <p className="text-[7px] font-normal uppercase tracking-[0.5em] text-zinc-500">Neural Intelligence</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
          <button
            onClick={() => setActiveView('search')}
            className={`w-full flex items-center gap-4 p-4 mb-4 bg-white/5 border border-white/5 rounded-2xl text-zinc-400 hover:border-white/20 hover:text-white transition-all group relative backdrop-blur-md`}
          >
            <Search size={18} />
            {!isCollapsed && <span className="text-[10px] font-normal uppercase tracking-[0.2em]">Global Search</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-1 bg-zinc-900 border border-zinc-800 text-white text-[10px] font-normal uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 whitespace-nowrap shadow-2xl backdrop-blur-xl">
                Global Search
              </div>
            )}
          </button>

          {navItems.map(item => (
            <Item key={item.id} {...item} />
          ))}
        </div>

        <div className="p-6 mt-auto space-y-2">
          {/* User info */}
          {!isCollapsed && (
            <div className="flex items-center gap-3 px-2 py-3 mb-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-normal flex-shrink-0"
                style={{ background: userSettings.avatarColor || '#dc2626' }}
              >
                {userSettings.name?.charAt(0).toUpperCase() || 'O'}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-normal uppercase tracking-widest text-zinc-300 truncate">{userSettings.name}</p>
                <p className="text-[9px] text-zinc-600 truncate">{userSettings.email || '@' + userSettings.handle}</p>
              </div>
            </div>
          )}

          <button
            onClick={onClearMemory}
            className={`w-full flex items-center gap-3 p-4 rounded-xl text-zinc-600 hover:text-white transition-colors group relative`}
          >
            <Trash2 size={18} />
            {!isCollapsed && <span className="text-[9px] font-normal uppercase tracking-[0.2em]">Wipe Session</span>}
          </button>

          <button
            onClick={onSignOut}
            className={`w-full flex items-center gap-3 p-4 rounded-xl text-zinc-600 hover:text-red-400 hover:bg-red-950/20 transition-all group relative border border-transparent hover:border-red-900/50`}
          >
            <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
            {!isCollapsed && <span className="text-[9px] font-normal uppercase tracking-[0.2em]">Disconnect Matrix</span>}
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex justify-center p-2 text-zinc-500 hover:text-white transition-all transform duration-500"
            title="Toggle sidebar"
          >
            <ChevronRight size={20} className={isCollapsed ? '' : 'rotate-180'} />
          </button>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      </div>
    </>
  );
};

export default Sidebar;
