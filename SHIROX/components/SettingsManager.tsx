
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
    <div className="p-6 lg:p-12 max-w-4xl mx-auto h-full overflow-y-auto pb-32 scrollbar-hide">
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-6 mb-12 lg:mb-16 text-center lg:text-left">
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
          <h1 className="text-4xl font-normal tracking-tighter uppercase font-normal" style={{ fontFamily: "'Orbitron', sans-serif" }}>Neural Config</h1>
          <p className="text-zinc-600 text-[10px] font-normal uppercase tracking-[0.4em]">Calibrate ArsCreatioX Consciousness</p>

          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg">
            <div className={`w-1.5 h-1.5 rounded-full ${userSettings.email ? 'bg-white animate-pulse' : 'bg-zinc-700'}`} />
            <span className="text-[8px] font-normal uppercase tracking-widest text-zinc-400">
              Link: {userSettings.email ? `${userSettings.tier} Matrix Verified (${userSettings.email})` : 'Transient Guest'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {!userSettings.email && (
          <div className="p-8 bg-blue-900/10 border border-blue-900/30 rounded-[2.5rem] flex items-center justify-between group">
            <div>
              <h3 className="text-white font-normal text-xs uppercase tracking-widest mb-1 font-normal">Matrix Signal Weak</h3>
              <p className="text-zinc-500 text-[10px] font-normal uppercase transition-all">Sign in with Google to unlock BETA access and enhanced limits.</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white text-black font-normal text-[9px] uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5"
            >
              Login to Matrix
            </button>
          </div>
        )}

        {userSettings.email && (
          <section className="p-6 lg:p-10 bg-zinc-900/60 border border-zinc-800 rounded-[2rem] lg:rounded-[3rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity hidden lg:block">
              <Shield size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <Shield size={18} className="text-zinc-500" />
                <h2 className="text-[10px] font-normal uppercase tracking-[0.3em] text-zinc-400">Active Neural Trajectory</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                {[
                  { label: 'Niche Analytics', count: userSettings.usage?.analytics ?? 0, limit: 30 },
                  { label: 'Gap Analysis', count: userSettings.usage?.gap ?? 0, limit: 30 },
                  { label: 'Chat Messages', count: userSettings.usage?.chat ?? 0, limit: 500 },
                  { label: 'Content Gen', count: userSettings.usage?.content ?? 0, limit: 100 },
                  { label: 'AI Images', count: userSettings.usage?.image ?? 0, limit: 100 },
                  { label: 'Trend Analysis', count: userSettings.usage?.analytics ?? 0, limit: 60 },
                ].map((stat, i) => (
                  <div key={i} className="p-6 bg-black/40 border border-zinc-800/50 rounded-3xl relative overflow-hidden group/card">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/card:opacity-20 transition-opacity">
                      <Terminal size={40} />
                    </div>
                    <p className="text-[8px] font-normal text-zinc-600 uppercase tracking-widest mb-1">{stat.label}</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-xl font-normal text-white font-normal tracking-tighter">
                        {stat.limit - stat.count}
                      </p>
                      <p className="text-[8px] font-normal text-zinc-500">/ {stat.limit} left</p>
                    </div>
                    <div className="mt-2 h-1 bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-white/30 rounded-full transition-all" style={{ width: `${Math.min(100, (stat.count / stat.limit) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-zinc-950/50 border border-zinc-900 rounded-[2rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-normal text-white uppercase tracking-widest mb-1">
                    {userSettings.tier === 'LTD' ? 'Lifetime Access' : 'PRO Monthly'} · Limits reset monthly
                  </p>
                  <p className="text-zinc-600 text-[10px] font-normal">All features unlocked. Counters reset on the 1st of each month.</p>
                </div>
              </div>
            </div>
          </section>
        )}
        {/* User Identity Section */}
        <section className="p-6 lg:p-10 bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] lg:rounded-[3rem] backdrop-blur-3xl">
          <div className="flex items-center gap-3 mb-8">
            <User size={18} className="text-white" />
            <h2 className="text-[10px] font-normal uppercase tracking-[0.3em] text-zinc-400">User Identity</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-normal text-zinc-500 block">Full Name</label>
              <input
                value={localSettings.name}
                onChange={e => setLocalSettings({ ...localSettings, name: e.target.value })}
                placeholder="e.g. Vansh Jha"
                className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-4 px-6 text-white focus:border-white/50 outline-none transition-all font-normal"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-normal text-zinc-500 block">Email Address</label>
              <input
                value={localSettings.email}
                onChange={e => setLocalSettings({ ...localSettings, email: e.target.value })}
                placeholder="e.g. vansh@example.com"
                className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-4 px-6 text-white focus:border-white/50 outline-none transition-all font-normal"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-normal text-zinc-500 block">Neural Handle</label>
              <input
                value={localSettings.handle}
                onChange={e => setLocalSettings({ ...localSettings, handle: e.target.value })}
                placeholder="e.g. Lead Strategist"
                className="w-full bg-black/50 border border-zinc-800 rounded-2xl py-4 px-6 text-white focus:border-white/50 outline-none transition-all font-normal"
              />
            </div>
          </div>
        </section>

        {/* Style Selection Section */}
        <section className="p-6 lg:p-10 bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] lg:rounded-[3rem] backdrop-blur-3xl">
          <div className="flex items-center gap-3 mb-8">
            <Palette size={18} className="text-white" />
            <h2 className="text-[10px] font-normal uppercase tracking-[0.3em] text-zinc-400">Cognitive Persona Styles (Max 2)</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {['Classic', 'Casual', 'Gen Z', 'Professional', 'Enthusiast', 'Wit', 'Humour', 'Slang', 'Robot', 'Thinker'].map((style) => {
              const isLocked = !userSettings.email && !['Classic', 'Casual'].includes(style);
              const isActive = localSettings.styles?.includes(style);
              return (
                <button
                  key={style}
                  onClick={() => {
                    if (isLocked) return;
                    const currentStyles = localSettings.styles || [];
                    if (isActive) {
                      setLocalSettings({ ...localSettings, styles: currentStyles.filter(s => s !== style) });
                    } else if (currentStyles.length < 2) {
                      setLocalSettings({ ...localSettings, styles: [...currentStyles, style] });
                    }
                  }}
                  className={`py-3 px-4 rounded-xl text-[10px] font-normal uppercase tracking-widest transition-all border relative overflow-hidden ${isActive
                    ? 'bg-white text-black border-white'
                    : isLocked
                      ? 'bg-zinc-950/50 text-zinc-800 border-zinc-900 cursor-not-allowed opacity-50'
                      : 'bg-black/40 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
                    }`}
                >
                  {isLocked && <div className="absolute top-1 right-1"><Shield size={8} /></div>}
                  {style}
                </button>
              );
            })}
          </div>
          <p className="mt-6 text-[10px] text-zinc-600 font-normal uppercase tracking-tight">
            Selected: {localSettings.styles?.length || 0}/2 - These styles blend to create your unique digital consciousness.
          </p>
        </section>

        {/* Linked Accounts Section */}
        <section className="p-6 lg:p-10 bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] lg:rounded-[3rem] backdrop-blur-3xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <RefreshCcw size={18} className="text-white" />
              <h2 className="text-[10px] font-normal uppercase tracking-[0.3em] text-zinc-400">Linked Neural Nodes</h2>
            </div>
            <button
              onClick={() => {
                const updated = [...(localSettings.linkedAccounts || []), { platform: 'X' as const, username: '', handle: '', niche: '' }];
                setLocalSettings({ ...localSettings, linkedAccounts: updated });
              }}
              className="text-[10px] font-normal uppercase tracking-widest text-white/60 hover:text-white"
            >
              + Add Account
            </button>
          </div>

          <div className="space-y-4 lg:space-y-6">
            {(localSettings.linkedAccounts || []).map((acc, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 lg:p-6 bg-black/40 rounded-2xl lg:rounded-3xl border border-zinc-800/50">
                <select
                  value={acc.platform}
                  onChange={e => {
                    const updated = [...(localSettings.linkedAccounts || [])];
                    updated[index].platform = e.target.value as 'IG' | 'X' | 'YT';
                    setLocalSettings({ ...localSettings, linkedAccounts: updated });
                  }}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs font-normal outline-none"
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
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs font-normal outline-none"
                />
                <input
                  value={acc.handle}
                  onChange={e => {
                    const updated = [...(localSettings.linkedAccounts || [])];
                    updated[index].handle = e.target.value;
                    setLocalSettings({ ...localSettings, linkedAccounts: updated });
                  }}
                  placeholder="Handle (e.g. @vansh)"
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs font-normal outline-none"
                />
                <input
                  value={acc.niche}
                  onChange={e => {
                    const updated = [...(localSettings.linkedAccounts || [])];
                    updated[index].niche = e.target.value;
                    setLocalSettings({ ...localSettings, linkedAccounts: updated });
                  }}
                  placeholder="Niche"
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs font-normal outline-none"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Image Generation Preferences Section */}
        <section className={`p-6 lg:p-10 bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] lg:rounded-[3rem] backdrop-blur-3xl transition-all ${!userSettings.email ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Palette size={18} className="text-white" />
              <h2 className="text-[10px] font-normal uppercase tracking-[0.3em] text-zinc-400">Neural Visual Synthesis</h2>
            </div>
            {!userSettings.email && (
              <span className="text-[8px] font-normal bg-blue-500 text-black px-2 py-0.5 rounded-full uppercase tracking-tighter">BETA REQUIRED</span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              onClick={() => setLocalSettings({ ...localSettings, xPostImages: !localSettings.xPostImages })}
              className={`flex items-center justify-between p-6 rounded-3xl border cursor-pointer transition-all ${localSettings.xPostImages ? 'bg-white/10 border-white text-white shadow-lg shadow-white/5' : 'bg-black/40 border-zinc-800 text-zinc-500'}`}
            >
              <div className="text-left">
                <p className="text-xs font-normal uppercase tracking-widest">X Post Images</p>
                <p className="text-[9px] font-normal text-zinc-600 mt-1 uppercase">Automated AI visual generation</p>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-all ${localSettings.xPostImages ? 'bg-white' : 'bg-zinc-800'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${localSettings.xPostImages ? 'right-0.5 bg-black' : 'left-0.5 bg-zinc-600'}`} />
              </div>
            </div>

            <div
              onClick={() => setLocalSettings({ ...localSettings, xThreadImages: !localSettings.xThreadImages })}
              className={`flex items-center justify-between p-6 rounded-3xl border cursor-pointer transition-all ${localSettings.xThreadImages ? 'bg-white/10 border-white text-white shadow-lg shadow-white/5' : 'bg-black/40 border-zinc-800 text-zinc-500'}`}
            >
              <div className="text-left">
                <p className="text-xs font-normal uppercase tracking-widest">X Thread Images</p>
                <p className="text-[9px] font-normal text-zinc-600 mt-1 uppercase">Max 4 contextual frames</p>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-all ${localSettings.xThreadImages ? 'bg-white' : 'bg-zinc-800'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${localSettings.xThreadImages ? 'right-0.5 bg-black' : 'left-0.5 bg-zinc-600'}`} />
              </div>
            </div>
          </div>
          <p className="mt-6 text-[9px] font-normal text-zinc-600 uppercase tracking-widest leading-relaxed font-normal">
            * Note: Even with AI generation disabled, Research Visuals found from curated sources will still be suggested in your Neural Scripts.
          </p>
        </section>

        {/* Security / Clear */}
        <section className="p-6 lg:p-10 border border-zinc-900 rounded-[2rem] lg:rounded-[3rem] bg-zinc-950/20">
          <div className="flex items-center gap-3 mb-6">
            <Shield size={18} className="text-zinc-600" />
            <h2 className="text-[10px] font-normal uppercase tracking-[0.3em] text-zinc-600">Neural Data Integrity</h2>
          </div>
          <p className="text-xs text-zinc-600 mb-6 font-normal">Your data is stored in Supabase. Resetting will wipe all local cache and reload the app.</p>
          <button
            onClick={() => {
              if (confirm("Factory reset all neural data? This cannot be undone.")) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="text-[10px] font-normal uppercase tracking-widest text-zinc-800 hover:text-white transition-colors"
          >
            Synchronized Factory Reset
          </button>
        </section>

        <div className="flex justify-center lg:justify-end pt-8">
          <button
            onClick={handleSave}
            className={`flex items-center justify-center gap-3 w-full lg:w-auto px-12 py-5 rounded-2xl font-normal uppercase tracking-widest text-[10px] transition-all shadow-2xl ${saved ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20 scale-105 active:scale-95'
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
