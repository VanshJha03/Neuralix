
import React, { useState } from 'react';
import { Idea } from '../types';
import { Lightbulb, Trash2, Calendar, Sparkles, BookOpen, Zap, Loader2, X } from 'lucide-react';
import { generateMarketingContent } from '../services/apiService';
import ArtifactRenderer from './ArtifactRenderer';

interface IdeasManagerProps {
  ideas: Idea[];
  setIdeas: React.Dispatch<React.SetStateAction<Idea[]>>;
  userSettings: any;
  systemInstruction: string;
}

const IdeasManager: React.FC<IdeasManagerProps> = ({ ideas, setIdeas, userSettings, systemInstruction }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [artifact, setArtifact] = useState<string | null>(null);
  const [showArtifact, setShowArtifact] = useState(false);

  const deleteIdea = (id: string) => {
    setIdeas(ideas.filter(i => i.id !== id));
    setSelectedIds(prev => prev.filter(currId => currId !== id));
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(currId => currId !== id) 
        : (prev.length < 5 ? [...prev, id] : prev)
    );
  };

  const handleSynthesize = async () => {
    if (selectedIds.length < 2) return;
    
    setLoading(true);
    setArtifact(null);
    setShowArtifact(true);

    const selectedBookmarks = ideas.filter(i => selectedIds.includes(i.id));
    const bookmarksContext = selectedBookmarks.map((b, i) => `BOOKMARK ${i+1}:\nTitle: ${b.title}\nContent: ${b.content}`).join('\n\n');

    try {
      const prompt = `MIX THESE BOOKMARKS TO FORM A UNIQUE IDEA:
      ${bookmarksContext}
      
      INSTRUCTIONS:
      1. Analyze the core concepts of each bookmark.
      2. Synthesize a breakthrough, unique idea that combines their strengths.
      3. Format the entire response as a self-contained, interactive HTML Artifact.
      4. Use a premium design with smooth animations, gradients, and interactive elements.
      5. The artifact should explain the new idea in depth.
      6. DO NOT provide any markdown outside the HTML. Start with <!DOCTYPE html> or <html>.
      `;

      const res = await generateMarketingContent(prompt, 'Idea Synthesis', systemInstruction, userSettings);
      setArtifact(res || '');
    } catch (e) {
      console.error(e);
      setShowArtifact(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-12 max-w-6xl mx-auto h-full flex flex-col overflow-hidden">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-4xl lg:text-5xl font-normal tracking-tighter font-normal mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>IDEA BANK</h1>
          <p className="text-[10px] font-normal uppercase tracking-[0.4em] text-zinc-500">Neural Synthesis Chamber</p>
        </div>
        
        {selectedIds.length >= 2 && (
          <button
            onClick={handleSynthesize}
            disabled={loading}
            className="px-6 py-3 bg-white text-black text-[10px] font-normal uppercase tracking-[0.2em] rounded-xl flex items-center gap-2 hover:bg-zinc-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <><Zap size={16} /> Synthesize ({selectedIds.length})</>}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ideas.map(idea => (
            <div 
              key={idea.id} 
              onClick={() => toggleSelection(idea.id)}
              className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer group relative ${
                selectedIds.includes(idea.id) 
                  ? 'bg-white/10 border-white shadow-[0_0_40px_rgba(255,255,255,0.05)]' 
                  : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2.5 rounded-xl ${selectedIds.includes(idea.id) ? 'bg-white text-black' : 'bg-zinc-950 text-zinc-500'}`}>
                  {idea.type === 'Imagine' ? <Sparkles size={16} /> : <BookOpen size={16} />}
                </div>
                <div className="flex-1">
                   <div className="flex items-center justify-between">
                     <span className="text-[9px] uppercase font-normal text-zinc-500 tracking-[0.2em]">{idea.type}</span>
                     <div className="flex items-center gap-1 text-[8px] text-zinc-600 font-normal uppercase tracking-widest">
                       <Calendar size={10} /> {new Date(idea.timestamp).toLocaleDateString()}
                     </div>
                   </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteIdea(idea.id); }}
                  className="p-2 text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <h3 className={`text-lg font-normal mb-3 tracking-tight ${selectedIds.includes(idea.id) ? 'text-white' : 'text-zinc-300'}`}>{idea.title}</h3>
              <p className="text-zinc-500 leading-relaxed text-xs line-clamp-3">{idea.content}</p>
              
              {selectedIds.includes(idea.id) && (
                <div className="absolute top-4 right-4">
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-black rounded-full" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {ideas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-zinc-800">
            <Lightbulb size={64} className="mb-6 opacity-10" />
            <p className="text-[10px] font-normal uppercase tracking-[0.2em]">Neural repository is empty</p>
          </div>
        )}
        
        {ideas.length > 0 && selectedIds.length < 2 && (
          <p className="text-center text-zinc-600 text-[9px] font-normal uppercase tracking-[0.3em] mt-12">Select 2-5 bookmarks to synthesize a new idea</p>
        )}
      </div>

      {/* Artifact Overlay */}
      {showArtifact && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="flex items-center justify-between p-6 lg:px-12 border-b border-zinc-900">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-black">
                <Zap size={20} />
              </div>
              <div>
                <h2 className="text-sm font-normal uppercase tracking-[0.2em] text-white">Neural Synthesis Output</h2>
                <p className="text-[9px] text-zinc-500 uppercase tracking-tighter">Mixed Reality Idea Projection</p>
              </div>
            </div>
            <button 
              onClick={() => setShowArtifact(false)}
              className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 p-6 lg:p-12 min-h-0">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-6">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-normal tracking-[0.5em] text-zinc-600 uppercase animate-pulse">Converging neural pathways...</p>
              </div>
            ) : artifact ? (
              <ArtifactRenderer content={artifact} />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeasManager;
