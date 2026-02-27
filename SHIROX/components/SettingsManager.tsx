
import React, { useState } from 'react';
import { UserSettings } from '../types';
import { User, Settings, Shield, Terminal, Save, Check, RefreshCcw, Palette } from 'lucide-react';
import { DEFAULT_SYSTEM_PROMPT } from '../constants';
import { saveUserSettings } from '../services/apiService';

interface SettingsManagerProps {
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
}

const AVATAR_COLORS = [
  { name: 'Red Frequency', hex: '#dc2626' },
  { name: 'Blue Frequency', hex: '#2563eb' },
  { name: 'Gold Frequency', hex: '#ca8a04' },
  { name: 'Emerald Frequency', hex: '#16a34a' },
  { name: 'Purple Frequency', hex: '#9333ea' },
];

const SettingsManager: React.FC<SettingsManagerProps> = ({ userSettings, setUserSettings }) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(userSettings);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaved(false);
    try {
      await saveUserSettings(localSettings);
      setUserSettings(localSettings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to sync neural settings:", err);
    }
  };

  const resetPrompt = () => {
    setLocalSettings({ ...localSettings, customSystemPrompt: DEFAULT_SYSTEM_PROMPT });
  };

  return (
    <div className="p-12 max-w-4xl mx-auto h-full overflow-y-auto pb-32 scrollbar-hide">
      <div className="flex items-center gap-6 mb-16">
        <div className="relative">
          <div
            className="absolute inset-0 blur-2xl rounded-full animate-pulse"
            style={{ backgroundColor: `${localSettings.avatarColor}4D` }}
          ></div>
          <div
            className="relative p-5 bg-zinc-900 rounded-[2rem] border border-zinc-800 transition-colors"
            style={{ color: localSettings.avatarColor, borderColor: `${localSettings.avatarColor}66` }}
          >
            <Settings size={36} />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic" style={{ fontFamily: "'Orbitron', sans-serif" }}>Neural Config</h1>
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">Calibrate ArsCreatio Consciousness</p>
        </div>
      </div>

      <div className="space-y-12">
        {/* User Identity Section */}
        <section className="p-10 bg-zinc-900/40 border border-zinc-800/50 rounded-[3rem] backdrop-blur-3xl">
          <div className="flex items-center gap-3 mb-8">
            <User size={18} className="text-white" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">User Identity</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold text-zinc-500 block">Full Name</label>
              <input
                value={localSettings.name}
                onChange={e => setLocalSettings({ ...localSettings, name: e.target.value })}
                placeholder="e.g. Vansh Jha"
                className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-4 px-6 text-white focus:border-white/50 outline-none transition-all font-bold"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold text-zinc-500 block">Email Address</label>
              <input
                value={localSettings.email}
                onChange={e => setLocalSettings({ ...localSettings, email: e.target.value })}
                placeholder="e.g. vansh@example.com"
                className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-4 px-6 text-white focus:border-white/50 outline-none transition-all font-bold"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-bold text-zinc-500 block">Neural Handle</label>
              <input
                value={localSettings.handle}
                onChange={e => setLocalSettings({ ...localSettings, handle: e.target.value })}
                placeholder="e.g. Lead Strategist"
                className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-4 px-6 text-white focus:border-white/50 outline-none transition-all font-bold"
              />
            </div>
          </div>
        </section>

        {/* Style Selection Section */}
        <section className="p-10 bg-zinc-900/40 border border-zinc-800/50 rounded-[3rem] backdrop-blur-3xl">
          <div className="flex items-center gap-3 mb-8">
            <Palette size={18} className="text-white" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Cognitive Persona Styles (Max 2)</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['Classic', 'Casual', 'Gen Z', 'Professional', 'Enthusiast', 'Wit', 'Humour', 'Slang', 'Robot', 'Thinker'].map((style) => {
              const isActive = localSettings.styles?.includes(style);
              return (
                <button
                  key={style}
                  onClick={() => {
                    const currentStyles = localSettings.styles || [];
                    if (isActive) {
                      setLocalSettings({ ...localSettings, styles: currentStyles.filter(s => s !== style) });
                    } else if (currentStyles.length < 2) {
                      setLocalSettings({ ...localSettings, styles: [...currentStyles, style] });
                    }
                  }}
                  className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${isActive
                    ? 'bg-white text-black border-white'
                    : 'bg-black/40 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
                    }`}
                >
                  {style}
                </button>
              );
            })}
          </div>
          <p className="mt-6 text-[10px] text-zinc-600 font-bold uppercase tracking-tight">
            Selected: {localSettings.styles?.length || 0}/2 - These styles blend to create your unique digital consciousness.
          </p>
        </section>

        {/* Linked Accounts Section */}
        <section className="p-10 bg-zinc-900/40 border border-zinc-800/50 rounded-[3rem] backdrop-blur-3xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <RefreshCcw size={18} className="text-white" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Linked Neural Nodes (Accounts)</h2>
            </div>
            <button
              onClick={() => {
                const updated = [...(localSettings.linkedAccounts || []), { platform: 'X' as const, username: '', handle: '', niche: '' }];
                setLocalSettings({ ...localSettings, linkedAccounts: updated });
              }}
              className="text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white"
            >
              + Add Account
            </button>
          </div>

          <div className="space-y-6">
            {(localSettings.linkedAccounts || []).map((acc, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-black/40 rounded-3xl border border-zinc-800/50">
                <select
                  value={acc.platform}
                  onChange={e => {
                    const updated = [...(localSettings.linkedAccounts || [])];
                    updated[index].platform = e.target.value as 'IG' | 'X' | 'YT';
                    setLocalSettings({ ...localSettings, linkedAccounts: updated });
                  }}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none"
                >
                  <option value="X">X (Twitter)</option>
                  <option value="IG">Instagram</option>
                  <option value="YT">YouTube</option>
                </select>
                <input
                  value={acc.username}
                  onChange={e => {
                    const updated = [...(localSettings.linkedAccounts || [])];
                    updated[index].username = e.target.value;
                    setLocalSettings({ ...localSettings, linkedAccounts: updated });
                  }}
                  placeholder="Username"
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none"
                />
                <input
                  value={acc.handle}
                  onChange={e => {
                    const updated = [...(localSettings.linkedAccounts || [])];
                    updated[index].handle = e.target.value;
                    setLocalSettings({ ...localSettings, linkedAccounts: updated });
                  }}
                  placeholder="Handle (e.g. @vansh)"
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none"
                />
                <input
                  value={acc.niche}
                  onChange={e => {
                    const updated = [...(localSettings.linkedAccounts || [])];
                    updated[index].niche = e.target.value;
                    setLocalSettings({ ...localSettings, linkedAccounts: updated });
                  }}
                  placeholder="Niche"
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Security / Clear */}
        <section className="p-10 border border-zinc-900 rounded-[3rem] bg-zinc-950/20">
          <div className="flex items-center gap-3 mb-6">
            <Shield size={18} className="text-zinc-600" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Neural Data Integrity</h2>
          </div>
          <p className="text-xs text-zinc-600 mb-6 font-medium">Your data is stored in the local ArsCreatio SQLite database. Resetting will wipe all persistent memory and identity.</p>
          <button
            onClick={() => {
              if (confirm("Factory reset all neural data? This cannot be undone.")) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="text-[10px] font-black uppercase tracking-widest text-zinc-800 hover:text-white transition-colors"
          >
            Synchronized Factory Reset
          </button>
        </section>

        <div className="flex justify-end pt-8">
          <button
            onClick={handleSave}
            className={`flex items-center gap-3 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-2xl ${saved ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20 scale-105 active:scale-95'
              }`}
          >
            {saved ? <Check size={18} /> : <Save size={18} />}
            {saved ? 'Synchronized' : 'Apply Neural Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;
