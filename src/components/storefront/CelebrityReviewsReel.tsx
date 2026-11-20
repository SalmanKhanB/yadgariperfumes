"use client";

import { ICelebrityReview } from "@/server/db/models/CelebrityReview";
import { cleanEmbedCode } from "@/lib/embedUtils";

interface CelebrityReviewsReelProps {
  videos: ICelebrityReview[];
}

export default function CelebrityReviewsReel({ videos }: CelebrityReviewsReelProps) {
  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-12">
      <div className="text-center md:text-left">
        <span className="text-xs font-mono uppercase tracking-[0.15em] text-accent">AS SEEN ON TIKTOK / INSTAGRAM</span>
        <h2 className="text-3xl md:text-5xl font-serif uppercase tracking-[0.1em] mt-4 mb-2 text-foreground">
          Loved by Celebrities & Creators
        </h2>
        <p className="text-muted-foreground text-sm max-w-xl">
          Real reviews and fits from our global creator network. Watch how they wear and style this piece.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {videos.map((review) => (
          <div key={String(review._id)} className="flex flex-col items-center bg-background border border-border group transition-colors hover:bg-muted/30">
            <div className="w-full flex justify-center items-center overflow-hidden border-b border-border bg-transparent min-h-[300px]">
              <div 
                className="[&>iframe]:max-w-full"
                dangerouslySetInnerHTML={{ __html: cleanEmbedCode(review.videoIframe) }}
              />
            </div>
            <div className="p-4 w-full text-center">
              <h3 className="font-mono text-xs font-bold uppercase tracking-[0.15em] leading-tight text-foreground group-hover:text-accent transition-colors">
                {review.celebrityName}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
