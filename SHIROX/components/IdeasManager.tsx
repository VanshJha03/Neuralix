
import React from 'react';
import { Idea } from '../types';
import { Lightbulb, Trash2, Calendar, Sparkles, BookOpen } from 'lucide-react';

interface IdeasManagerProps {
  ideas: Idea[];
  setIdeas: React.Dispatch<React.SetStateAction<Idea[]>>;
}

const IdeasManager: React.FC<IdeasManagerProps> = ({ ideas, setIdeas }) => {
  const deleteIdea = (id: string) => {
    setIdeas(ideas.filter(i => i.id !== id));
  };

  return (
    <div className="p-12 max-w-5xl mx-auto h-full overflow-y-auto pb-32">
      <div className="mb-12">
        <h1 className="text-5xl font-black tracking-tighter italic mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>IDEA BANK</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Neural Repository of Breakthroughs</p>
      </div>

      <div className="grid gap-6">
        {ideas.map(idea => (
          <div key={idea.id} className="p-10 bg-zinc-900/40 border border-zinc-800 rounded-[3rem] hover:border-white/20 transition-all group relative">
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 rounded-2xl ${idea.type === 'Imagine' ? 'bg-white/5 text-white' : 'bg-white text-black'}`}>
                {idea.type === 'Imagine' ? <Sparkles size={20} /> : <BookOpen size={20} />}
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-zinc-500 tracking-[0.2em]">{idea.type} Mode</span>
                <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">
                  <Calendar size={12} /> {new Date(idea.timestamp).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => deleteIdea(idea.id)}
                className="ml-auto opacity-0 group-hover:opacity-100 p-3 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-600 hover:text-white transition-all shadow-xl"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <h3 className="text-xl font-bold text-white mb-4 tracking-tight">{idea.title}</h3>
            <p className="text-zinc-400 leading-relaxed text-sm whitespace-pre-wrap">{idea.content}</p>
          </div>
        ))}
        {ideas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-zinc-800">
            <Lightbulb size={64} className="mb-6 opacity-10" />
            <p className="text-xs font-black uppercase tracking-[0.2em]">Neural storage currently decoupled</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeasManager;
