export function cleanEmbedCode(rawHtml: string): string {
  if (!rawHtml) return "";

  // 1. TikTok: Extract video ID and force the clean v2 embed player
  if (rawHtml.includes("tiktok.com")) {
    const videoIdMatch = rawHtml.match(/data-video-id="(\d+)"/) || rawHtml.match(/video\/(\d+)/) || rawHtml.match(/embed\/v2\/(\d+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `<iframe src="https://www.tiktok.com/embed/v2/${videoIdMatch[1]}" style="width: 325px; max-width: 100%; height: 580px; border: none; border-radius: 8px;" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    }
  }

  // 2. Instagram: Extract iframe src and remove /captioned/ to hide text/likes
  if (rawHtml.includes("instagram.com")) {
    const srcMatch = rawHtml.match(/src="([^"]+)"/);
    if (srcMatch && srcMatch[1]) {
      let cleanSrc = srcMatch[1].replace(/\/captioned\/?/, '/');
      return `<iframe src="${cleanSrc}" style="width: 325px; max-width: 100%; height: 580px; border: none; border-radius: 8px;" scrolling="no" allowtransparency="true" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    }
  }

  // 3. YouTube: Extract URL and ensure it uses /embed/
  if (rawHtml.includes("youtube.com") || rawHtml.includes("youtu.be")) {
    const ytMatch = rawHtml.match(/v=([a-zA-Z0-9_-]+)/) || rawHtml.match(/youtu\.be\/([a-zA-Z0-9_-]+)/) || rawHtml.match(/embed\/([a-zA-Z0-9_-]+)/);
    if (ytMatch && ytMatch[1]) {
      return `<iframe src="https://www.youtube.com/embed/${ytMatch[1]}" style="width: 560px; max-width: 100%; height: 315px; border: none; border-radius: 8px;" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    }
  }

  // 4. Generic: Extract src and ensure it's a clean iframe, try to preserve width/height or use defaults
  const srcMatch = rawHtml.match(/src="([^"]+)"/);
  if (srcMatch && srcMatch[1]) {
    const widthMatch = rawHtml.match(/width="?(\d+)"?/);
    const heightMatch = rawHtml.match(/height="?(\d+)"?/);
    const w = widthMatch ? widthMatch[1] + "px" : "100%";
    const h = heightMatch ? heightMatch[1] + "px" : "500px";
    return `<iframe src="${srcMatch[1]}" style="width:${w}; height:${h}; max-width:100%; border: none;" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  }

  // Fallback: return as-is
  return rawHtml;
}
