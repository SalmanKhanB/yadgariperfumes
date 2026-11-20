import React from 'react';

export function SocialCardPreview({ title, description, image, url }: { title: string, description: string, image: string, url: string }) {
  const finalTitle = title || "Example Title";
  const finalDesc = description || "Example description for social media.";
  const finalImage = image || "https://placehold.co/1200x630/e2e8f0/475569?text=No+Image";
  
  return (
    <div className="glass-card rounded-lg shadow-sm max-w-[500px] overflow-hidden font-sans">
      <div className="h-[260px] bg-muted overflow-hidden flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={finalImage} alt="Social Preview" className="w-full h-full object-cover" />
      </div>
      <div className="p-4 bg-background/50 border-t border-border">
        <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1 truncate">{new URL(url || 'https://example.com').hostname}</div>
        <h3 className="text-md font-bold text-foreground leading-tight mb-1 truncate">
          {finalTitle}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {finalDesc}
        </p>
      </div>
    </div>
  );
}
