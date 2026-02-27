
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bookmark, Copy, RefreshCw, Edit2, Check, X, ExternalLink, Square, Trash2, Brain } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TaskMode, Message, Idea } from '../types';
import { generateSHIROXResponse, extractNeuralMemory, saveMemory } from '../services/apiService';

interface ChatInterfaceProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onSaveIdea: (idea: Idea) => void;
  onCommitMemory: (packet: string) => void;
  userSettings: any;
  systemInstruction: string;
}

const TypewriterText: React.FC<{ text: string; onComplete?: () => void; isTyping?: boolean }> = ({ text, onComplete, isTyping = false }) => {
  const [displayedText, setDisplayedText] = useState(isTyping ? '' : text);
  const textRef = useRef(text);

  useEffect(() => {
    textRef.current = text;
    if (!isTyping) {
      setDisplayedText(text);
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(textRef.current.slice(0, i));
      i += 18; // Hyper fast typing for UX
      if (i > textRef.current.length) {
        setDisplayedText(textRef.current);
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 10);
    return () => clearInterval(interval);
  }, [text, isTyping]);

  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedText}</ReactMarkdown>;
};

const NeuralBackground: React.FC<{ isTyping: boolean }> = ({ isTyping }) => {
  const starsData = React.useMemo(() => [...Array(80)].map((_, i) => ({
    width: Math.random() * 2 + 'px',
    height: Math.random() * 2 + 'px',
    top: Math.random() * 80 + '%',
    left: Math.random() * 100 + '%',
    opacity: Math.random() * 0.7 + 0.3,
    duration: (Math.random() * 3 + 2) + 's',
    delay: Math.random() * 5 + 's'
  })), []);

  const meteorsData = React.useMemo(() => [...Array(6)].map((_, i) => ({
    left: (Math.random() * 30) + '%', // Cluster start in top-left area
    duration: (Math.random() * 4 + 8) + 's',
    delay: (i * 12 + Math.random() * 20) + 's', // Staggered flow
  })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-black">
      {/* Upper Atmospheric Lighting (Nebulas) */}
      <div className="absolute top-[-25%] left-[-15%] w-[80%] h-[80%] bg-purple-600/10 rounded-full blur-[140px] animate-nebula z-0"></div>
      <div className="absolute top-[-15%] right-[-15%] w-[70%] h-[70%] bg-blue-500/5 rounded-full blur-[120px] animate-nebula z-0" style={{ animationDelay: '-10s' }}></div>

      {/* Starfield */}
      <div className="absolute inset-0 z-1">
        {starsData.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              width: star.width,
              height: star.height,
              top: star.top,
              left: star.left,
              opacity: star.opacity,
              animationDelay: star.delay,
              '--duration': star.duration,
            } as React.CSSProperties}
          ></div>
        ))}
      </div>

      {/* Meteors - Single direction: Top-Left to Bottom-Center */}
      {!isTyping && (
        <div className="absolute inset-0 z-20 overflow-hidden">
          {meteorsData.map((m, i) => (
            <div
              key={i}
              className="absolute w-[1.5px] h-[120px] bg-gradient-to-t from-white/0 via-white/80 to-white/0 animate-meteor"
              style={{
                top: '-150px',
                left: m.left,
                '--duration': m.duration,
                '--delay': m.delay,
              } as React.CSSProperties}
            ></div>
          ))}
        </div>
      )}

      {/* Base horizon blend */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>

      {/* Dynamic floor pulse */}
      <div className="absolute inset-0 animate-grid-pulse z-10" style={{ animationDuration: '8s' }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(168,85,247,0.08),transparent_70%)]"></div>
      </div>

      {/* 3D Oceanic Grid Plane */}
      <div
        className="absolute inset-0 origin-center z-20"
        style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
      >
        <div
          className="absolute inset-0 animate-oceanic-grid"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
            transform: 'rotateX(75deg) scale(2.5) translateY(-5%)',
            animationDuration: isTyping ? '12s' : '4s',
            opacity: isTyping ? 0.2 : 0.4,
            maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 65%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 65%)'
          }}
        ></div>
      </div>
    </div>
  );
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages, setMessages, onSaveIdea, onCommitMemory, userSettings, systemInstruction
}) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<TaskMode>('Deep Research');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status, isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => setIsTyping(false), 2000);
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setStatus('Neural Link Interrupted.');
      setTimeout(() => setStatus(''), 2000);
    }
  };

  const processResponse = async (userPrompt: string, history: Message[]) => {
    setIsLoading(true);
    const statusSequence = mode === 'Deep Research' ? ['Scanning Pillars...', 'Synthesizing Neural Nodes...', 'Finalizing Packets...']
      : mode === 'Imagine' ? ['Visualizing Dreams...', 'Rendering Reality...', 'Finalizing Visuals...']
        : ['Optimizing Sync...'];

    let statusIdx = 0;
    setStatus(statusSequence[0]);
    const statusInterval = setInterval(() => {
      statusIdx = (statusIdx + 1) % statusSequence.length;
      setStatus(statusSequence[statusIdx]);
    }, 2000);

    abortControllerRef.current = new AbortController();

    try {
      const chatHistoryForAPI = history.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      // Injecting basic user identity directly into the first message for context efficiency
      const enhancedPrompt = history.length <= 1
        ? `Operator: ${userSettings.name} (@${userSettings.handle})\nContext: High-stakes trajectory.\n\nPrompt: ${userPrompt}`
        : userPrompt;

      const response = await generateSHIROXResponse(enhancedPrompt, mode, chatHistoryForAPI, systemInstruction, userSettings, abortControllerRef.current.signal);

      let aiMessage: Message;
      if (typeof response === 'object' && response.type === 'image') {
        aiMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `${response.text}\n\n![Generated Image](${response.data})`,
          mode
        };
      } else {
        aiMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: (response as any).content || "Neural link silent.",
          mode,
          sources: (response as any).sources
        };
      }

      const updatedHistory = [...history, aiMessage];
      setMessages(updatedHistory);

      // --- NEURAL MEMORY EXTRACTION ---
      // Distill key packets every 5 messages to ensure long-term recall
      if (updatedHistory.length % 5 === 0) {
        setStatus("Distilling Neural Packets...");
        const memories = await extractNeuralMemory(updatedHistory.slice(-5));
        for (const m of memories) {
          await saveMemory(m.packet, m.category).catch(() => { });
        }
      }

    } catch (e: any) {
      if (e.name !== 'AbortError') {
        const isQuota = e.message.toLowerCase().includes('quota') || e.message.includes('429');
        const errorMsg: Message = {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: isQuota
            ? "### ⚠️ Synaptic Overload\nGemini API Quota Exceeded. Please pause and try again in 60 seconds."
            : `Neural feedback loop error: ${e.message}`,
          mode
        };
        setMessages([...history, errorMsg]);
      }
    } finally {
      clearInterval(statusInterval);
      setStatus('');
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSend = async () => {
    if (isLoading) {
      handleStop();
      return;
    }
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input, mode };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    const sentInput = input;
    setInput('');

    await processResponse(sentInput, updatedMessages);
  };

  const handleClear = () => {
    if (confirm("Wipe neural conversation history?")) {
      setMessages([]);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleEdit = (msg: Message) => {
    setEditingId(msg.id);
    setEditContent(msg.content);
  };

  const saveEdit = async (id: string) => {
    const updatedMessages = messages.map(m => m.id === id ? { ...m, content: editContent } : m);
    setMessages(updatedMessages);
    setEditingId(null);

    // If it was a user message, we might want to re-generate the subsequent AI response
    const msgIdx = updatedMessages.findIndex(m => m.id === id);
    const msg = updatedMessages[msgIdx];
    if (msg.role === 'user') {
      const historyUntilNow = updatedMessages.slice(0, msgIdx + 1);
      setMessages(historyUntilNow);
      await processResponse(editContent, historyUntilNow);
    }
  };

  const handleRegenerate = async () => {
    if (messages.length < 2) return;
    const lastUserMsgIdx = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserMsgIdx === -1) return;

    const actualIdx = messages.length - 1 - lastUserMsgIdx;
    const userPrompt = messages[actualIdx].content;
    const historyUntilUser = messages.slice(0, actualIdx + 1);

    setMessages(historyUntilUser);
    await processResponse(userPrompt, historyUntilUser);
  };

  return (
    <div className="flex flex-col h-full relative bg-black">
      <NeuralBackground isTyping={isTyping || isLoading} />

      {!hasMessages ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 max-w-2xl mx-auto w-full z-10">
          <div className="relative mb-8 flex flex-col items-center">
            <div className="absolute inset-0 bg-white/5 blur-[80px] rounded-full animate-pulse pointer-events-none"></div>
            <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-b from-white via-white to-zinc-900 bg-clip-text text-transparent italic leading-none select-none" style={{ fontFamily: "'Orbitron', sans-serif" }}>ArsCreatio</h1>
            <p className="text-zinc-800 font-black mt-2 uppercase tracking-[0.6em] text-[8px]">Neural Intelligence Matrix v5.0</p>
          </div>

          <div className="w-full relative group">
            <div className="relative flex items-center bg-zinc-950/40 backdrop-blur-3xl border border-zinc-900 rounded-2xl p-3 transition-all focus-within:border-white/20 shadow-2xl">
              <textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={`Initiate synaptic link, ${userSettings.name.split(' ')[0]}...`}
                rows={1}
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-zinc-800 resize-none py-1 text-base outline-none font-medium tracking-tight"
              />
              <button onClick={handleSend} className={`p-2 ml-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] ${isLoading ? 'bg-zinc-800 text-white scale-110' : 'bg-white text-black hover:scale-105 active:scale-95'}`}>
                {isLoading ? <Square size={18} fill="currentColor" /> : <Send size={18} />}
              </button>
            </div>
            <div className="mt-8 flex justify-center gap-4">
              {['Deep Research', 'Fast', 'Imagine'].map((m) => (
                <button key={m} onClick={() => setMode(m as TaskMode)} className={`px-6 py-2 rounded-full text-[8px] font-black uppercase tracking-[0.3em] border transition-all ${mode === m ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-zinc-900 border-zinc-900 hover:text-zinc-500'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-8 py-32 z-10 scrollbar-hide">
            <div className="max-w-4xl mx-auto space-y-24 pb-20">
              {messages.map((msg, idx) => (
                <div key={msg.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700 group">
                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[95%] relative ${msg.role === 'user' ? 'bg-zinc-900/30 border border-zinc-800/40 px-8 py-5 rounded-3xl text-zinc-100' : 'text-zinc-300 w-full'}`}>
                      {editingId === msg.id ? (
                        <div className="flex flex-col gap-3 w-full">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder="Edit message content..."
                            title="Edit message content"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:border-red-600 outline-none min-h-[100px]"
                          />
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setEditingId(null)} className="p-2 text-zinc-600 hover:text-white transition-colors" title="Cancel Edit"><X size={16} /></button>
                            <button type="button" onClick={() => saveEdit(msg.id)} className="p-2 text-green-600 hover:text-green-500 transition-colors" title="Save Edit"><Check size={16} /></button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className={`absolute top-0 ${msg.role === 'user' ? '-left-12' : '-right-12'} opacity-0 group-hover:opacity-100 transition-all flex flex-col gap-2`}>
                            <button onClick={() => handleEdit(msg)} className="p-2 bg-zinc-950 border border-zinc-900 rounded-lg text-zinc-600 hover:text-white transition-all"><Edit2 size={12} /></button>
                            <button onClick={() => handleCopy(msg.content)} className="p-2 bg-zinc-950 border border-zinc-900 rounded-lg text-zinc-600 hover:text-white transition-all" title="Copy Text"><Copy size={12} /></button>
                            {msg.role === 'assistant' && (
                              <button onClick={() => { onCommitMemory(msg.content); alert("Neural Packet Committed to Long-Term Memory."); }} className="p-2 bg-zinc-950 border border-zinc-900 rounded-lg text-zinc-600 hover:text-white transition-all" title="Commit to Memory"><Brain size={12} /></button>
                            )}
                            {msg.role === 'assistant' && idx === messages.length - 1 && (
                              <button onClick={handleRegenerate} className="p-2 bg-zinc-950 border border-zinc-900 rounded-lg text-zinc-600 hover:text-white transition-all"><RefreshCw size={12} /></button>
                            )}
                          </div>

                          {msg.role === 'assistant' ? (
                            <div className="markdown-content">
                              <TypewriterText
                                text={msg.content}
                                isTyping={isLoading && idx === messages.length - 1}
                              />
                              {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-zinc-900/50">
                                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 mb-4">Neural Data Nodes:</p>
                                  <div className="flex flex-wrap gap-3">
                                    {msg.sources.map((source, sIdx) => (
                                      source.web && (
                                        <a key={sIdx} href={source.web.uri} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-[10px] font-bold text-zinc-500 hover:text-white hover:border-zinc-700 transition-all group/link">
                                          <ExternalLink size={12} />
                                          <span className="max-w-[150px] truncate">{source.web.title || source.web.uri}</span>
                                        </a>
                                      )
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-xl font-medium leading-relaxed tracking-tight">{msg.content}</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-4 py-8">
                  <div className="w-2 h-2 rounded-full bg-white animate-ping"></div>
                  <span className="text-[10px] font-black tracking-[0.5em] uppercase text-zinc-700">{status || 'Synaptic Transmission...'}</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="px-10 pb-12 bg-gradient-to-t from-black via-black/95 to-transparent z-20 sticky bottom-0">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex justify-center gap-2">
                {['Deep Research', 'Fast', 'Imagine'].map((m) => (
                  <button key={m} onClick={() => setMode(m as TaskMode)} className={`px-4 py-1.5 rounded-full text-[7px] font-black uppercase tracking-[0.2em] border transition-all ${mode === m ? 'bg-white text-black border-white' : 'bg-black/40 text-zinc-700 border-zinc-900 hover:text-zinc-500'}`}>
                    {m}
                  </button>
                ))}
              </div>
              <div className="relative flex items-center bg-zinc-950/80 backdrop-blur-3xl border border-zinc-900 rounded-xl p-2 shadow-2xl transition-all focus-within:border-white/20">
                <button onClick={handleClear} className="p-3 text-zinc-700 hover:text-white transition-colors" title="Wipe History">
                  <Trash2 size={18} />
                </button>
                <textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={isLoading ? "AI responding... Click Square to Stop." : `Evolving context in ${mode} mode...`}
                  rows={1}
                  className="flex-1 bg-transparent border-none focus:ring-0 py-2 px-3 text-sm text-white placeholder:text-zinc-800 resize-none outline-none font-medium"
                />
                <button onClick={handleSend} className={`p-2 ml-2 rounded-lg transition-all shadow-lg ${isLoading ? 'bg-zinc-800 text-white scale-110' : 'bg-white text-black hover:scale-105 active:scale-95'}`}>
                  {isLoading ? <Square size={16} fill="currentColor" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatInterface;
