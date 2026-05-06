
import React from 'react';

interface ArtifactRendererProps {
  content: string;
  className?: string;
}

const ArtifactRenderer: React.FC<ArtifactRendererProps> = ({ content, className }) => {
  // Extract HTML if it's wrapped in markdown code blocks
  const htmlMatch = content.match(/```html\n?([\s\S]*?)\n?```/) || content.match(/<html>([\s\S]*?)<\/html>/i);
  const cleanHtml = htmlMatch ? (htmlMatch[0].startsWith('```') ? htmlMatch[1] : htmlMatch[0]) : content;

  return (
    <div className={`w-full h-full bg-white rounded-3xl overflow-hidden shadow-2xl ${className}`}>
      <iframe
        srcDoc={cleanHtml}
        title="AI Artifact"
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
      />
    </div>
  );
};

export default ArtifactRenderer;
