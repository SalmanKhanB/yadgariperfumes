"use client";

import React, { useState, useRef } from "react";
import { Video, Play } from "lucide-react";

export interface ParsedVideo {
  type: "iframe" | "file";
  url: string;
  isVertical: boolean;
  detectedAspect?: string;
}

export function parseVideoSource(rawInput?: string): ParsedVideo | null {
  if (!rawInput || typeof rawInput !== "string") return null;

  let input = rawInput.trim();
  if (!input) return null;

  let detectedAspect: string | undefined = undefined;

  // 1. If user pasted a full HTML <iframe>...</iframe> code, extract the src attribute and dimensions
  if (input.toLowerCase().includes("<iframe")) {
    const srcMatch = input.match(/src=["']([^"']+)["']/i);
    const widthMatch = input.match(/width=["'](\d+)["']/i);
    const heightMatch = input.match(/height=["'](\d+)["']/i);

    if (widthMatch && heightMatch) {
      const w = parseInt(widthMatch[1], 10);
      const h = parseInt(heightMatch[1], 10);
      if (w > 0 && h > 0) {
        if (h > w) {
          detectedAspect = "9/16";
        } else {
          detectedAspect = `${w}/${h}`;
        }
      }
    }

    if (srcMatch && srcMatch[1]) {
      input = srcMatch[1].trim();
    }
  }

  // 2. Direct Video Files (.mp4, .webm, .ogg, .mov, etc.)
  const isDirectVideo = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(input) || input.includes("/uploads/videos/") || input.includes("/video/upload/");
  if (isDirectVideo) {
    return {
      type: "file",
      url: input,
      isVertical: detectedAspect === "9/16",
      detectedAspect
    };
  }

  // 3. YouTube (watch, shorts, embed, youtu.be, mobile)
  const isYtShort = input.includes("/shorts/");
  const ytMatch = input.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: "iframe",
      url: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`,
      isVertical: isYtShort || detectedAspect === "9/16",
      detectedAspect: isYtShort ? "9/16" : detectedAspect || "16/9"
    };
  }

  // 4. TikTok Embeds & Video links
  const tiktokMatch = input.match(/tiktok\.com\/(?:@[^/]+\/video\/|v\/|embed\/v2\/)(\d+)/i);
  if (tiktokMatch && tiktokMatch[1]) {
    const videoId = tiktokMatch[1];
    return {
      type: "iframe",
      url: `https://www.tiktok.com/embed/v2/${videoId}`,
      isVertical: true,
      detectedAspect: "9/16"
    };
  }

  // 5. Facebook Video / Reels Embeds
  if (input.includes("facebook.com") || input.includes("fb.watch")) {
    const isFbReel = input.includes("/reel/") || input.includes("/reels/") || detectedAspect === "9/16";
    let fbUrl = input;
    if (!input.includes("facebook.com/plugins/video.php")) {
      fbUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(input)}&show_text=0&autoplay=0`;
    }
    return {
      type: "iframe",
      url: fbUrl,
      isVertical: isFbReel,
      detectedAspect: isFbReel ? "9/16" : (detectedAspect || "16/9")
    };
  }

  // 6. Instagram Reels / Posts
  const igMatch = input.match(/instagram\.com\/(?:p|reel|tv)\/([^/?#&]+)/i);
  if (igMatch && igMatch[1]) {
    const code = igMatch[1];
    const isReel = input.includes("/reel/");
    return {
      type: "iframe",
      url: `https://www.instagram.com/p/${code}/embed/captioned/`,
      isVertical: isReel || detectedAspect === "9/16",
      detectedAspect: isReel ? "9/16" : (detectedAspect || "1/1")
    };
  }

  // 7. Vimeo
  const vimeoMatch = input.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      type: "iframe",
      url: `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`,
      isVertical: detectedAspect === "9/16",
      detectedAspect: detectedAspect || "16/9"
    };
  }

  // 8. General fallback for valid HTTP URLs
  if (/^https?:\/\//i.test(input) || /^\/\//i.test(input)) {
    const isPotentialVertical = input.includes("reel") || input.includes("short") || input.includes("story") || detectedAspect === "9/16";
    return {
      type: "iframe",
      url: input,
      isVertical: isPotentialVertical,
      detectedAspect
    };
  }

  return null;
}

interface UniversalVideoEmbedProps {
  url?: string;
  title?: string;
  posterImage?: string;
  aspectRatio?: string; // "auto" | "16/9" | "9/16" | "4/3" | "1/1" | "21/9"
  objectFit?: "cover" | "contain";
  maxHeight?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  showControls?: boolean;
  showPlayButton?: boolean;
  className?: string;
}

export default function UniversalVideoEmbed({
  url,
  title = "Video Player",
  posterImage,
  aspectRatio = "auto",
  objectFit = "contain",
  maxHeight = "75vh",
  autoPlay = false,
  loop = false,
  muted = false,
  showControls = true,
  showPlayButton = false,
  className = ""
}: UniversalVideoEmbedProps) {
  const [hasStarted, setHasStarted] = useState(autoPlay || !posterImage);
  const videoRef = useRef<HTMLVideoElement>(null);
  const parsed = parseVideoSource(url);

  const handleStartPlay = () => {
    setHasStarted(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  if (!parsed) {
    return (
      <div className="w-full min-h-[260px] bg-muted/40 rounded-2xl flex flex-col items-center justify-center text-muted-foreground p-6 text-center border border-dashed border-border">
        <Video className="w-10 h-10 mb-2 text-muted-foreground/40" />
        <p className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
          No Video URL Provided
        </p>
        <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">
          Paste a Facebook Video/Reel, TikTok, YouTube, Instagram, or direct MP4 link.
        </p>
      </div>
    );
  }

  // Determine Aspect Ratio
  let finalAspect: string | undefined = "16/9";
  if (aspectRatio === "auto" || !aspectRatio) {
    finalAspect = parsed.detectedAspect || (parsed.isVertical ? "9/16" : "16/9");
  } else if (aspectRatio === "9/16" || aspectRatio === "vertical") {
    finalAspect = "9/16";
  } else if (aspectRatio === "4/3") {
    finalAspect = "4/3";
  } else if (aspectRatio === "1/1" || aspectRatio === "square") {
    finalAspect = "1/1";
  } else if (aspectRatio === "21/9" || aspectRatio === "cinematic") {
    finalAspect = "21/9";
  } else if (aspectRatio === "16/9") {
    finalAspect = "16/9";
  }

  const isPortrait = finalAspect === "9/16" || parsed.isVertical;

  return (
    <div className={`w-full flex justify-center items-center ${className}`}>
      <div
        className={`relative w-full overflow-hidden bg-black flex items-center justify-center ${
          isPortrait ? "max-w-[420px] rounded-3xl shadow-2xl border border-border" : "rounded-2xl"
        }`}
        style={{
          aspectRatio: finalAspect,
          maxHeight: maxHeight === "none" ? undefined : (maxHeight || "75vh")
        }}
      >
        {/* 1. Direct Video File Player */}
        {parsed.type === "file" && (
          <video
            ref={videoRef}
            src={parsed.url}
            poster={posterImage}
            controls={showControls}
            playsInline
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            preload="metadata"
            className={`w-full h-full ${objectFit === "cover" ? "object-cover" : "object-contain"} bg-black`}
          />
        )}

        {/* 2. Embedded Iframe Player (Facebook / TikTok / YouTube / Vimeo / Instagram) */}
        {parsed.type === "iframe" && (
          <iframe
            src={parsed.url}
            title={title}
            className={`w-full h-full border-0 bg-black ${objectFit === "cover" ? "object-cover" : "object-contain"}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        )}

        {/* 3. Poster Overlay (Only shown if custom poster image is explicitly provided AND user hasn't clicked play yet) */}
        {!hasStarted && posterImage && (
          <div
            onClick={handleStartPlay}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center cursor-pointer group bg-black/40 hover:bg-black/20 transition-all backdrop-blur-[1px]"
            style={{
              backgroundImage: `url(${posterImage})`,
              backgroundSize: objectFit === "contain" ? "contain" : "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat"
            }}
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-accent/30 animate-ping pointer-events-none" />
              <button
                type="button"
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-accent/90 hover:bg-accent text-accent-foreground flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110 group-active:scale-95 border-2 border-white/40"
                aria-label="Play Video"
              >
                <Play size={28} className="translate-x-0.5 fill-current" />
              </button>
            </div>
            <p className="mt-4 text-white text-xs sm:text-sm font-mono font-bold uppercase tracking-widest drop-shadow-md group-hover:text-accent transition-colors">
              Click To Play
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
