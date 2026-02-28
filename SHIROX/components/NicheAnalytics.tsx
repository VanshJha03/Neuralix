
import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Zap,
  Loader2,
  Youtube,
  Twitter,
  Instagram,
  ArrowUpRight,
  Flame,
  BrainCircuit,
  Lightbulb,
  BookmarkPlus,
  Eye,
  Edit3
} from 'lucide-react';
import { Interest, ViralPrediction, CreatorAnalysis, GapAnalysis, Idea } from '../types';
import { runViralPrediction, runCreatorAnalysis, runGapAnalysis, generateMarketingContent, generateNeuralImage } from '../services/apiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X as CloseIcon, Image as ImageIcon } from 'lucide-react';
import { NicheAnalyticsData } from '../types';

interface NicheAnalyticsProps {
  interests: Interest[];
  onSaveIdea: (idea: Idea) => void;
  data: NicheAnalyticsData;
  onUpdateData: (data: NicheAnalyticsData) => void;
  userSettings: any;
}

const NicheAnalytics: React.FC<NicheAnalyticsProps> = ({ interests, onSaveIdea, systemInstruction = '', data, onUpdateData, userSettings }) => {
  const [loading, setLoading] = useState(false);
  const predictions = data.predictions;
  const creators = data.creators;
  const gaps = data.gaps;
  const [activeTab, setActiveTab] = useState<'VIRAL' | 'CREATORS' | 'GAPS'>('VIRAL');

  // Synthesis state
  const [synthesizingContext, setSynthesizingContext] = useState<string | null>(null);
  const [synthesizingTitle, setSynthesizingTitle] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<string>('Script');
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Record<string, { data: string | null; loading: boolean }>>({});

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
    } catch (e) {
      console.error("Analysis failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Analytics only run manually now
  }, []);

  const saveToIdeaBank = (title: string, content: string) => {
    onSaveIdea({
      id: Date.now().toString(),
      title,
      content,
      type: 'Deep Research',
      timestamp: Date.now()
    });
    alert("Saved to Neural Idea Bank.");
  };

  const handleSynthesize = async (context: string, title: string, format: string = selectedFormat) => {
    setSynthesizingContext(context);
    setSynthesizingTitle(title);
    setSelectedFormat(format);
    setGeneratedScript(null);
    setIsGenerating(true);
    setIsEditing(false);
    setGeneratedImages({});

    try {
      const script = await generateMarketingContent(context, format, systemInstruction, userSettings);
      setGeneratedScript(script);

      // Detect and generate images
      const imageMatches = script.match(/\[IMAGE: [^\]]+\]/g);
      if (imageMatches) {
        const initialImages: Record<string, { data: string | null; loading: boolean }> = {};
        imageMatches.forEach(match => {
          initialImages[match] = { data: null, loading: true };
        });
        setGeneratedImages(initialImages);

        // Fetch images in parallel
        await Promise.all(imageMatches.map(async (match) => {
          const prompt = match.replace('[IMAGE: ', '').replace(']', '');
          const imgData = await generateNeuralImage(prompt);
          setGeneratedImages(prev => ({
            ...prev,
            [match]: { data: imgData, loading: false }
          }));
        }));
      }
    } catch (e) {
      console.error("Synthesis Error:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const formats = ['X Post', 'X Thread', 'Script'];

  if (activeInterests.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center">
        <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-full mb-6 text-zinc-700">
          <BarChart3 size={48} />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white mb-2">No Neural Markers Active</h2>
        <p className="text-zinc-500 max-w-sm">Please activate at least one niche in Interest Markers to initiate deep analytics.</p>
      </div>
    );
  }

  return (
    <div className="p-12 max-w-7xl mx-auto h-full overflow-y-auto pb-32">
      <div className="flex items-center justify-between mb-16">
        <div>
          <h1 className="text-5xl font-black tracking-tighter italic mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>NICHE ANALYTICS</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Advanced Synaptic Competitive Mapping</p>
        </div>
        <button
          onClick={performFullAnalysis}
          disabled={loading}
          className="flex items-center gap-4 px-8 py-4 bg-white text-black rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-[0_20px_60px_rgba(255,255,255,0.05)]"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="black" />}
          Refresh Neural Scan
        </button>
      </div>

      {/* View Switcher */}
      <div className="flex gap-4 mb-12 border-b border-zinc-900 pb-4">
        {[
          { id: 'VIRAL', label: 'Viral Predictor', icon: TrendingUp },
          { id: 'CREATORS', label: 'Similar Creators', icon: Users },
          { id: 'GAPS', label: 'Gap Analysis', icon: Target },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-zinc-600 hover:text-white'
              }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center space-y-8 animate-pulse">
          <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-700">Intercepting Market Frequency...</p>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          {activeTab === 'VIRAL' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {predictions.map((p, i) => (
                <div key={i} className="p-10 bg-zinc-900/40 border border-zinc-800 rounded-[3rem] group hover:border-red-900/30 transition-all">
                  <div className="flex justify-between items-start mb-8">
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${p.velocity === 'Early' ? 'bg-blue-600/10 text-blue-500 border border-blue-900/30' :
                      p.velocity === 'Rising' ? 'bg-green-600/10 text-green-500 border border-green-900/30' :
                        p.velocity === 'Peak' ? 'bg-white text-black border border-white' :
                          'bg-zinc-800 text-zinc-500'
                      }`}>
                      {p.velocity} Phase
                    </div>
                    <div className="text-2xl font-black italic text-zinc-700">{p.score}% <span className="text-[10px] not-italic uppercase tracking-widest">Velocity</span></div>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 tracking-tighter leading-none">{p.topic}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed mb-8">{p.why}</p>
                  <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden mb-8">
                    <div className={`h-full transition-all duration-1000 ${p.score > 80 ? 'bg-white' : 'bg-zinc-700'}`} style={{ width: `${p.score}%` }}></div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {formats.map(f => (
                      <button
                        key={f}
                        onClick={() => handleSynthesize(`${p.topic}: ${p.why}`, p.topic, f)}
                        className="px-3 py-1 bg-zinc-950 border border-zinc-900 rounded-lg text-[8px] font-black uppercase text-zinc-500 hover:text-white hover:border-red-600/50 transition-all tracking-widest"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'CREATORS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {creators.map((c, i) => (
                <div key={i} className="p-10 bg-zinc-900/40 border border-zinc-800 rounded-[3rem] hover:border-red-900/30 transition-all">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
                      {c.platform === 'YT' && <Youtube className="text-red-500" size={24} />}
                      {c.platform === 'X' && <Twitter className="text-white" size={24} />}
                      {c.platform === 'IG' && <Instagram className="text-pink-500" size={24} />}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white italic">{c.name}</h3>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{c.style}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-8">
                    {formats.map(f => (
                      <button
                        key={f}
                        onClick={() => handleSynthesize(`${c.name} style: ${c.style}. Hooks: ${c.successfulHooks.join(' | ')}`, c.name, f)}
                        className="px-3 py-1 bg-zinc-950 border border-zinc-900 rounded-lg text-[8px] font-black uppercase text-zinc-500 hover:text-white hover:border-red-600/50 transition-all tracking-widest"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'GAPS' && (
            <div className="space-y-12">
              {gaps.map((g, i) => (
                <div key={i} className="bg-zinc-900/20 border border-zinc-800 rounded-[4rem] p-12 flex flex-col md:flex-row gap-12 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-[120px] pointer-events-none group-hover:bg-white/10 transition-all"></div>

                  <div className="flex-1 space-y-8">
                    <div>
                      <h3 className="text-3xl font-black italic text-white mb-2 tracking-tighter">{g.trend}</h3>
                      <div className="h-1 w-20 bg-white"></div>
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 bg-zinc-950/50 rounded-3xl border border-zinc-900">
                        <p className="text-[10px] font-black uppercase text-zinc-700 tracking-[0.3em] mb-3">The Common Narrative</p>
                        <p className="text-zinc-500 text-sm italic">"{g.crowdIsSaying}"</p>
                      </div>

                      <div className="p-6 bg-red-600/5 rounded-3xl border border-red-900/20">
                        <div className="flex items-center gap-3 mb-3">
                          <BrainCircuit className="text-red-500" size={18} />
                          <p className="text-[10px] font-black uppercase text-red-600 tracking-[0.3em]">The Synaptic Gap</p>
                        </div>
                        <p className="text-zinc-200 text-sm font-bold">{g.missingPiece}</p>
                      </div>
                    </div>
                  </div>

                  <div className="md:w-1/3 bg-black/60 border border-zinc-800 p-8 rounded-[3rem] flex flex-col justify-center items-center text-center">
                    <Lightbulb className="text-yellow-500 mb-6" size={48} />
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-4">Neural Hook Strategy</h4>
                    <p className="text-sm font-black italic text-white leading-tight mb-8">"{g.hookUSP}"</p>
                    <div className="flex flex-wrap gap-2 justify-center mt-auto pb-4">
                      {formats.map(f => (
                        <button
                          key={f}
                          onClick={() => handleSynthesize(`${g.trend} gap: ${g.missingPiece}. USP: ${g.hookUSP}`, g.trend, f)}
                          className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[8px] font-black uppercase text-zinc-500 hover:text-white hover:border-red-600/50 transition-all tracking-widest"
                        >
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
      {/* Synthesis Result Modal */}
      {synthesizingContext && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-4xl bg-[#0a0a0a] border border-zinc-800 rounded-[3rem] overflow-hidden flex flex-col max-h-[90vh] shadow-[0_0_150px_rgba(255,255,255,0.05)]">
            {/* Modal Header */}
            <div className="p-8 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl text-white shadow-inner">
                  <Zap size={24} fill="currentColor" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-xl font-black tracking-tighter text-white">Neural Niche Synthesis</h3>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-black truncate">Source: {synthesizingTitle}</p>
                </div>
              </div>
              <button onClick={() => setSynthesizingContext(null)} className="p-2 text-zinc-700 hover:text-white transition-all hover:scale-110" title="Close dialog">
                <CloseIcon size={28} />
              </button>
            </div>

            {/* Format Selector Pills */}
            <div className="px-8 py-4 bg-zinc-900/20 border-b border-zinc-900 flex items-center gap-3">
              <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest mr-2">Neural Translation:</span>
              {formats.map(f => (
                <button
                  key={f}
                  onClick={() => handleSynthesize(synthesizingContext, synthesizingTitle, f)}
                  className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${selectedFormat === f ? 'bg-white border-white text-black shadow-lg shadow-white/10' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'
                    }`}
                >
                  {f}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-[9px] font-black uppercase tracking-widest border ${isEditing ? 'bg-white text-black border-white' : 'border-zinc-800 text-zinc-500 hover:text-white'}`}
                >
                  {isEditing ? <><Eye size={12} /> View</> : <><Edit3 size={12} /> Refine</>}
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-10 bg-black/40">
              {isGenerating ? (
                <div className="h-80 flex flex-col items-center justify-center space-y-8">
                  <Loader2 className="animate-spin text-white" size={56} />
                  <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white">Reconfiguring Synaptic Output...</p>
                </div>
              ) : generatedScript ? (
                <div className="space-y-6">
                  {isEditing ? (
                    <textarea
                      value={generatedScript}
                      onChange={(e) => setGeneratedScript(e.target.value)}
                      placeholder="Edit your generated content here..."
                      className="w-full h-80 bg-black/60 border border-zinc-800 rounded-3xl p-6 text-zinc-300 text-sm focus:outline-none focus:border-white/50 transition-all font-mono"
                    />
                  ) : (
                    generatedScript.split(/(\[IMAGE: [^\]]+\]|\[URL: [^\]]+\])/g).map((part, i) => {
                      const imgState = generatedImages[part];
                      if (imgState) {
                        return (
                          <div key={i} className="my-6">
                            <div className="relative aspect-video bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                              {imgState.loading ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/50">
                                  <Loader2 size={24} className="animate-spin text-red-500" />
                                </div>
                              ) : imgState.data ? (
                                <img src={imgState.data} alt="AI Generated" className="w-full h-full object-cover" />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-zinc-800">
                                  <ImageIcon size={32} />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      if (part.startsWith('[URL: ')) {
                        const url = part.replace('[URL: ', '').replace(']', '').trim();
                        return (
                          <div key={i} className="my-6">
                            <div className="relative aspect-video bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden">
                              <img src={url} alt="External Content" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            </div>
                            <p className="mt-2 text-[8px] font-black uppercase text-zinc-700 tracking-widest text-center italic">Visual Reference</p>
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
                    })
                  )}
                </div>
              ) : null}
            </div>

            {/* Footer Actions */}
            <div className="p-8 border-t border-zinc-900 bg-zinc-950 flex justify-between items-center">
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedScript || '');
                    alert("Copied to synaptic buffer.");
                  }}
                  className="px-6 py-3 border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-white"
                >
                  Copy to Buffer
                </button>
                <button
                  onClick={() => saveToIdeaBank(`${selectedFormat}: ${synthesizingTitle}`, generatedScript || '')}
                  className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200"
                >
                  Save to Idea Bank
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
