
import React, { useState, useEffect } from 'react';
import { TrendingUp, Sparkles, Zap, Loader2, X, ExternalLink, Radio, BookmarkPlus, Edit3, Eye, ShieldCheck, Image as ImageIcon, ImageOff, Share2 } from 'lucide-react';
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
  onLimitReached: (message: string) => void;
}

const TrendsManager: React.FC<TrendsManagerProps> = ({ interests, onSaveIdea, systemInstruction, userSettings, onLimitReached }) => {
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
  const [copyDone, setCopyDone] = useState(false);

  // Image generation toggle
  const [imagesEnabled, setImagesEnabled] = useState<boolean>(true);
  const imageUsed = userSettings?.usage?.image ?? 0;
  const imageTier = userSettings?.tier || 'free';
  const imageLimit = imageTier === 'beta' ? 10 : 0;
  const imageRemaining = Math.max(0, imageLimit - imageUsed);

  useEffect(() => {
    if (selectedFormat === 'X Post') setImagesEnabled(!!userSettings?.xPostImages);
    else if (selectedFormat === 'X Thread') setImagesEnabled(!!userSettings?.xThreadImages);
    else setImagesEnabled(false);
  }, [selectedFormat, userSettings]);

  const loadTrends = async () => {
    if (interests.filter(i => i.active).length === 0) return;
    setLoading(true);
    setTrends([]);
    try {
      const result = await fetchLatestTrends(interests);
      const data = result.text || '';
      setSources(result.sources);
      if (data) {
        const lines = data.split('\n').map((l: string) => l.replace(/[`*]/g, '').trim()).filter((l: string) => l.includes('|'));
        const parsed = lines.map((line: string) => {
          const parts = line.split('|');
          return {
            platform: parts[0]?.trim() || 'Social',
            topic: parts[1]?.trim() || 'Trending Topic',
            hook: parts[2]?.trim() || 'Click to explore hook'
          };
        }).slice(0, 5);
        setTrends(parsed);
      }
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('LIMIT') || msg.includes('429')) onLimitReached(msg);
      else console.error('Trends Load Error:', e);
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
    setCopyDone(false);

    // Determine if we should generate images for this synthesis
    const useImages = imagesEnabled && imageRemaining > 0 && (format === 'X Post' || format === 'X Thread');

    try {
      const context = `${trend.topic}: ${trend.hook}`;
      const script = await generateMarketingContent(context, format, systemInstruction, userSettings);
      setGeneratedScript(script);

      if (useImages) {
        const imageMatches = script.match(/\[IMAGE: [^\]]+\]/g);
        if (imageMatches) {
          const initial: Record<string, GeneratedImage> = {};
          imageMatches.forEach(match => { initial[match] = { placeholder: match, data: null, loading: true }; });
          setGeneratedImages(initial);
          await Promise.all(imageMatches.map(async (match) => {
            try {
              const prompt = match.replace('[IMAGE: ', '').replace(']', '').trim();
              const imgData = await generateNeuralImage(prompt);
              setGeneratedImages(prev => ({ ...prev, [match]: { ...prev[match], data: imgData, loading: false } }));
            } catch (imgErr: any) {
              if (imgErr?.message?.includes('LIMIT')) onLimitReached(imgErr.message);
              setGeneratedImages(prev => ({ ...prev, [match]: { ...prev[match], loading: false } }));
            }
          }));
        }
      }
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('LIMIT') || msg.includes('429')) { onLimitReached(msg); setSynthesizingTrend(null); }
      else console.error('Synthesis Error:', e);
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
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('LIMIT')) onLimitReached(msg);
      else console.error(e);
    } finally {
      setLoading(false);
      setIsRefining(false);
    }
  };

  // Sync to X: copies image + opens x.com with prefilled text
  const syncToX = async () => {
    // 1. Copy image to clipboard if available
    const firstImgKey = Object.keys(generatedImages).find(k => generatedImages[k].data);
    if (firstImgKey && generatedImages[firstImgKey].data) {
      try {
        const response = await fetch(generatedImages[firstImgKey].data!);
        const blob = await response.blob();
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      } catch (err) {
        console.warn('Image clipboard failed:', err);
      }
    }
    // 2. Open X with prefilled text (strip image/url tags)
    const cleanText = (generatedScript || '')
      .replace(/\[IMAGE: [^\]]+\]/g, '')
      .replace(/\[URL: [^\]]+\]/g, '')
      .trim();
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(cleanText)}`, '_blank');
    // 3. Feedback
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 3000);
  };

  const handleSaveToBank = () => {
    if (!generatedScript || !synthesizingTrend) return;
    onSaveIdea({
      id: Date.now().toString(),
      title: `${selectedFormat}: ${synthesizingTrend.topic}`,
      content: generatedScript,
      type: 'Deep Research',
      timestamp: Date.now()
    });
    alert('Saved to Neural Idea Bank.');
  };

  useEffect(() => {
    if (isOpen && trends.length === 0) loadTrends();
  }, [isOpen]);

  const formats: ScriptFormat[] = ['X Post', 'X Thread', 'Script'];
  const showImageControls = selectedFormat === 'X Post' || selectedFormat === 'X Thread';

  // Render script body with inline images
  const renderScriptContent = () => {
    if (!generatedScript) return null;
    if (isEditing) {
      return (
        <textarea
          value={generatedScript}
          onChange={(e) => setGeneratedScript(e.target.value)}
          className="w-full h-64 lg:h-[500px] bg-zinc-950 border border-zinc-800 rounded-2xl focus:ring-1 focus:ring-white/20 text-zinc-300 text-sm leading-relaxed font-mono resize-none p-4 lg:p-6 scrollbar-hide outline-none"
        />
      );
    }
    const parts = generatedScript.split(/(\[IMAGE: [^\]]+\])/g);
    return (
      <div className="space-y-4 lg:space-y-6 animate-in slide-in-from-bottom-8 fade-in duration-700">
        {parts.map((part, i) => {
          const imgState = generatedImages[part];
          if (imgState) {
            return (
              <div key={i} className="my-4">
                <div className="relative aspect-video bg-zinc-900 border border-zinc-800 rounded-2xl lg:rounded-3xl overflow-hidden group/img">
                  {imgState.loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/50">
                      <Loader2 size={24} className="animate-spin text-white mb-2" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-700">Generating Neural Image</span>
                    </div>
                  ) : imgState.data ? (
                    <img src={imgState.data} alt="AI Generated" className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-800"><ImageIcon size={32} /></div>
                  )}
                </div>
              </div>
            );
          }
          return (
            <div key={i} className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" /> }}>
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
      {/* ── Format Picker Modal ─────────────────────────────────────────── */}
      {trendForFormatSelection && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full sm:max-w-sm bg-zinc-950 border border-zinc-800 rounded-t-[2rem] sm:rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Select Format</h4>
              <button onClick={() => setTrendForFormatSelection(null)} className="p-2 text-zinc-700 hover:text-white transition-all"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              {formats.map(f => (
                <button
                  key={f}
                  onClick={() => { handleSynthesize(trendForFormatSelection, f); setTrendForFormatSelection(null); }}
                  className="w-full py-4 bg-zinc-900 hover:bg-white hover:text-black border border-zinc-800 transition-all rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 active:scale-95"
                >
                  Create {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Synthesis Result Modal ──────────────────────────────────────── */}
      {synthesizingTrend && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full sm:max-w-4xl bg-[#0a0a0a] border border-zinc-800 rounded-t-[2rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col h-[95dvh] sm:max-h-[90vh] shadow-[0_0_150px_rgba(255,255,255,0.05)]">

            {/* Header */}
            <div className="p-4 sm:p-6 lg:p-8 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 bg-white/10 rounded-xl sm:rounded-2xl text-white">
                  <Zap size={18} fill="currentColor" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-xl font-black tracking-tighter text-white">Neural Synthesis</h3>
                  <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-black truncate max-w-[180px] sm:max-w-sm">{synthesizingTrend.topic}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {showImageControls && imageRemaining > 0 && (
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                    <ImageIcon size={10} className="text-white" />
                    <span className="text-[9px] font-black text-zinc-400">{imageRemaining} left</span>
                  </div>
                )}
                <button onClick={() => setSynthesizingTrend(null)} className="p-2 text-zinc-700 hover:text-white transition-all"><X size={22} /></button>
              </div>
            </div>

            {/* Format + Image Toggle Bar */}
            <div className="px-4 sm:px-6 lg:px-8 py-3 bg-zinc-900/20 border-b border-zinc-900 flex items-center gap-2 flex-wrap flex-shrink-0">
              {formats.map(f => (
                <button
                  key={f}
                  onClick={() => handleSynthesize(synthesizingTrend, f)}
                  className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${selectedFormat === f ? 'bg-white border-white text-black' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                >
                  {f}
                </button>
              ))}
              {showImageControls && (
                <button
                  onClick={() => setImagesEnabled(prev => !prev)}
                  disabled={imageRemaining <= 0}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${imagesEnabled && imageRemaining > 0 ? 'bg-white/10 border-white/30 text-white' : 'border-zinc-800 text-zinc-600'} ${imageRemaining <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {imagesEnabled && imageRemaining > 0 ? <ImageIcon size={10} /> : <ImageOff size={10} />}
                  <span className="hidden xs:inline">{imagesEnabled && imageRemaining > 0 ? `On (${imageRemaining})` : imageRemaining <= 0 ? 'No Quota' : 'Off'}</span>
                </button>
              )}
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-[9px] font-black uppercase tracking-widest border ${isEditing ? 'bg-white text-black border-white' : 'border-zinc-800 text-zinc-500 hover:text-white'}`}
                >
                  {isEditing ? <><Eye size={12} /> View</> : <><Edit3 size={12} /> Edit</>}
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 bg-black/40 scrollbar-hide">
              {!generatedScript ? (
                <div className="h-60 flex flex-col items-center justify-center space-y-6">
                  <Loader2 className="animate-spin text-white" size={44} />
                  <p className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-600">Analyzing Synaptic Pulse...</p>
                </div>
              ) : renderScriptContent()}
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 lg:p-6 border-t border-zinc-900 bg-zinc-950 flex-shrink-0">
              {/* Mobile: compact grid */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => { navigator.clipboard.writeText(generatedScript || ''); setCopyDone(true); setTimeout(() => setCopyDone(false), 2000); }}
                  className="flex-1 py-3 border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-white transition-all"
                >
                  {copyDone ? '✓ Copied' : 'Copy Text'}
                </button>
                {selectedFormat.includes('X') && (
                  <button
                    onClick={syncToX}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 active:scale-95 transition-all shadow-lg"
                  >
                    <Share2 size={13} /> Sync to X
                  </button>
                )}
                <button
                  onClick={handleSaveToBank}
                  disabled={!generatedScript}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-900 border border-zinc-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all disabled:opacity-20"
                >
                  <BookmarkPlus size={13} /> Save Idea
                </button>
              </div>
              <div className="mt-2 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-800">
                <ShieldCheck size={11} className="text-green-900" /> Neural Safe Logic
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Refine Modal ─────────────────────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full sm:max-w-lg bg-zinc-950 border border-zinc-800 rounded-t-[2rem] sm:rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-white italic">Neural Refinement</h4>
                <p className="text-[10px] text-zinc-500 uppercase font-bold">Mutate the script with AI</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 text-zinc-600 hover:text-white transition-colors"><X size={18} /></button>
            </div>
            <textarea
              autoFocus
              value={refinement}
              onChange={(e) => setRefinement(e.target.value)}
              placeholder="E.g. 'Make it punchier', 'Change hashtags to #Fintech'..."
              className="w-full h-28 bg-zinc-900 border border-zinc-800 focus:border-white/50 rounded-xl p-4 text-xs font-bold text-white placeholder:text-zinc-700 outline-none transition-all resize-none"
            />
            <button
              disabled={!refinement || loading}
              onClick={async () => { await handleRefine(); setShowEditModal(false); }}
              className="mt-3 w-full py-4 bg-white hover:bg-zinc-200 disabled:bg-zinc-800 text-black rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {isRefining ? <Loader2 size={16} className="animate-spin" /> : <><Sparkles size={16} /> Apply Transformation</>}
            </button>
          </div>
        </div>
      )}

      {/* ── Main Widget ─────────────────────────────────────────────────── */}
      <div className={`fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-30 flex flex-col items-end transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isOpen ? 'w-[calc(100vw-2rem)] sm:w-[400px]' : 'w-14'}`}>
        {isOpen && (
          <div className="w-full bg-[#050505] border border-zinc-800/60 rounded-[2rem] flex flex-col overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.9)] mb-4 animate-in slide-in-from-bottom-8 fade-in ring-1 ring-white/5">
            {/* Panel Header */}
            <div className="p-6 pb-4 border-b border-zinc-900/50 bg-gradient-to-br from-zinc-900/40 to-transparent">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Radio size={18} className="text-white" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-600">Neural Pulse</p>
                    <p className="text-xl font-black text-white tracking-tighter italic" style={{ fontFamily: "'Orbitron', sans-serif" }}>Intercepted</p>
                  </div>
                </div>
                <button
                  onClick={loadTrends}
                  disabled={loading}
                  className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all disabled:opacity-30"
                >
                  <Sparkles size={16} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {interests.filter(i => i.active).slice(0, 3).map(i => (
                  <span key={i.id} className="text-[8px] font-black uppercase tracking-widest bg-zinc-900/60 text-zinc-600 px-2.5 py-1 rounded-full border border-zinc-800/50">{i.label}</span>
                ))}
              </div>
            </div>

            {/* Trends List */}
            <div className="flex-1 overflow-y-auto max-h-[55vh] p-4 sm:p-6 space-y-3 scrollbar-hide">
              {loading ? (
                <div className="py-16 flex flex-col items-center justify-center text-zinc-800">
                  <div className="w-10 h-10 border-2 border-zinc-800 border-t-white rounded-full animate-spin mb-4"></div>
                  <p className="text-[9px] uppercase font-black tracking-[0.3em]">Crawling Digital Cortex...</p>
                </div>
              ) : trends.length > 0 ? (
                trends.map((trend, i) => (
                  <div key={i} className="p-4 bg-zinc-900/20 border border-zinc-800/40 rounded-2xl hover:border-zinc-700/60 transition-all duration-300">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${trend.platform.toLowerCase().includes('x') ? 'bg-white text-black' : trend.platform.toLowerCase().includes('yt') ? 'bg-red-600 text-white' : 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white'}`}>
                        {trend.platform}
                      </span>
                      {/* Action buttons — always visible on mobile */}
                      <div className="flex gap-1.5">
                        {sources[0]?.web?.uri && (
                          <a href={sources[0].web.uri} target="_blank" rel="noreferrer" className="p-1.5 bg-zinc-800/50 rounded-lg text-zinc-500 hover:text-white border border-zinc-700/30 transition-colors">
                            <ExternalLink size={12} />
                          </a>
                        )}
                        <button
                          onClick={() => setTrendForFormatSelection(trend)}
                          className="p-1.5 bg-white/10 rounded-lg text-white hover:bg-white hover:text-black transition-all border border-white/10 active:scale-95"
                          title="Generate content"
                        >
                          <Zap size={12} className="fill-current" />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-sm font-black text-zinc-200 mb-1.5 leading-tight tracking-tight">{trend.topic}</h4>
                    <p className="text-[10px] text-zinc-600 italic line-clamp-2 leading-relaxed">"{trend.hook}"</p>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center">
                  <TrendingUp size={36} className="mx-auto mb-4 text-zinc-900 opacity-20" />
                  <p className="text-xs text-zinc-700 font-black uppercase tracking-widest">No Active Transmissions</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-zinc-950/80 border-t border-zinc-900/50">
              <div className="flex justify-between items-center opacity-30">
                <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">Neural Feed</p>
                <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">v5.0</p>
              </div>
            </div>
          </div>
        )}

        {/* FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-[0_20px_60px_rgba(255,255,255,0.05)] transition-all duration-500 group ${isOpen ? 'bg-white text-black rotate-[225deg] scale-90 rounded-full' : 'bg-white text-black hover:bg-zinc-100 border border-white/10 active:scale-95'}`}
        >
          {isOpen ? <X size={24} /> : (
            <div className="relative">
              <TrendingUp size={24} className="group-hover:scale-110 transition-transform" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping"></div>
            </div>
          )}
        </button>
      </div>
    </>
  );
};

export default TrendsManager;
