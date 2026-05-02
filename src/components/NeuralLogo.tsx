
import React from 'react';

const NeuralLogo: React.FC<{ size?: number }> = ({ size = 40 }) => {
  return (
    <div 
      className="relative flex items-center justify-center overflow-hidden rounded-xl bg-black border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
      style={{ width: size, height: size }}
    >
      {/* Background Neural Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:4px_4px]" />
      </div>

      {/* The "C" Shape made from Synaptic Nodes */}
      <div className="relative w-3/4 h-3/4">
        {/* Connection Lines (CSS borders/pseudo-elements) */}
        <div className="absolute inset-0 border-r-0 border-t-2 border-l-2 border-b-2 border-white/40 rounded-full rotate-45" />
        
        {/* Synaptic Nodes (Animated Pulses) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]" style={{ animationDelay: '0.5s' }} />
        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]" style={{ animationDelay: '1s' }} />
        
        {/* Core Glow */}
        <div className="absolute inset-2 bg-white/5 rounded-full blur-md animate-pulse" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes neural-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-2px) scale(1.05); }
        }
      `}} />
    </div>
  );
};

export default NeuralLogo;
