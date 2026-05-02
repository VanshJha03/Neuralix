
import React, { useState, useEffect } from 'react';
import { Interest, NicheContent } from '../types';
import {
  Plus,
  X,
  Fingerprint,
  Zap,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Youtube,
  Instagram,
  Twitter,
  Loader2,
  Play
} from 'lucide-react';
import { searchNicheContent } from '../services/apiService';

interface InterestsManagerProps {
  interests: Interest[];
  setInterests: React.Dispatch<React.SetStateAction<Interest[]>>;
}

const NicheRadarCarousel: React.FC<{ items: NicheContent[] }> = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const next = () => setActiveIndex((prev) => (prev + 1) % items.length);
  const prev = () => setActiveIndex((prev) => (prev - 1 + items.length) % items.length);

  if (items.length === 0) return null;

  const getPositionStyles = (index: number) => {
    const count = items.length;
    // Calculate the circular difference
    let diff = index - activeIndex;
    if (diff > count / 2) diff -= count;
    if (diff < -count / 2) diff += count;

    const absDiff = Math.abs(diff);

    // Middle item (Focus)
    if (absDiff === 0) {
      return {
        transform: 'translateX(0) scale(1.15) translateZ(150px)',
        zIndex: 50,
        opacity: 1,
        filter: 'blur(0px)',
      };
    }

    // Immediate Neighbors
    if (absDiff === 1) {
      return {
        transform: `translateX(${diff * 75}%) scale(0.85) translateZ(0)`,
        zIndex: 30,
        opacity: 0.4,
        filter: 'blur(6px)',
      };
    }

    // Distant items (Hidden behind screen)
    return {
      transform: `translateX(${diff > 0 ? 120 : -120}%) scale(0.5) translateZ(-300px)`,
      zIndex: 10,
      opacity: 0,
      filter: 'blur(15px)',
      pointerEvents: 'none' as 'none',
    };
  };

  const PlatformBadge = ({ platform }: { platform: string }) => {
    switch (platform) {
      case 'YT': return <div className="p-2 bg-white rounded-xl shadow-lg"><Youtube size={16} className="text-black" /></div>;
      case 'IG': return <div className="p-2 bg-zinc-800 rounded-xl shadow-lg"><Instagram size={16} className="text-white" /></div>;
      case 'X': return <div className="p-2 bg-white rounded-xl shadow-lg"><Twitter size={16} className="text-black" /></div>;
      default: return null;
    }
  };

  return (
    <div className="relative w-full h-[550px] flex items-center justify-center overflow-hidden [perspective:1500px]">
      {/* Navigation Layer */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-8 z-[100] pointer-events-none">
        <button onClick={prev} className="p-5 bg-black/40 backdrop-blur-3xl border border-zinc-800/50 rounded-full text-white pointer-events-auto hover:bg-zinc-800 hover:scale-110 active:scale-95 transition-all shadow-2xl">
          <ChevronLeft size={32} />
        </button>
        <button onClick={next} className="p-5 bg-black/40 backdrop-blur-3xl border border-zinc-800/50 rounded-full text-white pointer-events-auto hover:bg-zinc-800 hover:scale-110 active:scale-95 transition-all shadow-2xl">
          <ChevronRight size={32} />
        </button>
      </div>

      {/* Cards Stack */}
      <div className="relative w-full h-full flex items-center justify-center [transform-style:preserve-3d]">
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={item.id}
              onClick={() => setActiveIndex(index)}
              className="absolute w-[300px] sm:w-[440px] h-[300px] sm:h-[320px] bg-zinc-950 border border-zinc-900 rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer group"
              style={getPositionStyles(index)}
            >
              <div className="relative w-full h-[65%] overflow-hidden">
                <img
                  src={item.thumbnail.startsWith('http') ? item.thumbnail : `https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800`}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 brightness-75 group-hover:brightness-100"
                />
                <div className="absolute top-6 left-6 flex items-center gap-3">
                  <PlatformBadge platform={item.platform} />
                  {isActive && (
                    <div className="px-3 py-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-[8px] font-black text-white uppercase tracking-[0.2em] animate-pulse">
                      Live Pulse
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/20">
                    <Play size={24} className="text-white fill-white ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-6 right-6 px-3 py-1 bg-black/80 backdrop-blur-xl rounded-xl text-[10px] font-black text-white uppercase tracking-widest border border-white/5">
                  {item.views}
                </div>
              </div>

              <div className="p-8">
                <h4 className="text-base font-black text-white line-clamp-1 mb-2 tracking-tight">{item.title}</h4>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.1em] mb-1">{item.channel}</p>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{item.date}</p>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all group/btn"
                  >
                    Watch <ExternalLink size={12} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const InterestsManager: React.FC<InterestsManagerProps> = ({ interests, setInterests }) => {
  const [newLabel, setNewLabel] = useState('');
  const [nicheContent, setNicheContent] = useState<NicheContent[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const toggleInterest = (id: string) => {
    setInterests(interests.map(i => i.id === id ? { ...i, active: !i.active } : i));
  };

  const addInterest = () => {
    if (!newLabel.trim()) return;
    const item: Interest = {
      id: Date.now().toString(),
      label: newLabel.trim(),
      active: true
    };
    setInterests([...interests, item]);
    setNewLabel('');
  };

  const removeInterest = (id: string) => {
    setInterests(interests.filter(i => i.id !== id));
  };

  const handleAnalyzeNiche = async () => {
    setIsSearching(true);
    setNicheContent([]); // Clear existing
    try {
      const results = await searchNicheContent(interests);
      setNicheContent(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="p-6 lg:p-12 max-w-6xl mx-auto h-full overflow-y-auto pb-32 scrollbar-hide">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12 lg:mb-16 text-center lg:text-left">
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full animate-pulse"></div>
            <div className="relative p-4 bg-zinc-900 rounded-[2rem] border border-zinc-800">
              <Fingerprint className="text-white" size={32} />
            </div>
          </div>
          <div>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tighter mb-1 uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }}>Neural Radar</h1>
            <p className="text-zinc-500 font-bold uppercase text-[9px] lg:text-[10px] tracking-[0.3em]">Synaptic alignment with market competitors</p>
          </div>
        </div>

        <button
          onClick={handleAnalyzeNiche}
          disabled={isSearching || interests.filter(i => i.active).length === 0}
          className="w-full lg:w-auto group flex items-center justify-center gap-4 px-10 py-5 bg-white text-black rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-[0_20px_60px_rgba(255,255,255,0.05)] disabled:opacity-10"
        >
          {isSearching ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} className="fill-black" />}
          Deep Neural Scan
        </button>
      </div>

      <div className="bg-zinc-900/10 border border-zinc-900/50 rounded-[2.5rem] lg:rounded-[4rem] p-6 lg:p-12 mb-20 backdrop-blur-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[100px] pointer-events-none"></div>

        <div className="flex flex-wrap gap-4 mb-12">
          {interests.map(interest => (
            <div
              key={interest.id}
              onClick={() => toggleInterest(interest.id)}
              className={`group flex items-center gap-3 px-6 lg:px-8 py-3 lg:py-4 rounded-3xl border cursor-pointer transition-all duration-500 ${interest.active
                ? 'bg-white border-white text-black shadow-[0_0_40px_rgba(255,255,255,0.1)] scale-105'
                : 'bg-zinc-900/40 border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400'
                }`}
            >
              <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest">{interest.label}</span>
              <button
                onClick={(e) => { e.stopPropagation(); removeInterest(interest.id); }}
                className="ml-2 opacity-0 group-hover:opacity-100 text-white/50 hover:text-white transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-800" size={20} />
            <input
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addInterest()}
              placeholder="Inject niche marker..."
              className="w-full bg-black border border-zinc-800 rounded-[1.5rem] lg:rounded-[2rem] pl-16 pr-8 py-4 lg:py-6 text-white focus:border-white/50 outline-none transition-all placeholder:text-zinc-800 font-bold"
            />
          </div>
          <button
            onClick={addInterest}
            className="w-full lg:w-auto px-12 py-4 lg:py-0 bg-zinc-100 text-black rounded-[1.5rem] lg:rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all shadow-xl"
          >
            Inject
          </button>
        </div>
      </div>

      {isSearching && (
        <div className="py-24 flex flex-col items-center justify-center animate-pulse">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-8"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700">Intercepting viral packet streams...</p>
        </div>
      )}

      {nicheContent.length > 0 && !isSearching && (
        <section className="animate-in fade-in slide-in-from-bottom-20 duration-1000 mb-32">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.8em] text-zinc-500 mb-4">Neural Feedback Loop</h2>
            <h3 className="text-3xl lg:text-5xl font-black text-white tracking-tighter">Viral Niche Pulse</h3>
          </div>

          <NicheRadarCarousel items={nicheContent} />
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 text-zinc-600 text-sm">
        <div className="p-8 lg:p-10 bg-zinc-950/50 border border-zinc-900 rounded-[2rem] lg:rounded-[3rem] hover:border-white/20 transition-all group">
          <div className="w-14 lg:w-16 h-14 lg:h-16 bg-white/5 rounded-[1.2rem] lg:rounded-[1.5rem] flex items-center justify-center text-white mb-6 lg:mb-8 group-hover:rotate-12 transition-transform">
            <Search size={28} />
          </div>
          <h3 className="text-zinc-200 font-black mb-4 uppercase text-[11px] lg:text-[12px] tracking-[0.2em]">Contextual Grounding</h3>
          <p className="leading-relaxed text-zinc-500 text-sm lg:text-base">Markers guide ArsCreatio's deep-web crawlers. When active, research queries prioritize current market gaps and high-fidelity technical breakthroughs specifically in your interest clusters.</p>
        </div>
        <div className="p-8 lg:p-10 bg-zinc-950/50 border border-zinc-900 rounded-[2rem] lg:rounded-[3rem] hover:border-white/20 transition-all group">
          <div className="w-14 lg:w-16 h-14 lg:h-16 bg-white/5 rounded-[1.2rem] lg:rounded-[1.5rem] flex items-center justify-center text-white mb-6 lg:mb-8 group-hover:-rotate-12 transition-transform">
            <Zap size={28} />
          </div>
          <h3 className="text-zinc-200 font-black mb-4 uppercase text-[11px] lg:text-[12px] tracking-[0.2em]">Competitive Edge</h3>
          <p className="leading-relaxed text-zinc-500 text-sm lg:text-base">The Niche Radar identifies "Viral Hooks" from top competitors. ArsCreatio synthesizes these into your Marketing Studio, allowing you to adapt successful formats to your unique CognoV perspective.</p>
        </div>
      </div>
    </div>
  );
};

export default InterestsManager;
