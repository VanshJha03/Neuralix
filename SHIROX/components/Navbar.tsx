
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
  Zap,
  Lock
} from 'lucide-react';

interface NavbarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  userSettings: UserSettings;
  onSignOut: () => void;
  isLocked?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ activeView, setActiveView, userSettings, onSignOut, isLocked = false }) => {
  const navItems = [
    { id: 'chat' as ViewType, icon: MessageSquare, label: "Neural AI" },
    { id: 'analytics' as ViewType, icon: BarChart3, label: "Analytics" },
    { id: 'marketing' as ViewType, icon: Megaphone, label: "Marketing" },
    { id: 'interests' as ViewType, icon: Fingerprint, label: "Interests" },
    { id: 'ideas' as ViewType, icon: Lightbulb, label: "Ideas" },
    { id: 'settings' as ViewType, icon: Settings, label: "Config" },
  ];

  return (
    <nav className="hidden lg:flex items-center justify-between px-8 py-4 bg-black border-b border-zinc-900 z-50">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('chat')}>
          <NeuralLogo size={32} />
          <h1 className="text-xl font-normal tracking-tighter text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>Creatio</h1>
        </div>

        <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-normal uppercase tracking-widest transition-all ${
                activeView === item.id 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-zinc-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={14} />
              {item.label}
              {isLocked && item.id !== 'chat' && item.id !== 'settings' && (
                <Lock size={10} className="ml-1 text-zinc-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={() => setActiveView('search')}
          className={`p-2 rounded-xl transition-all ${activeView === 'search' ? 'text-white bg-white/10' : 'text-zinc-500 hover:text-white'}`}
        >
          <Search size={18} />
        </button>

        <div className="h-6 w-[1px] bg-zinc-800" />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[9px] font-normal uppercase tracking-widest text-zinc-400">{userSettings.name}</p>
            <p className="text-[8px] text-zinc-600 font-normal">{userSettings.tier || 'Free'}</p>
          </div>
          <div 
            className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center text-[10px] text-white"
            style={{ background: userSettings.avatarColor }}
          >
            {userSettings.name.charAt(0)}
          </div>
          <button 
            onClick={onSignOut}
            className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
