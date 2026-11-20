import React from 'react';

export function LiveSerpPreview({ title, description, url }: { title: string, description: string, url: string }) {
  const finalTitle = title || "Example Title";
  const finalDesc = description || "Example meta description that shows up in Google search results.";
  
  return (
    <div className="glass-card rounded-lg p-4 shadow-sm max-w-2xl font-sans">
      <div className="text-sm text-muted-foreground flex items-center mb-1">
        <span className="bg-muted rounded-full w-6 h-6 inline-block mr-2" />
        <span className="truncate">{url}</span>
      </div>
      <h3 className="text-xl text-primary hover:underline cursor-pointer mb-1 truncate">
        {finalTitle}
      </h3>
      <p className="text-sm text-foreground line-clamp-2">
        {finalDesc}
      </p>
    </div>
  );
}
