"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image, { ImageProps } from "next/image";

// Clean, elegant SVG placeholder data URL for seamless offline/broken image fallbacks
export const DEFAULT_FALLBACK_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none">' +
      '<rect width="600" height="600" fill="#f4f4f5"/>' +
      '<g opacity="0.35" transform="translate(250, 250)">' +
        '<rect x="0" y="0" width="100" height="100" rx="16" stroke="#71717a" stroke-width="6"/>' +
        '<circle cx="35" cy="35" r="10" fill="#71717a"/>' +
        '<path d="M15 80 L45 45 L70 70 L85 55 L90 60" stroke="#71717a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</g>' +
    '</svg>'
  );

export interface ShimmerImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  fallbackSrc?: string;
  wrapperClassName?: string;
  shimmerClassName?: string;
  useStandardImg?: boolean;
  maxRetries?: number;
  retryDelayMs?: number;
}

export default function ShimmerImage({
  src,
  alt,
  className = "",
  wrapperClassName = "",
  shimmerClassName = "",
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
  useStandardImg = false,
  loading = "lazy",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  unoptimized = true,
  maxRetries = 2,
  retryDelayMs = 1200,
  ...props
}: ShimmerImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Clear any pending retry timer safely
  const clearRetryTimer = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // Track component mount status for async safety
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearRetryTimer();
    };
  }, [clearRetryTimer]);

  // Sync state if initial src prop changes
  useEffect(() => {
    clearRetryTimer();
    const validSrc = src || fallbackSrc;
    setImgSrc(validSrc);
    setRetryCount(0);
    setError(false);
    setIsLoaded(false);
  }, [src, fallbackSrc, clearRetryTimer]);

  // Check if image is already cached/completed on mount or update
  const checkCompletion = useCallback((node: HTMLImageElement | null) => {
    if (node) {
      imgRef.current = node;
      if (node.complete && node.naturalWidth > 0) {
        setIsLoaded(true);
      }
    }
  }, []);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [imgSrc]);

  // Online network recovery: if browser was offline and reconnects, retry failed image
  useEffect(() => {
    const handleOnline = () => {
      if (error && typeof src === "string" && !src.startsWith("data:")) {
        setError(false);
        setIsLoaded(false);
        setRetryCount(0);
        setImgSrc(`${src}${src.includes("?") ? "&" : "?"}_online_retry=${Date.now()}`);
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [error, src]);

  const handleLoad = () => {
    clearRetryTimer();
    setIsLoaded(true);
    setError(false);
  };

  const handleError = () => {
    clearRetryTimer();

    const originalSrc = typeof src === "string" ? src : "";
    const isRemoteUrl = originalSrc.startsWith("http://") || originalSrc.startsWith("https://") || originalSrc.startsWith("/");
    const isDataUri = originalSrc.startsWith("data:");

    // If within max retry limit and it's a valid remote URL (not data URI)
    if (retryCount < maxRetries && isRemoteUrl && !isDataUri) {
      const nextAttempt = retryCount + 1;
      setRetryCount(nextAttempt);

      // Backoff delay before attempting reload with cache-busting query
      retryTimeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        const separator = originalSrc.includes("?") ? "&" : "?";
        const retryBustedUrl = `${originalSrc}${separator}_retry=${nextAttempt}&_t=${Date.now()}`;
        setImgSrc(retryBustedUrl);
      }, retryDelayMs * nextAttempt); // Linear backoff: 1.2s, 2.4s
    } else {
      // Retries exhausted or data URI failed -> gracefully show fallback
      setError(true);
      setIsLoaded(true);
      if (imgSrc !== fallbackSrc) {
        setImgSrc(fallbackSrc);
      }
    }
  };

  const isFill = props.fill;

  return (
    <div
      className={`relative overflow-hidden ${
        isFill ? "w-full h-full" : "inline-block"
      } ${wrapperClassName}`}
    >
      {/* Shimmer skeleton background active while image loads or retries */}
      {!isLoaded && !error && (
        <div
          className={`absolute inset-0 z-10 skeleton-shimmer bg-muted/60 pointer-events-none transition-opacity duration-300 ${shimmerClassName}`}
          aria-hidden="true"
        />
      )}

      {error && !fallbackSrc ? (
        <div className="w-full h-full min-h-[120px] flex items-center justify-center bg-muted text-muted-foreground text-xs font-mono uppercase tracking-widest p-4 text-center">
          Image Unavailable
        </div>
      ) : useStandardImg || typeof imgSrc !== "string" ? (
        <img
          ref={checkCompletion}
          src={typeof imgSrc === "string" ? imgSrc : undefined}
          alt={alt || ""}
          loading={priority ? "eager" : loading}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ease-in-out ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          {...(props as any)}
        />
      ) : (
        <Image
          ref={checkCompletion}
          src={imgSrc}
          alt={alt || ""}
          priority={priority}
          loading={priority ? undefined : loading}
          sizes={sizes}
          unoptimized={unoptimized}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ease-in-out ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          {...props}
        />
      )}
    </div>
  );
}
