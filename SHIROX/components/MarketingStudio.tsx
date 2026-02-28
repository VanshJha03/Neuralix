
import React, { useState } from 'react';
import { Idea, Interest } from '../types';
import { Megaphone, MessageSquare, Twitter, Instagram, ArrowRight, Loader2, Sparkles, Copy, Check, Film, Trash2, Youtube, Image as ImageIcon, Edit3, X } from 'lucide-react';
import { generateMarketingContent, generateNeuralImage, refineMarketingContent } from '../services/apiService';
import { CONTENT_GENERATION_SYSTEM_PROMPT } from '../constants';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarketingStudioProps {
  ideas: Idea[];
  interests: Interest[];
  systemInstruction: string;
  onDeleteIdea: (id: string) => void;
  userSettings: any;
}

const MarketingStudio: React.FC<MarketingStudioProps> = ({ ideas, interests, systemInstruction, onDeleteIdea, userSettings }) => {
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [format, setFormat] = useState<string>('Script');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Record<string, { data: string | null; loading: boolean }>>({});
  const [refinement, setRefinement] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [topic, setTopic] = useState('');
  const [image1Prompt, setImage1Prompt] = useState('');
  const [image2Prompt, setImage2Prompt] = useState('');

  const processImages = async (content: string) => {
    const imageMatches = content.match(/\[IMAGE: [^\]]+\]/g);
    if (imageMatches) {
      const initialImages: Record<string, { data: string | null; loading: boolean }> = {};
      imageMatches.forEach(match => {
        initialImages[match] = { data: null, loading: true };
      });
      setGeneratedImages(initialImages);

      await Promise.all(imageMatches.map(async (match) => {
        const prompt = match.replace('[IMAGE: ', '').replace(']', '');
        const imgData = await generateNeuralImage(prompt);
        setGeneratedImages(prev => ({
          ...prev,
          [match]: { data: imgData, loading: false }
        }));
      }));
    }
  };

  const handleGenerate = async () => {
    if (format !== 'Google Docs Report' && !selectedIdea) return;
    if (format === 'Google Docs Report' && (!topic || !image1Prompt || !image2Prompt)) return;

    setLoading(true);
    setOutput('');
    setGeneratedImages({});
    try {
      let contentToGenerate = '';
      if (format === 'Google Docs Report') {
        contentToGenerate = `
          TOPIC: ${topic}
          IMAGE 1 PROMPT: ${image1Prompt}
          IMAGE 2 PROMPT: ${image2Prompt}
        `;
      } else {
        contentToGenerate = selectedIdea?.content || '';
      }

      const res = await generateMarketingContent(contentToGenerate, format, systemInstruction, userSettings);
      setGeneratedContent(res || '');
      await processImages(res || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!generatedContent || !refinement || loading) return;
    setLoading(true);
    setIsRefining(true);
    try {
      const res = await refineMarketingContent(generatedContent, refinement, format, systemInstruction, userSettings);
      setGeneratedContent(res || '');
      setRefinement('');
      await processImages(res || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setIsRefining(false);
    }
  };

  const formats = ['X Post', 'X Thread', 'Script', 'Google Docs Report'];

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-12 max-w-6xl mx-auto h-full flex gap-12">
      <div className="w-1/3 space-y-8 flex flex-col h-full overflow-hidden">
        <div>
          <h1 className="text-3xl font-black tracking-tighter mb-1 uppercase italic">Content Studio</h1>
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">Neural Asset Production</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
          {format === 'Google Docs Report' ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
              <h3 className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em] mb-2">Report Parameters</h3>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Topic / Subject</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. The Future of Quantum Finance"
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-red-600 rounded-xl p-3 text-xs text-white placeholder:text-zinc-700 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Image 1 Concept</label>
                <textarea
                  value={image1Prompt}
                  onChange={(e) => setImage1Prompt(e.target.value)}
                  placeholder="Describe the first visual..."
                  className="w-full h-20 bg-zinc-900/50 border border-zinc-800 focus:border-red-600 rounded-xl p-3 text-xs text-white placeholder:text-zinc-700 outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-zinc-500">Image 2 Concept</label>
                <textarea
                  value={image2Prompt}
                  onChange={(e) => setImage2Prompt(e.target.value)}
                  placeholder="Describe the second visual..."
                  className="w-full h-20 bg-zinc-900/50 border border-zinc-800 focus:border-red-600 rounded-xl p-3 text-xs text-white placeholder:text-zinc-700 outline-none transition-all resize-none"
                />
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em] mb-4">Research Pillars</h3>
              {ideas.map(idea => (
                <div
                  key={idea.id}
                  className={`group relative p-4 rounded-xl border transition-all ${selectedIdea?.id === idea.id
                    ? 'bg-white/10 border-white'
                    : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'
                    }`}
                >
                  <div onClick={() => setSelectedIdea(idea)} className="cursor-pointer">
                    <p className={`text-xs font-bold truncate mb-1 ${selectedIdea?.id === idea.id ? 'text-white' : 'text-zinc-500'}`}>{idea.title}</p>
                    <p className="text-[10px] line-clamp-2 opacity-60 italic text-zinc-600">{idea.content}</p>
                  </div>

                  <button
                    type="button"
                    title="Delete idea"
                    onClick={(e) => { e.stopPropagation(); onDeleteIdea(idea.id); }}
                    className="absolute top-2 right-2 p-1.5 text-zinc-800 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {ideas.length === 0 && (
                <p className="text-zinc-800 text-xs italic text-center mt-12 opacity-20">No active research pillars.</p>
              )}
            </>
          )}
        </div>

        <div className="space-y-4 pt-4 border-t border-zinc-900">
          <div className="flex flex-wrap gap-2">
            {formats.map(f => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg border transition-all ${format === f ? 'bg-white text-black border-white' : 'bg-transparent border-zinc-800 text-zinc-600'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            disabled={(format !== 'Google Docs Report' && !selectedIdea) || (format === 'Google Docs Report' && (!topic || !image1Prompt || !image2Prompt)) || loading}
            onClick={handleGenerate}
            className="w-full py-4 bg-white hover:bg-zinc-200 text-black rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-20 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Sparkles size={18} /> Synthesize</>}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-zinc-900/20 border border-zinc-800 rounded-3xl p-8 overflow-y-auto relative min-h-[500px]">
        {!generatedContent && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-700 space-y-4">
            <Megaphone size={48} className="opacity-10" />
            <p className="text-sm italic">Synthesized content will appear here.</p>
          </div>
        )}

        {loading && (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black tracking-widest text-zinc-600 uppercase">Constructing Viral Narrative...</p>
          </div>
        )}

        {generatedContent && !loading && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg text-white">
                  {format.includes('X') ? <Twitter size={18} /> :
                    format.includes('IG') ? <Instagram size={18} /> :
                      format.includes('YT') ? <Youtube size={18} /> : <Megaphone size={18} />}
                </div>
                <h3 className="font-black text-xl tracking-tighter uppercase italic">Neutral {format} Output</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  title="Edit script"
                  className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-white rounded-lg text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <Edit3 size={14} />
                  Edit Script
                </button>
                <button onClick={handleCopy} title="Copy to clipboard" className="p-2 text-zinc-500 hover:text-white transition-colors">
                  {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
              </div>
            </div>
            <div className="space-y-6 animate-in slide-in-from-bottom-8 fade-in duration-700">
              {generatedContent.split(/(\[IMAGE: [^\]]+\]|\[URL: [^\]]+\])/g).map((part, i) => {
                const imgState = generatedImages[part];
                if (imgState) {
                  return (
                    <div key={i} className="my-8">
                      <div className="relative aspect-video bg-zinc-950 border border-zinc-900 rounded-[2.5rem] overflow-hidden group/img shadow-2xl">
                        {imgState.loading ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80">
                            <Loader2 size={32} className="animate-spin text-white mb-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Synthesizing Visual Core</span>
                          </div>
                        ) : imgState.data ? (
                          <img src={imgState.data} alt="AI Representation" className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-1000" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-zinc-900">
                            <Zap size={48} className="opacity-10" />
                          </div>
                        )}
                      </div>
                      <p className="mt-4 text-[9px] font-black text-zinc-800 uppercase tracking-[0.3em] text-center italic">Visual logic based on neural narrative</p>
                    </div>
                  );
                }
                if (part.startsWith('[URL: ')) {
                  const url = part.replace('[URL: ', '').replace(']', '').trim();
                  return (
                    <div key={i} className="my-8">
                      <div className="relative aspect-video bg-zinc-950 border border-zinc-900 rounded-[2.5rem] overflow-hidden group/img shadow-2xl">
                        <img src={url} alt="Reference Content" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      </div>
                      <p className="mt-4 text-[9px] font-black text-zinc-800 uppercase tracking-[0.3em] text-center italic">External Visual Reference</p>
                    </div>
                  );
                }
                return (
                  <div key={i} className="markdown-content text-zinc-300">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />
                      }}
                    >
                      {part}
                    </ReactMarkdown>
                  </div>
                );
              })}
            </div>

            {/* Refinement Area */}
            <div className="mt-12 pt-8 border-t border-zinc-800">
              <div className="relative group">
                <input
                  type="text"
                  value={refinement}
                  onChange={(e) => setRefinement(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                  placeholder="Inject shift in narrative or fuse new ideas..."
                  className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-white/50 rounded-2xl py-4 pl-12 pr-24 text-xs font-bold text-white placeholder:text-zinc-700 outline-none transition-all group-hover:border-zinc-700"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors">
                  <MessageSquare size={16} />
                </div>
                <button
                  disabled={!refinement || loading}
                  onClick={handleRefine}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-white hover:bg-zinc-200 disabled:bg-zinc-800 text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                >
                  {isRefining ? <Loader2 size={14} className="animate-spin" /> : 'Refine'}
                </button>
              </div>
              <p className="mt-4 text-[8px] font-black text-zinc-800 uppercase tracking-[0.3em] text-center">Neural Iteration Cycle Active</p>
            </div>

            {/* AI Edit Modal Overlay */}
            {showEditModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-[0_0_50px_rgba(255,0,0,0.15)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50"></div>

                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-white italic">Neural Refinement</h4>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Instruct AI to mutate script</p>
                    </div>
                    <button
                      type="button"
                      title="Close modal"
                      onClick={() => setShowEditModal(false)}
                      className="p-2 text-zinc-600 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <textarea
                      autoFocus
                      value={refinement}
                      onChange={(e) => setRefinement(e.target.value)}
                      placeholder="E.g. 'Make it more punchy', 'Change the hashtags to #Fintech', 'Focus more on the ROI'..."
                      className="w-full h-32 bg-zinc-900 border border-zinc-800 focus:border-white/50 rounded-xl p-4 text-xs font-bold text-white placeholder:text-zinc-700 outline-none transition-all resize-none"
                    />

                    <button
                      disabled={!refinement || loading}
                      onClick={async () => {
                        await handleRefine();
                        setShowEditModal(false);
                      }}
                      className="w-full py-4 bg-white hover:bg-zinc-200 disabled:bg-zinc-800 text-black rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                      {isRefining ? <Loader2 size={16} className="animate-spin" /> : <><Sparkles size={16} /> Apply Transformation</>}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingStudio;
