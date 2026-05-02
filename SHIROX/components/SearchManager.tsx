
import React, { useState } from 'react';
import { Search, MessageSquare, Lightbulb, Clock } from 'lucide-react';
import { Idea, Message } from '../types';

interface SearchManagerProps {
  ideas: Idea[];
  messages: Message[];
  setActiveView: (view: any) => void;
  isLocked?: boolean;
}

const SearchManager: React.FC<SearchManagerProps> = ({ ideas, messages, setActiveView, isLocked = false }) => {
  const [query, setQuery] = useState('');

  const filteredIdeas = ideas.filter(i =>
    i.content.toLowerCase().includes(query.toLowerCase()) ||
    i.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredMessages = messages.filter(m =>
    m.content.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative h-full overflow-hidden">
      <div className={`p-6 lg:p-16 max-w-5xl mx-auto h-full overflow-y-auto pb-32 ${isLocked ? 'blur-md pointer-events-none select-none' : ''}`}>
      <div className="relative mb-12 lg:mb-24">
        <div className="absolute inset-0 bg-white/5 blur-[60px] rounded-full pointer-events-none"></div>
        <Search className="absolute left-6 lg:left-8 top-1/2 -translate-y-1/2 text-zinc-700" size={24} />
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Query neural memory..."
          className="w-full bg-zinc-950/50 backdrop-blur-3xl border border-zinc-900 rounded-[1.5rem] lg:rounded-[2.5rem] py-6 lg:py-10 pl-16 lg:pl-24 pr-8 lg:pr-12 text-2xl lg:text-4xl focus:border-white/20 outline-none transition-all placeholder:text-zinc-900 font-normal tracking-tighter"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
        <section>
          <div className="flex items-center gap-4 mb-10">
            <div className="p-2 bg-zinc-900 rounded-lg text-zinc-500">
              <MessageSquare size={16} />
            </div>
            <h2 className="text-[10px] font-normal uppercase tracking-[0.5em] text-zinc-500">Neural Memory Fragments</h2>
          </div>
          <div className="space-y-6">
            {filteredMessages.slice(0, 10).map(msg => (
              <div
                key={msg.id}
                onClick={() => setActiveView('chat')}
                className="p-8 bg-zinc-900/40 border border-zinc-900 rounded-[2rem] hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] font-normal uppercase tracking-widest text-zinc-700 group-hover:text-zinc-500 transition-colors">{msg.role} synaptic node</span>
                  <span className="text-[9px] font-normal uppercase tracking-widest text-white/40">{msg.mode}</span>
                </div>
                <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed font-normal">{msg.content}</p>
              </div>
            ))}
            {query && filteredMessages.length === 0 && <p className="text-[10px] text-zinc-800 font-normal uppercase tracking-widest font-normal text-center py-12">No synaptic matches found.</p>}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-10">
            <div className="p-2 bg-zinc-900 rounded-lg text-zinc-500">
              <Lightbulb size={16} />
            </div>
            <h2 className="text-[10px] font-normal uppercase tracking-[0.5em] text-zinc-500">Saved Research Pillars</h2>
          </div>
          <div className="space-y-6">
            {filteredIdeas.map(idea => (
              <div
                key={idea.id}
                onClick={() => setActiveView('ideas')}
                className="p-8 bg-zinc-900/40 border border-zinc-900 rounded-[2rem] hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-[9px] px-3 py-1 rounded-full font-normal uppercase tracking-widest ${idea.type === 'Imagine' ? 'bg-white/5 text-white border border-white/10' : 'bg-white text-black'
                    }`}>
                    {idea.type}
                  </span>
                  <span className="text-[9px] text-zinc-700 font-normal uppercase tracking-widest">{new Date(idea.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-lg text-white font-normal tracking-tight mb-3 font-normal">{idea.title}</p>
                <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed font-normal">{idea.content}</p>
              </div>
            ))}
            {query && filteredIdeas.length === 0 && <p className="text-[10px] text-zinc-800 font-normal uppercase tracking-widest font-normal text-center py-12">No pillars found.</p>}
          </div>
        </section>
      </div>
      </div>
    </div>
  );
};

export default SearchManager;
