
import React, { useState, useEffect } from 'react';
import { TrendingUp, Sparkles, Zap, ArrowUpRight, Loader2, X, ExternalLink, MessageSquareText, Radio, BookmarkPlus, Edit3, Eye, Check, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { fetchLatestTrends, generateMarketingContent, generateNeuralImage, refineMarketingContent } from '../services/apiService';
import { Interest, Idea } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TrendItem {
  platform: string;
  topic: string;
  hook: string;
}

type ScriptFormat = 'X Post' | 'X Thread' | 'Script';

interface GeneratedImage {
  placeholder: string;
  data: string | null;
  loading: boolean;
}

interface TrendsManagerProps {
  interests: Interest[];
  onSaveIdea: (idea: Idea) => void;
  systemInstruction: string;
  userSettings: any;
}

const TrendsManager: React.FC<TrendsManagerProps> = ({ interests, onSaveIdea, systemInstruction, userSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Synthesis state
  const [synthesizingTrend, setSynthesizingTrend] = useState<TrendItem | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ScriptFormat>('X Post');
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Record<string, GeneratedImage>>({});
  const [refinement, setRefinement] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [trendForFormatSelection, setTrendForFormatSelection] = useState<TrendItem | null>(null);

  const loadTrends = async () => {
    if (interests.filter(i => i.active).length === 0) return;
    setLoading(true);
    setTrends([]);
    try {
      const result = await fetchLatestTrends(interests);
      const data = result.text || '';
      setSources(result.sources);

      if (data) {
        const lines = data.split('\n').map(l => l.replace(/[`*]/g, '').trim()).filter(l => l.includes('|'));
        const parsed = lines.map(line => {
          const parts = line.split('|');
          return {
            platform: parts[0]?.trim() || 'Social',
            topic: parts[1]?.trim() || 'Trending Topic',
            hook: parts[2]?.trim() || 'Click to explore hook'
          };
        }).slice(0, 5);
        setTrends(parsed);
      }
    } catch (e) {
      console.error("Trends Load Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSynthesize = async (trend: TrendItem, format: ScriptFormat = selectedFormat) => {
    setSynthesizingTrend(trend);
    setSelectedFormat(format);
    setGeneratedScript(null);
    setIsEditing(false);
    setGeneratedImages({});

    try {
      // We pass the full topic + hook for maximum context focus
      const context = `${trend.topic}: ${trend.hook}`;
      const script = await generateMarketingContent(context, format, systemInstruction, userSettings);
      setGeneratedScript(script);

      // Detect and generate images
      const imageMatches = script.match(/\[IMAGE: [^\]]+\]/g);
      if (imageMatches) {
        const initialImages: Record<string, GeneratedImage> = {};
        imageMatches.forEach(match => {
          initialImages[match] = { placeholder: match, data: null, loading: true };
        });
        setGeneratedImages(initialImages);

        // Fetch images in parallel
        await Promise.all(imageMatches.map(async (match) => {
          const prompt = match.replace('[IMAGE: ', '').replace(']', '');
          const imgData = await generateNeuralImage(prompt);
          setGeneratedImages(prev => ({
            ...prev,
            [match]: { ...prev[match], data: imgData, loading: false }
          }));
        }));
      }
    } catch (e) {
      console.error("Synthesis Error:", e);
    }
  };

  const processImages = async (content: string) => {
    const imageMatches = content.match(/\[IMAGE: [^\]]+\]/g);
    if (imageMatches) {
      const initialImages: Record<string, GeneratedImage> = {};
      imageMatches.forEach(match => {
        initialImages[match] = { placeholder: match, data: null, loading: true };
      });
      setGeneratedImages(prev => ({ ...prev, ...initialImages }));

      await Promise.all(imageMatches.map(async (match) => {
        const prompt = match.replace('[IMAGE: ', '').replace(']', '');
        const imgData = await generateNeuralImage(prompt);
        setGeneratedImages(prev => ({
          ...prev,
          [match]: { ...prev[match], data: imgData, loading: false }
        }));
      }));
    }
  };

  const handleRefine = async () => {
    if (!generatedScript || !refinement || loading) return;
    setLoading(true);
    setIsRefining(true);
    try {
      const res = await refineMarketingContent(generatedScript, refinement, selectedFormat, systemInstruction);
      setGeneratedScript(res || '');
      setRefinement('');
      await processImages(res || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setIsRefining(false);
    }
  };

  const handleSaveToBank = () => {
    if (!generatedScript || !synthesizingTrend) return;
    const newIdea: Idea = {
      id: Date.now().toString(),
      title: `${selectedFormat}: ${synthesizingTrend.topic}`,
      content: generatedScript,
      type: 'Deep Research',
      timestamp: Date.now()
    };
    onSaveIdea(newIdea);
    alert("Saved to Neural Idea Bank.");
  };

  useEffect(() => {
    if (isOpen && trends.length === 0) loadTrends();
  }, [isOpen]);

  const formats: ScriptFormat[] = ['X Post', 'X Thread', 'Script'];

  // Helper to render script with embedded images
  const renderScriptContent = () => {
    if (!generatedScript) return null;

    if (isEditing) {
      return (
        <textarea
          value={generatedScript}
          onChange={(e) => setGeneratedScript(e.target.value)}
          className="w-full h-[500px] bg-zinc-950 border border-zinc-800 rounded-2xl focus:ring-1 focus:ring-white/20 text-zinc-300 text-sm leading-relaxed font-mono resize-none p-6 scrollbar-hide outline-none"
          placeholder="Refine the neural script here..."
        />
      );
    }

    const parts = generatedScript.split(/(\[IMAGE: [^\]]+\]|\[URL: [^\]]+\])/g);
    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-8 fade-in duration-700">
        {parts.map((part, i) => {
          const imgState = generatedImages[part];
          if (imgState) {
            return (
              <div key={i} className="my-6">
                <div className="relative aspect-video bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden group/img">
                  {imgState.loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/50">
                      <Loader2 size={24} className="animate-spin text-white mb-2" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-700">Generating Neural Image</span>
                    </div>
                  ) : imgState.data ? (
                    <img src={imgState.data} alt="AI Generated" className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-800">
                      <ImageIcon size={32} />
                    </div>
                  )}
                </div>
                <p className="mt-2 text-[8px] font-bold text-zinc-700 uppercase tracking-widest text-center italic opacity-60">Visual synthesis based on context</p>
              </div>
            );
          }
          if (part.startsWith('[URL: ')) {
            const url = part.replace('[URL: ', '').replace(']', '').trim();
            return (
              <div key={i} className="my-6">
                <div className="relative aspect-video bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden group/img">
                  <img src={url} alt="External Content" className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
                <p className="mt-2 text-[8px] font-bold text-zinc-700 uppercase tracking-widest text-center italic opacity-60">Detected Visual Reference</p>
              </div>
            );
          }
          return (
            <div key={i} className="markdown-content">
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
    );
  };

  return (
    <>
      {/* Format Selector Modal */}
      {trendForFormatSelection && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between mb-8 text-center w-full">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 text-center w-full">Select Output Frequency</h4>
              <button onClick={() => setTrendForFormatSelection(null)} className="p-2 text-zinc-700 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {formats.map(f => (
                <button
                  key={f}
                  onClick={() => {
                    handleSynthesize(trendForFormatSelection, f);
                    setTrendForFormatSelection(null);
                  }}
                  className="w-full py-4 bg-zinc-900 hover:bg-white hover:text-black border border-zinc-800 transition-all rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400"
                >
                  Create {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Synthesis Result Modal */}
      {synthesizingTrend && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-4xl bg-[#0a0a0a] border border-zinc-800 rounded-[3rem] overflow-hidden flex flex-col max-h-[90vh] shadow-[0_0_150px_rgba(255,255,255,0.05)]">
            {/* Modal Header */}
            <div className="p-8 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl text-white shadow-inner">
                  <Zap size={24} fill="currentColor" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-xl font-black tracking-tighter text-white">Neural Content Synthesis</h3>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-black truncate">Trend: {synthesizingTrend.topic}</p>
                </div>
              </div>
              <button onClick={() => setSynthesizingTrend(null)} className="p-2 text-zinc-700 hover:text-white transition-all hover:scale-110">
                <X size={28} />
              </button>
            </div>

            {/* Format Selector Pills */}
            <div className="px-8 py-4 bg-zinc-900/20 border-b border-zinc-900 flex items-center gap-3">
              <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest mr-2">Target Format:</span>
              {formats.map(f => (
                <button
                  key={f}
                  onClick={() => handleSynthesize(synthesizingTrend, f)}
                  className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${selectedFormat === f ? 'bg-white border-white text-black shadow-lg shadow-white/10' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                  {f}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <button
                  disabled={loading}
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-500 hover:text-white hover:border-white transition-all text-[9px] font-black uppercase tracking-widest"
                >
                  <Edit3 size={12} /> Edit Script
                </button>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-[9px] font-black uppercase tracking-widest border ${isEditing ? 'bg-white text-black border-white' : 'border-zinc-800 text-zinc-500 hover:text-white'}`}
                >
                  {isEditing ? <><Eye size={12} /> View</> : <><Radio size={12} /> Raw</>}
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-10 bg-black/40 scrollbar-hide">
              {!generatedScript ? (
                <div className="h-80 flex flex-col items-center justify-center space-y-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full animate-ping"></div>
                    <Loader2 className="animate-spin text-white relative z-10" size={56} />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white mb-2">Analyzing Synaptic Pulse...</p>
                    <p className="text-zinc-600 text-xs italic">Crafting high-authority {selectedFormat} narrative</p>
                  </div>
                </div>
              ) : renderScriptContent()}
            </div>

            {/* Footer Actions */}
            <div className="p-8 border-t border-zinc-900 bg-zinc-950 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-700">
                <ShieldCheck size={14} className="text-green-600" /> Neural Safe Logic Enabled
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedScript || '');
                    alert("Copied to synaptic buffer.");
                  }}
                  className="px-6 py-3 border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-white hover:border-zinc-700 transition-all"
                >
                  Copy to Buffer
                </button>
                <button
                  onClick={handleSaveToBank}
                  disabled={!generatedScript}
                  className="flex items-center gap-3 px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all shadow-xl disabled:opacity-20 shadow-white/5"
                >
                  <BookmarkPlus size={16} /> Save to Idea Bank
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Edit Modal Overlay for Trends */}
      {showEditModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-[0_0_50px_rgba(255,255,255,0.05)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50"></div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-white italic">Neural Refinement</h4>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Instruct AI to mutate trending script</p>
              </div>
              <button
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

      {/* Main Trends Widget */}
      <div className={`fixed bottom-8 right-8 z-30 flex flex-col items-end transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isOpen ? 'w-[400px]' : 'w-14'}`}>
        {isOpen && (
          <div className="w-full bg-[#050505] border border-zinc-800/60 rounded-[3rem] flex flex-col overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.9)] mb-6 animate-in slide-in-from-bottom-12 fade-in ring-1 ring-white/5">
            {/* Header */}
            <div className="p-10 pb-6 border-b border-zinc-900/50 bg-gradient-to-br from-zinc-900/40 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/10 blur-lg rounded-full animate-pulse"></div>
                    <Radio size={20} className="text-white relative z-10" />
                  </div>
                  <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">Neural Pulse</h2>
                    <p className="text-2xl font-black text-white tracking-tighter italic" style={{ fontFamily: "'Orbitron', sans-serif" }}>Intercepted</p>
                  </div>
                </div>
                <button
                  onClick={loadTrends}
                  disabled={loading}
                  className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-500 hover:text-white transition-all hover:rotate-180 disabled:opacity-30 shadow-lg"
                >
                  <Sparkles size={20} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {interests.filter(i => i.active).slice(0, 3).map(i => (
                  <span key={i.id} className="text-[8px] font-black uppercase tracking-[0.2em] bg-zinc-900/50 text-zinc-500 px-3 py-1 rounded-full border border-zinc-800/50">
                    {i.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Trends List */}
            <div className="flex-1 overflow-y-auto max-h-[480px] p-8 pt-2 space-y-6 scrollbar-hide">
              {loading ? (
                <div className="py-24 flex flex-col items-center justify-center text-zinc-800">
                  <div className="w-12 h-12 border-2 border-zinc-800 border-t-white rounded-full animate-spin mb-6"></div>
                  <p className="text-[10px] uppercase font-black tracking-[0.4em]">Crawling Digital Cortex...</p>
                </div>
              ) : trends.length > 0 ? (
                trends.map((trend, i) => (
                  <div
                    key={i}
                    className="group relative p-6 bg-zinc-900/20 border border-zinc-800/40 rounded-3xl hover:border-red-900/30 hover:bg-zinc-900/40 transition-all duration-500"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-[8px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${trend.platform.toLowerCase().includes('x') ? 'bg-white text-black' :
                        trend.platform.toLowerCase().includes('yt') ? 'bg-red-600 text-white' :
                          'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-lg shadow-pink-900/10'
                        }`}>
                        {trend.platform}
                      </span>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        {sources[0]?.web?.uri && (
                          <a href={sources[0].web.uri} target="_blank" rel="noreferrer" className="p-2 bg-zinc-800/50 rounded-xl text-zinc-500 hover:text-white border border-zinc-700/50 transition-colors">
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button
                          onClick={() => setTrendForFormatSelection(trend)}
                          className="p-2 bg-white/10 rounded-xl text-white hover:bg-white hover:text-black transition-all shadow-md border border-white/5"
                          title="Generate content"
                        >
                          <Zap size={14} className="fill-current" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-base font-black text-zinc-200 mb-2 leading-tight group-hover:text-white transition-colors tracking-tight">{trend.topic}</h4>
                    <p className="text-[11px] text-zinc-500 italic line-clamp-2 leading-relaxed font-medium">"{trend.hook}"</p>
                  </div>
                ))
              ) : (
                <div className="py-24 text-center">
                  <TrendingUp size={48} className="mx-auto mb-6 text-zinc-900 opacity-20" />
                  <p className="text-xs text-zinc-700 font-black uppercase tracking-[0.3em]">No Active Transmissions</p>
                  <p className="text-[9px] text-zinc-800 mt-2 font-bold uppercase">Initiate Neural Link To Crawl</p>
                </div>
              )}
            </div>

            <div className="p-8 bg-zinc-950/80 border-t border-zinc-900/50 backdrop-blur-xl">
              <div className="flex justify-between items-center opacity-40">
                <p className="text-[8px] text-zinc-500 font-black uppercase tracking-[0.4em]">S-005 Neural Feed</p>
                <p className="text-[8px] text-zinc-500 font-black uppercase tracking-[0.4em]">V.5.0.0</p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-[0_20px_60px_rgba(255,255,255,0.05)] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group ${isOpen
            ? 'bg-white text-black rotate-[225deg] scale-90 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.2)]'
            : 'bg-white text-black hover:bg-zinc-100 border border-white/10 hover:-translate-y-1'
            }`}
        >
          {isOpen ? <X size={28} /> : (
            <div className="relative">
              <TrendingUp size={28} className="group-hover:scale-110 transition-transform" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></div>
            </div>
          )}
        </button>
      </div>
    </>
  );
};

export default TrendsManager;
