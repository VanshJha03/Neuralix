
import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Search, Navigation, Zap, Trash2, Hash } from 'lucide-react';

interface OmniTerminalProps {
  onCommand: (cmd: string, args: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const COMMANDS = [
  { id: 'nav', label: 'Navigate', icon: Navigation, hint: 'nav [chat|search|ideas|marketing|interests]' },
  { id: 'niche', label: 'Inject Niche', icon: Hash, hint: 'niche [topic]' },
  { id: 'clear', label: 'Wipe Memory', icon: Trash2, hint: 'clear (wipes synaptic data)' },
  { id: 'research', label: 'Deep Search', icon: Search, hint: 'research [query]' }
];

const OmniTerminal: React.FC<OmniTerminalProps> = ({ onCommand, isOpen, setIsOpen }) => {
  const [input, setInput] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredCommands = input.startsWith('/')
    ? COMMANDS.filter(c => c.id.includes(input.slice(1).split(' ')[0]))
    : [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const parts = input.startsWith('/') ? input.slice(1).split(' ') : ['research', input];
      const cmd = parts[0];
      const args = parts.slice(1).join(' ');

      onCommand(cmd, args);
      setInput('');
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev + 1) % COMMANDS.length);
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev - 1 + COMMANDS.length) % COMMANDS.length);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-xl animate-in fade-in duration-200 px-6">
      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-zinc-800/50 rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.03)] ring-1 ring-white/5">
        <div className="flex items-center gap-4 px-6 py-5 border-b border-zinc-900/50">
          <Terminal size={20} className="text-white" />
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search neural link or type '/' for commands..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-medium text-white placeholder:text-zinc-700 outline-none"
          />
          <div className="px-2 py-1 bg-zinc-900 rounded-md text-[10px] font-black text-zinc-600 uppercase tracking-widest border border-zinc-800">
            Esc
          </div>
        </div>

        <div className="p-2 max-h-[400px] overflow-y-auto">
          {input.length === 0 && (
            <div className="p-4 space-y-4">
              <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.2em] px-2">Quick Navigation</p>
              <div className="grid grid-cols-2 gap-2">
                {COMMANDS.map((cmd, idx) => (
                  <button
                    key={cmd.id}
                    onClick={() => { setInput(`/${cmd.id} `); inputRef.current?.focus(); }}
                    className="flex items-center gap-3 p-3 bg-zinc-950/50 border border-zinc-900 rounded-xl hover:border-white/20 hover:bg-zinc-900 transition-all text-left group"
                  >
                    <div className="p-2 bg-zinc-900 rounded-lg text-zinc-600 group-hover:text-white">
                      <cmd.icon size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-300">{cmd.label}</p>
                      <p className="text-[9px] text-zinc-600 font-medium font-mono">{cmd.hint}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {input.length > 0 && !input.startsWith('/') && (
            <div className="p-4">
              <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                <Search size={18} className="text-white" />
                <div>
                  <p className="text-xs text-zinc-400">Deep Neural Search for:</p>
                  <p className="text-sm font-bold text-white">"{input}"</p>
                </div>
                <div className="ml-auto flex items-center gap-2 text-[10px] font-black text-white">
                  <Zap size={12} fill="currentColor" /> FAST
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-zinc-900/50 bg-black/40 flex justify-between items-center">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-600">
              <span className="px-1 py-0.5 bg-zinc-900 border border-zinc-800 rounded">↵</span>
              <span>Execute</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-600">
              <span className="px-1 py-0.5 bg-zinc-900 border border-zinc-800 rounded">↑↓</span>
              <span>Navigate</span>
            </div>
          </div>
          <p className="text-[9px] font-black text-zinc-800 uppercase tracking-widest italic" style={{ fontFamily: "'Orbitron', sans-serif" }}>ArsCreatio Neural Interface v5.0</p>
        </div>
      </div>
    </div>
  );
};

export default OmniTerminal;
