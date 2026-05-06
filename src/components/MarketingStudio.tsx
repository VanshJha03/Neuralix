
import React, { useState } from 'react';
import { Idea, Interest } from '../types';
import { Megaphone, MessageSquare, Twitter, Instagram, ArrowRight, Loader2, Copy, Check, Film, Trash2, Youtube, Image as ImageIcon, Edit3, X, Zap } from 'lucide-react';
import { generateMarketingContent, generateNeuralImage, refineMarketingContent } from '../services/apiService';
import { CONTENT_GENERATION_SYSTEM_PROMPT } from '../constants';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ArtifactRenderer from './ArtifactRenderer';

interface MarketingStudioProps {
  ideas: Idea[];
  interests: Interest[];
  systemInstruction: string;
  onDeleteIdea: (id: string) => void;
  userSettings: any;
}

const MarketingStudio: React.FC<MarketingStudioProps> = ({ ideas, interests, systemInstruction, onDeleteIdea, userSettings }) => {
  const isFree = userSettings?.tier === 'Free';

  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [format, setFormat] = useState<string>('Deep Research');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Record<string, { data: string | null; loading: boolean }>>({});
  const [refinement, setRefinement] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [artifact, setArtifact] = useState<string | null>(null);
  const [isArtifactView, setIsArtifactView] = useState(false);

  const [topic, setTopic] = useState('');
  const [image1Prompt, setImage1Prompt] = useState('');
  const [image2Prompt, setImage2Prompt] = useState('');

  if (isFree) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="max-w-xl w-full bg-zinc-950 border border-zinc-900 rounded-[3rem] p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <div className="w-24 h-24 bg-zinc-900/50 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-zinc-800 shadow-inner">
            <Megaphone size={48} className="text-zinc-600" />
          </div>
          <h2 className="text-3xl font-normal text-white mb-6 tracking-tighter" style={{ fontFamily: "'Orbitron', sans-serif" }}>Research Studio</h2>
          <p className="text-zinc-500 text-sm mb-12 leading-relaxed max-w-sm mx-auto uppercase tracking-wider font-normal">
            The Research Studio is restricted to **PRO** and **LTD** operators.
            <span className="block mt-4 text-[10px] text-zinc-700">Deep search automation and documentary-style synthesis required advanced neural clearance.</span>
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-5 bg-white text-black font-normal uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-zinc-200 transition-all shadow-xl active:scale-95"
          >
            Upgrade Clearance Level
          </button>
        </div>
      </div>
    );
  }

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
    setGeneratedContent('');
    setGeneratedImages({});
    setArtifact(null);
    setIsArtifactView(false);

    try {
      let contentToGenerate = '';
      if (format === 'Google Docs Report') {
        contentToGenerate = `
          TOPIC: ${topic}
          IMAGE 1 PROMPT: ${image1Prompt}
          IMAGE 2 PROMPT: ${image2Prompt}
        `;
      } else if (format === 'Deep Research') {
        contentToGenerate = `PERFORM DEEP RESEARCH ON THIS BOOKMARK:
        Title: ${selectedIdea?.title}
        Content: ${selectedIdea?.content}
        
        INSTRUCTIONS:
        1. Search 5-10 authoritative sites.
        2. Gather detailed, documentary-style info.
        3. Format the entire response as a self-contained, interactive HTML Artifact.
        4. Use modern CSS (glassmorphism, gradients) inside the HTML.
        5. DO NOT provide any markdown outside the HTML. Start with <!DOCTYPE html> or <html>.
        `;
      } else {
        contentToGenerate = selectedIdea?.content || '';
      }

      const res = await generateMarketingContent(contentToGenerate, format, systemInstruction, userSettings);

      if (format === 'Deep Research') {
        setArtifact(res || '');
        setIsArtifactView(true);
      } else {
        setGeneratedContent(res || '');
        await processImages(res || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    if ((!generatedContent && !artifact) || !refinement || loading) return;
    setLoading(true);
    setIsRefining(true);
    try {
      const res = await refineMarketingContent(
        isArtifactView ? artifact! : generatedContent,
        refinement,
        format,
        systemInstruction
      );

      if (isArtifactView) {
        setArtifact(res || '');
      } else {
        setGeneratedContent(res || '');
        await processImages(res || '');
      }
      setRefinement('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setIsRefining(false);
    }
  };

  const formats = ['Deep Research', 'X Post', 'X Thread', 'Script', 'Google Docs Report'];

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyImageAndShare = async () => {
    // 1. Find the first generated image
    const firstImgKey = Object.keys(generatedImages).find(k => generatedImages[k].data);
    const imgData = firstImgKey ? generatedImages[firstImgKey].data : null;

    if (imgData) {
      try {
        // Fetch the blob and copy to clipboard
        const response = await fetch(imgData);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
        alert("Neural Visual Copied to Clipboard. Paste (Ctrl+V) on X.");
      } catch (err) {
        console.error("Clipboard failed:", err);
      }
    }

    // 2. Prepare text (strip [IMAGE: ...] tags)
    const leanContent = generatedContent.replace(/\[IMAGE: [^\]]+\]/g, '').replace(/\[URL: [^\]]+\]/g, '').trim();
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(leanContent)}`;
    window.open(xUrl, '_blank');
  };

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto h-full flex flex-col lg:flex-row gap-12 lg:overflow-hidden pb-32 lg:pb-0">
      {/* Selection Column */}
      <div className="w-full lg:w-[380px] flex flex-col h-auto lg:h-full shrink-0 animate-in slide-in-from-left duration-700">
        <div className="mb-10">
          <h1 className="text-4xl font-normal tracking-tighter mb-2 uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }}>Research</h1>
          <p className="text-zinc-600 text-[10px] font-normal uppercase tracking-[0.4em]">Workbench v2.0</p>
        </div>

        <div className="flex-1 lg:overflow-y-auto pr-2 space-y-6 scrollbar-hide">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-normal text-zinc-700 uppercase tracking-[0.2em]">Format Matrix</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {formats.map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`py-3 px-4 text-[9px] font-normal uppercase tracking-widest rounded-xl border transition-all ${format === f ? 'bg-white text-black border-white shadow-lg' : 'bg-zinc-950 border-zinc-900 text-zinc-600 hover:border-zinc-700'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-zinc-900/50 w-full" />

          <div className="space-y-4">
            {format === 'Google Docs Report' ? (
              <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-normal text-zinc-600 tracking-widest ml-2">Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Subject of research..."
                    className="w-full bg-zinc-950 border border-zinc-900 focus:border-white/30 rounded-2xl p-4 text-xs text-white placeholder:text-zinc-800 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-normal text-zinc-600 tracking-widest ml-2">Visual Core 01</label>
                  <textarea
                    value={image1Prompt}
                    onChange={(e) => setImage1Prompt(e.target.value)}
                    placeholder="Visual prompt..."
                    className="w-full h-24 bg-zinc-950 border border-zinc-900 focus:border-white/30 rounded-2xl p-4 text-xs text-white placeholder:text-zinc-800 outline-none transition-all resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-normal text-zinc-600 tracking-widest ml-2">Visual Core 02</label>
                  <textarea
                    value={image2Prompt}
                    onChange={(e) => setImage2Prompt(e.target.value)}
                    placeholder="Visual prompt..."
                    className="w-full h-24 bg-zinc-950 border border-zinc-900 focus:border-white/30 rounded-2xl p-4 text-xs text-white placeholder:text-zinc-800 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-normal text-zinc-700 uppercase tracking-[0.2em]">Neural Bookmarks</h3>
                  <span className="text-[9px] text-zinc-800 uppercase tracking-tighter">{ideas.length} stored</span>
                </div>
                {ideas.map(idea => (
                  <div
                    key={idea.id}
                    onClick={() => setSelectedIdea(idea)}
                    className={`group relative p-5 rounded-2xl border cursor-pointer transition-all ${selectedIdea?.id === idea.id
                      ? 'bg-white/5 border-white shadow-xl'
                      : 'bg-zinc-950 border-zinc-900 hover:border-zinc-800'
                      }`}
                  >
                    <p className={`text-xs font-normal truncate mb-1 ${selectedIdea?.id === idea.id ? 'text-white' : 'text-zinc-500'}`}>{idea.title}</p>
                    <p className="text-[10px] line-clamp-1 opacity-60 font-normal text-zinc-700">{idea.content}</p>

                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteIdea(idea.id); }}
                      className="absolute top-4 right-4 p-1.5 text-zinc-800 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                {ideas.length === 0 && (
                  <div className="p-10 border border-dashed border-zinc-900 rounded-3xl text-center opacity-30">
                    <p className="text-[9px] font-normal uppercase tracking-widest text-zinc-600">No Research Pillars Stored</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-zinc-900">
          <button
            disabled={(format !== 'Google Docs Report' && !selectedIdea) || (format === 'Google Docs Report' && (!topic || !image1Prompt || !image2Prompt)) || loading}
            onClick={handleGenerate}
            className="w-full py-5 bg-white text-black rounded-2xl font-normal uppercase tracking-[0.25em] text-[10px] flex items-center justify-center gap-3 transition-all disabled:opacity-10 shadow-[0_10px_40px_rgba(255,255,255,0.1)] active:scale-95 group"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : (
              <>
                <Zap size={16} className="group-hover:animate-pulse" />
                {format === 'Deep Research' ? 'Commence Synthesis' : 'Generate Production'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace Column */}
      <div className="flex-1 bg-zinc-950/40 border border-zinc-900 rounded-[3rem] p-6 lg:p-10 lg:overflow-y-auto relative animate-in zoom-in fade-in duration-1000 scrollbar-hide min-h-[500px]">
        {!generatedContent && !loading && !artifact && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full"></div>
              <Megaphone size={64} className="relative text-zinc-900 opacity-20" />
            </div>
            <div>
              <h3 className="text-zinc-600 text-[10px] font-normal uppercase tracking-[0.5em] mb-2">Neural Output Terminal</h3>
              <p className="text-zinc-800 text-[11px] font-normal uppercase">Waiting for trajectory selection...</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="relative mb-8">
              <div className="w-20 h-20 border border-zinc-900 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-white" />
              </div>
            </div>
            <p className="text-[10px] font-normal tracking-[0.4em] text-zinc-500 uppercase animate-pulse">Constructing High-Fidelity Logic...</p>
          </div>
        )}

        {isArtifactView && artifact && !loading && (
          <div className="h-full flex flex-col animate-in fade-in zoom-in duration-700">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-900">
              <div>
                <h3 className="text-[10px] font-normal uppercase tracking-[0.3em] text-zinc-500">Research Artifact</h3>
                <p className="text-xs text-white font-normal mt-1">{selectedIdea?.title || topic}</p>
              </div>
              <button
                onClick={() => setIsArtifactView(false)}
                className="px-4 py-2 border border-zinc-800 rounded-xl text-[9px] text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
              >
                Close Workbench
              </button>
            </div>
            <div className="flex-1 min-h-0 bg-black/40 rounded-3xl overflow-hidden border border-zinc-900 shadow-2xl">
              <ArtifactRenderer content={artifact} />
            </div>

            <div className="mt-8">
              <div className="relative group">
                <input
                  type="text"
                  value={refinement}
                  onChange={(e) => setRefinement(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                  placeholder="Ask AI to expand research or refine artifact..."
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-white/30 rounded-2xl py-5 pl-14 pr-32 text-xs font-normal text-white placeholder:text-zinc-800 outline-none transition-all shadow-2xl"
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-white transition-colors">
                  <MessageSquare size={18} />
                </div>
                <button
                  disabled={!refinement || loading}
                  onClick={handleRefine}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-white text-black text-[9px] font-normal uppercase tracking-widest rounded-xl transition-all shadow-xl hover:bg-zinc-200"
                >
                  {isRefining ? <Loader2 size={14} className="animate-spin" /> : 'Refine Neuralix'}
                </button>
              </div>
            </div>
          </div>
        )}

        {generatedContent && !loading && !isArtifactView && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-white">
                  {format.includes('X') ? <Twitter size={20} /> :
                    format.includes('IG') ? <Instagram size={20} /> :
                      format.includes('YT') ? <Youtube size={20} /> : <Megaphone size={20} />}
                </div>
                <div>
                  <h3 className="font-normal text-2xl tracking-tighter uppercase">{format} Output</h3>
                  <p className="text-[9px] text-zinc-600 uppercase tracking-widest mt-1">Production Level: High Fidelity</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {format.includes('X') && (
                  <button
                    onClick={copyImageAndShare}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-xl text-[9px] font-normal uppercase tracking-widest transition-all hover:scale-105"
                  >
                    <Twitter size={12} /> Sync to X
                  </button>
                )}
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-400 hover:text-white text-[9px] font-normal uppercase tracking-widest transition-all"
                >
                  Edit Script
                </button>
                <button onClick={handleCopy} className="p-2 text-zinc-700 hover:text-white transition-colors">
                  {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
              </div>
            </div>
            <div className="space-y-8">
              {generatedContent.split(/(\[IMAGE:\s*[^\]]+\]|\[URL:\s*[^\]]+\])/gi).map((part, i) => {
                const lowerPart = part.toLowerCase();
                const imgState = Object.keys(generatedImages).find(k => k.toLowerCase() === lowerPart) ? generatedImages[Object.keys(generatedImages).find(k => k.toLowerCase() === lowerPart)!] : null;
                if (imgState) {
                  return (
                    <div key={i} className="my-10 animate-in zoom-in fade-in duration-1000">
                      <div className="relative aspect-video bg-zinc-950 border border-zinc-900 rounded-[3rem] overflow-hidden group/img shadow-2xl">
                        {imgState.loading ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950">
                            <div className="w-10 h-10 border-t-2 border-white rounded-full animate-spin mb-4"></div>
                            <span className="text-[9px] font-normal uppercase tracking-[0.4em] text-zinc-700">Synthesizing Visual...</span>
                          </div>
                        ) : imgState.data ? (
                          <img src={imgState.data} alt="AI Visual" className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-[2000ms]" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-zinc-900">
                            <Zap size={64} className="opacity-5" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-8">
                          <p className="text-[10px] text-white uppercase tracking-widest">Neural Generated Visualization</p>
                        </div>
                      </div>
                    </div>
                  );
                }
                if (lowerPart.startsWith('[url:')) {
                  const url = part.replace(/\[URL:\s*/i, '').replace(']', '').trim();
                  return (
                    <div key={i} className="my-10">
                      <div className="relative aspect-video bg-zinc-950 border border-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl">
                        <img src={url} alt="Reference" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={i} className="markdown-content text-zinc-400 text-lg leading-relaxed px-2">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ node, ...props }) => <a {...props} className="text-white underline decoration-zinc-800 hover:decoration-white transition-all" target="_blank" rel="noopener noreferrer" />,
                        p: ({ node, ...props }) => <p {...props} className="mb-6" />,
                        h1: ({ node, ...props }) => <h1 {...props} className="text-white text-3xl font-normal mb-8 tracking-tighter" />,
                        h2: ({ node, ...props }) => <h2 {...props} className="text-white text-2xl font-normal mb-6 tracking-tighter" />,
                        li: ({ node, ...props }) => <li {...props} className="mb-2 list-none border-l-2 border-zinc-900 pl-4" />
                      }}
                    >
                      {part}
                    </ReactMarkdown>
                  </div>
                );
              })}
            </div>

            <div className="mt-16 pt-10 border-t border-zinc-900">
              <div className="relative group">
                <input
                  type="text"
                  value={refinement}
                  onChange={(e) => setRefinement(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                  placeholder="Inject new research direction or stylistic shift..."
                  className="w-full bg-zinc-950 border border-zinc-900 focus:border-white/30 rounded-2xl py-5 pl-14 pr-32 text-xs font-normal text-white placeholder:text-zinc-800 outline-none transition-all shadow-2xl"
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-white transition-colors">
                  <MessageSquare size={18} />
                </div>
                <button
                  disabled={!refinement || loading}
                  onClick={handleRefine}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-white text-black text-[9px] font-normal uppercase tracking-widest rounded-xl transition-all hover:bg-zinc-200"
                >
                  {isRefining ? <Loader2 size={14} className="animate-spin" /> : 'Refine'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* AI Edit Modal Overlay */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-[0_0_50px_rgba(255,0,0,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50"></div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-sm font-normal uppercase tracking-widest text-white">Neural Refinement</h4>
                <p className="text-[10px] text-zinc-500 uppercase font-normal tracking-tighter">Instruct AI to mutate script</p>
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
                className="w-full h-32 bg-zinc-900 border border-zinc-800 focus:border-white/50 rounded-xl p-4 text-xs font-normal text-white placeholder:text-zinc-700 outline-none transition-all resize-none"
              />

              <button
                disabled={!refinement || loading}
                onClick={async () => {
                  await handleRefine();
                  setShowEditModal(false);
                }}
                className="w-full py-4 bg-white hover:bg-zinc-200 disabled:bg-zinc-800 text-black rounded-xl font-normal uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                {isRefining ? <Loader2 size={16} className="animate-spin" /> : <><Zap size={16} /> Apply Transformation</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingStudio;
