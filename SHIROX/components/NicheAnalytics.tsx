
import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Users, Target, Zap, Loader2,
  Youtube, Twitter, Instagram, BrainCircuit, Lightbulb,
  BookmarkPlus, Eye, Edit3, Image as ImageIcon, ImageOff, Share2, X as CloseIcon,
} from 'lucide-react';
import { Interest, ViralPrediction, CreatorAnalysis, GapAnalysis, Idea } from '../types';
import { runViralPrediction, runCreatorAnalysis, runGapAnalysis, generateMarketingContent, generateNeuralImage } from '../services/apiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { NicheAnalyticsData } from '../types';

interface NicheAnalyticsProps {
  interests: Interest[];
  onSaveIdea: (idea: Idea) => void;
  data: NicheAnalyticsData;
  onUpdateData: (data: NicheAnalyticsData) => void;
  userSettings: any;
  systemInstruction: string;
  onLimitReached: (message: string) => void;
}

const NicheAnalytics: React.FC<NicheAnalyticsProps> = ({
  interests, onSaveIdea, systemInstruction = '', data, onUpdateData, userSettings, onLimitReached
}) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'VIRAL' | 'CREATORS' | 'GAPS'>('VIRAL');

  // Synthesis state
  const [synthesizingContext, setSynthesizingContext] = useState<string | null>(null);
  const [synthesizingTitle, setSynthesizingTitle] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<string>('Script');
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Record<string, { data: string | null; loading: boolean }>>({});
  const [copyDone, setCopyDone] = useState(false);

  // Image toggle + quota
  const [imagesEnabled, setImagesEnabled] = useState<boolean>(false);
  const imageUsed = userSettings?.usage?.image ?? 0;
  const imageTier = userSettings?.tier || 'free';
  const imageLimit = imageTier === 'beta' ? 10 : 0;
  const imageRemaining = Math.max(0, imageLimit - imageUsed);

  useEffect(() => {
    if (selectedFormat === 'X Post') setImagesEnabled(!!userSettings?.xPostImages && imageRemaining > 0);
    else if (selectedFormat === 'X Thread') setImagesEnabled(!!userSettings?.xThreadImages && imageRemaining > 0);
    else setImagesEnabled(false);
  }, [selectedFormat, userSettings, imageRemaining]);

  const { predictions, creators, gaps } = data;
  const activeInterests = interests.filter(i => i.active);

  const performFullAnalysis = async () => {
    if (activeInterests.length === 0) return;
    setLoading(true);
    try {
      const [vData, cData, gData] = await Promise.all([
        runViralPrediction(interests),
        runCreatorAnalysis(interests),
        runGapAnalysis(interests)
      ]);
      onUpdateData({ predictions: vData, creators: cData, gaps: gData });
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('LIMIT') || msg.includes('429')) onLimitReached(msg);
      else console.error('Analysis failed', e);
    } finally {
      setLoading(false);
    }
  };

  const saveToIdeaBank = (title: string, content: string) => {
    onSaveIdea({ id: Date.now().toString(), title, content, type: 'Deep Research', timestamp: Date.now() });
    alert('Saved to Neural Idea Bank.');
  };

  const handleSynthesize = async (context: string, title: string, format: string = selectedFormat) => {
    setSynthesizingContext(context);
    setSynthesizingTitle(title);
    setSelectedFormat(format);
    setGeneratedScript(null);
    setIsGenerating(true);
    setIsEditing(false);
    setGeneratedImages({});
    setCopyDone(false);

    // Determine if we should generate images for this synthesis.
    // NOTE: We compute this directly from `format` (not from `imagesEnabled` state) because
    // setSelectedFormat(format) is a queued React update — the useEffect that syncs
    // imagesEnabled hasn't fired yet, so reading `imagesEnabled` here gives a STALE value.
    const formatWantsImages = format === 'X Post'
      ? !!userSettings?.xPostImages
      : format === 'X Thread'
        ? !!userSettings?.xThreadImages
        : false;
    const useImages = formatWantsImages && imageRemaining > 0;

    try {
      const script = await generateMarketingContent(context, format, systemInstruction, userSettings);
      setGeneratedScript(script);

      if (useImages) {
        const imageMatches = script.match(/\[IMAGE: [^\]]+\]/g);
        if (imageMatches) {
          const initial: Record<string, { data: string | null; loading: boolean }> = {};
          imageMatches.forEach(match => { initial[match] = { data: null, loading: true }; });
          setGeneratedImages(initial);
          await Promise.all(imageMatches.map(async (match) => {
            try {
              const prompt = match.replace('[IMAGE: ', '').replace(']', '').trim();
              const imgData = await generateNeuralImage(prompt);
              setGeneratedImages(prev => ({ ...prev, [match]: { data: imgData, loading: false } }));
            } catch (imgErr: any) {
              if (imgErr?.message?.includes('LIMIT')) onLimitReached(imgErr.message);
              setGeneratedImages(prev => ({ ...prev, [match]: { data: null, loading: false } }));
            }
          }));
        }
      }
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('LIMIT') || msg.includes('429')) { onLimitReached(msg); setSynthesizingContext(null); }
      else console.error('Synthesis Error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Sync to X: copy image + open x.com with prefilled text
  const syncToX = async () => {
    const firstImgKey = Object.keys(generatedImages).find(k => generatedImages[k].data);
    if (firstImgKey && generatedImages[firstImgKey].data) {
      try {
        const response = await fetch(generatedImages[firstImgKey].data!);
        const blob = await response.blob();
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      } catch (err) { console.warn('Image clipboard failed:', err); }
    }
    const cleanText = (generatedScript || '')
      .replace(/\[IMAGE: [^\]]+\]/g, '')
      .replace(/\[URL: [^\]]+\]/g, '')
      .trim();
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(cleanText)}`, '_blank');
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 3000);
  };

  const formats = ['X Post', 'X Thread', 'Script'];
  const showImageControls = selectedFormat === 'X Post' || selectedFormat === 'X Thread';

  if (activeInterests.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-full mb-6 text-zinc-700"><BarChart3 size={40} /></div>
        <h2 className="text-xl font-black tracking-tight text-white mb-2">No Neural Markers Active</h2>
        <p className="text-zinc-500 max-w-xs text-sm">Activate a niche in Interest Markers to begin deep analytics.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-12 max-w-7xl mx-auto h-full overflow-y-auto pb-32 scrollbar-hide">
      {/* ── Page Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 lg:mb-12">
        <div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tighter italic" style={{ fontFamily: "'Orbitron', sans-serif" }}>NICHE ANALYTICS</h1>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 mt-1">Synaptic Competitive Mapping</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {imageRemaining > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/60 border border-zinc-800 rounded-full text-[9px] font-black uppercase text-zinc-500">
              <ImageIcon size={10} />
              {imageRemaining} imgs
            </div>
          )}
          <button
            onClick={performFullAnalysis}
            disabled={loading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-3 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-100 active:scale-95 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} fill="black" />}
            Refresh Scan
          </button>
        </div>
      </div>

      {/* ── Tab Bar ─────────────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-8 border-b border-zinc-900 pb-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'VIRAL', label: 'Viral Predictor', icon: TrendingUp },
          { id: 'CREATORS', label: 'Creators', icon: Users },
          { id: 'GAPS', label: 'Gap Analysis', icon: Target },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-black' : 'text-zinc-600 hover:text-white'}`}
          >
            <tab.icon size={14} />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.id}</span>
          </button>
        ))}
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-700">Intercepting Market Frequency...</p>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* VIRAL */}
          {activeTab === 'VIRAL' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
              {predictions.map((p, i) => (
                <div key={i} className="p-6 lg:p-10 bg-zinc-900/40 border border-zinc-800 rounded-2xl lg:rounded-[3rem] hover:border-zinc-700 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${p.velocity === 'Early' ? 'bg-blue-600/10 text-blue-500 border border-blue-900/30' : p.velocity === 'Rising' ? 'bg-green-600/10 text-green-500 border border-green-900/30' : p.velocity === 'Peak' ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                      {p.velocity} Phase
                    </div>
                    <p className="text-xl font-black italic text-zinc-700">{p.score}%</p>
                  </div>
                  <h3 className="text-xl font-black text-white mb-3 tracking-tighter leading-none">{p.topic}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed mb-6">{p.why}</p>
                  <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden mb-6">
                    <div className={`h-full transition-all duration-1000 ${p.score > 80 ? 'bg-white' : 'bg-zinc-700'}`} style={{ width: `${p.score}%` }} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formats.map(f => (
                      <button key={f} onClick={() => handleSynthesize(`${p.topic}: ${p.why}`, p.topic, f)}
                        className="px-3 py-1.5 bg-zinc-950 border border-zinc-900 rounded-lg text-[9px] font-black uppercase text-zinc-500 hover:text-white hover:border-zinc-700 transition-all active:scale-95">
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CREATORS */}
          {activeTab === 'CREATORS' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
              {creators.map((c, i) => (
                <div key={i} className="p-6 lg:p-10 bg-zinc-900/40 border border-zinc-800 rounded-2xl lg:rounded-[3rem] hover:border-zinc-700 transition-all">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800">
                      {c.platform === 'YT' && <Youtube className="text-red-500" size={20} />}
                      {c.platform === 'X' && <Twitter className="text-white" size={20} />}
                      {c.platform === 'IG' && <Instagram className="text-pink-500" size={20} />}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white italic">{c.name}</h3>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">{c.style}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formats.map(f => (
                      <button key={f} onClick={() => handleSynthesize(`${c.name} style: ${c.style}. Hooks: ${c.successfulHooks.join(' | ')}`, c.name, f)}
                        className="px-3 py-1.5 bg-zinc-950 border border-zinc-900 rounded-lg text-[9px] font-black uppercase text-zinc-500 hover:text-white hover:border-zinc-700 transition-all active:scale-95">
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* GAPS */}
          {activeTab === 'GAPS' && (
            <div className="space-y-6 lg:space-y-12">
              {gaps.map((g, i) => (
                <div key={i} className="bg-zinc-900/20 border border-zinc-800 rounded-2xl lg:rounded-[4rem] p-6 lg:p-12 flex flex-col lg:flex-row gap-6 lg:gap-12 relative overflow-hidden">
                  <div className="flex-1 space-y-5">
                    <div>
                      <h3 className="text-2xl font-black italic text-white tracking-tighter">{g.trend}</h3>
                      <div className="h-0.5 w-12 bg-white mt-2" />
                    </div>
                    <div className="p-4 lg:p-6 bg-zinc-950/50 rounded-2xl border border-zinc-900">
                      <p className="text-[9px] font-black uppercase text-zinc-700 tracking-widest mb-2">Common Narrative</p>
                      <p className="text-zinc-500 text-sm italic">"{g.crowdIsSaying}"</p>
                    </div>
                    <div className="p-4 lg:p-6 bg-red-600/5 rounded-2xl border border-red-900/20">
                      <div className="flex items-center gap-2 mb-2">
                        <BrainCircuit className="text-red-500" size={16} />
                        <p className="text-[9px] font-black uppercase text-red-600 tracking-widest">The Synaptic Gap</p>
                      </div>
                      <p className="text-zinc-200 text-sm font-bold">{g.missingPiece}</p>
                    </div>
                  </div>

                  <div className="w-full lg:w-1/3 bg-black/60 border border-zinc-800 p-6 lg:p-8 rounded-2xl lg:rounded-[3rem] flex flex-col items-center text-center">
                    <Lightbulb className="text-yellow-500 mb-4" size={36} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Neural Hook</h4>
                    <p className="text-sm font-black italic text-white leading-tight mb-6">"{g.hookUSP}"</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {formats.map(f => (
                        <button key={f} onClick={() => handleSynthesize(`${g.trend} gap: ${g.missingPiece}. USP: ${g.hookUSP}`, g.trend, f)}
                          className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] font-black uppercase text-zinc-500 hover:text-white hover:border-zinc-700 transition-all active:scale-95">
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Synthesis Modal ─────────────────────────────────────────────── */}
      {synthesizingContext && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full sm:max-w-4xl bg-[#0a0a0a] border border-zinc-800 rounded-t-[2rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col h-[95dvh] sm:max-h-[90vh] shadow-[0_0_150px_rgba(255,255,255,0.05)]">

            {/* Modal Header */}
            <div className="p-4 sm:p-6 lg:p-8 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 bg-white/10 rounded-xl text-white">
                  <Zap size={18} fill="currentColor" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-xl font-black tracking-tighter text-white">Niche Synthesis</h3>
                  <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-black truncate max-w-[160px] sm:max-w-sm">{synthesizingTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {showImageControls && imageRemaining > 0 && (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                    <ImageIcon size={10} className="text-white" />
                    <span className="text-[9px] font-black text-zinc-400">{imageRemaining} left</span>
                  </div>
                )}
                <button onClick={() => setSynthesizingContext(null)} className="p-2 text-zinc-700 hover:text-white transition-all">
                  <CloseIcon size={22} />
                </button>
              </div>
            </div>

            {/* Format + Image Toggle Bar */}
            <div className="px-4 sm:px-6 lg:px-8 py-3 bg-zinc-900/20 border-b border-zinc-900 flex items-center gap-2 flex-wrap flex-shrink-0">
              {formats.map(f => (
                <button
                  key={f}
                  onClick={() => handleSynthesize(synthesizingContext, synthesizingTitle, f)}
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
              <div className="ml-auto">
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
              {isGenerating ? (
                <div className="h-60 flex flex-col items-center justify-center space-y-6">
                  <Loader2 className="animate-spin text-white" size={44} />
                  <p className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-600">Reconfiguring Synaptic Output...</p>
                </div>
              ) : generatedScript ? (
                <div className="space-y-4">
                  {isEditing ? (
                    <textarea
                      value={generatedScript}
                      onChange={(e) => setGeneratedScript(e.target.value)}
                      className="w-full h-64 lg:h-80 bg-black/60 border border-zinc-800 rounded-2xl p-4 text-zinc-300 text-sm focus:outline-none focus:border-white/50 transition-all font-mono resize-none"
                    />
                  ) : (
                    generatedScript.split(/(\[IMAGE: [^\]]+\]|\[URL: [^\]]+\])/g).map((part, i) => {
                      const imgState = generatedImages[part];
                      if (imgState) {
                        return (
                          <div key={i} className="my-4">
                            <div className="relative aspect-video bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                              {imgState.loading ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/50"><Loader2 size={24} className="animate-spin text-white" /></div>
                              ) : imgState.data ? (
                                <img src={imgState.data} alt="AI Generated" className="w-full h-full object-cover" />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-zinc-800"><ImageIcon size={32} /></div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      if (part.startsWith('[URL: ')) {
                        const url = part.replace('[URL: ', '').replace(']', '').trim();
                        return (
                          <div key={i} className="my-4">
                            <div className="relative aspect-video bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                              <img src={url} alt="Reference Visual" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            </div>
                            <p className="mt-2 text-[8px] font-black text-zinc-800 uppercase tracking-widest text-center italic">External Reference Visual</p>
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
                    })
                  )}
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 lg:p-6 border-t border-zinc-900 bg-zinc-950 flex-shrink-0">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => { navigator.clipboard.writeText(generatedScript || ''); setCopyDone(true); setTimeout(() => setCopyDone(false), 2000); }}
                  className="flex-1 py-3 border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-white transition-all active:scale-95"
                >
                  {copyDone ? '✓ Copied' : 'Copy Text'}
                </button>
                {selectedFormat.includes('X') && (
                  <button
                    onClick={syncToX}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all active:scale-95 shadow-lg"
                  >
                    <Share2 size={13} /> Sync to X
                  </button>
                )}
                <button
                  onClick={() => saveToIdeaBank(`${selectedFormat}: ${synthesizingTitle}`, generatedScript || '')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-900 border border-zinc-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all active:scale-95"
                >
                  <BookmarkPlus size={13} /> Save Idea
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NicheAnalytics;
