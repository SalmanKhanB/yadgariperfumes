"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PreviewInspector() {
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const [isInspectorActive, setIsInspectorActive] = useState(false);

  // 1. Multi-Window BroadcastChannel Real-Time Sync
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;

    const channel = new BroadcastChannel("sqodex_customizer_sync");
    channel.onmessage = (event) => {
      if (event.data?.type === "SETTINGS_UPDATE") {
        const newSettings = event.data.settings;
        const root = document.querySelector(".storefront-theme") as HTMLElement;
        if (root && newSettings) {
          if (newSettings.themeColors) {
            if (newSettings.themeColors.primary) root.style.setProperty("--primary", newSettings.themeColors.primary);
            if (newSettings.themeColors.background) root.style.setProperty("--background", newSettings.themeColors.background);
            if (newSettings.themeColors.text) root.style.setProperty("--foreground", newSettings.themeColors.text);
            if (newSettings.themeColors.accent) root.style.setProperty("--accent", newSettings.themeColors.accent);
          }
          if (newSettings.borderRadius) {
            root.style.setProperty("--radius", newSettings.borderRadius);
          }
          if (newSettings.typography?.bodySize) {
            root.style.fontSize = newSettings.typography.bodySize;
          }
        }
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  useEffect(() => {
    if (!isPreview) return;

    // 1. Post ready message to parent Customizer
    window.parent.postMessage({ type: "INSPECTOR_READY" }, "*");

    // 2. Listen to active state commands from parent Customizer
    const handleParentMessage = (event: MessageEvent) => {
      if (event.data?.type === "SET_INSPECTOR_ACTIVE") {
        setIsInspectorActive(event.data.active);
      } else if (event.data?.type === "SCROLL_TO_SECTION") {
        // Find the section and scroll to it smoothly
        const sectionId = event.data.sectionId;
        const selector = `[data-section-id="${sectionId}"]`;
        const el = document.querySelector(selector);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    };
    window.addEventListener("message", handleParentMessage);

    return () => {
      window.removeEventListener("message", handleParentMessage);
    };
  }, [isPreview]);

  useEffect(() => {
    if (!isPreview || !isInspectorActive) return;

    // 1. Inject visual editor CSS styles for overlays
    const style = document.createElement("style");
    style.id = "customizer-inspector-styles";
    style.innerHTML = `
      .customizer-hover-section {
        position: relative !important;
        cursor: pointer !important;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }
      .customizer-hover-section::after {
        content: '';
        position: absolute;
        inset: 0;
        border: 2px dashed rgba(59, 130, 246, 0.4);
        pointer-events: none;
        z-index: 99998;
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
      }
      .customizer-hover-section:hover::after {
        opacity: 1;
        border: 2px solid var(--accent, #3b82f6);
        animation: marchAnts 15s linear infinite;
      }
      .customizer-hover-section:hover {
        background-color: rgba(59, 130, 246, 0.02) !important;
        transform: scale(1.002);
      }
      .customizer-edit-badge {
        position: absolute !important;
        top: 12px !important;
        left: 12px !important;
        background: rgba(255, 255, 255, 0.7) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        color: var(--accent, #3b82f6) !important;
        border: 1px solid rgba(255, 255, 255, 0.4) !important;
        font-family: sans-serif !important;
        font-size: 10px !important;
        font-weight: 800 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.1em !important;
        padding: 6px 12px !important;
        border-radius: 999px !important;
        z-index: 99999 !important;
        pointer-events: none !important;
        box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(59, 130, 246, 0.15) !important;
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      @keyframes marchAnts {
        to { background-position: 100% 100%; }
      }
      @keyframes popIn {
        from { opacity: 0; transform: scale(0.9) translateY(4px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
      iframe a {
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);

    // 2. Identify sections and attach attributes + edit badges
    const activeBadges: HTMLDivElement[] = [];

    const scanSections = () => {
      const elements = document.querySelectorAll("[data-customizer-block='true']");
      
      elements.forEach((el, index) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.dataset.customizerMapped) return;
        htmlEl.dataset.customizerMapped = "true";

        const label = htmlEl.dataset.blockLabel || htmlEl.dataset.blockType || "Custom Block";
        const sectionId = htmlEl.dataset.blockId || `section-${index}`;
        
        htmlEl.classList.add("customizer-hover-section");
        htmlEl.dataset.sectionId = sectionId;

        const badge = document.createElement("div");
        badge.className = "customizer-edit-badge";
        badge.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
          </svg>
          <span>${label}</span>
        `;
        htmlEl.style.position = "relative";
        htmlEl.appendChild(badge);
        activeBadges.push(badge);
      });
    };

    scanSections();
    const interval = setInterval(scanSections, 1500);

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const match = target.closest(".customizer-hover-section") as HTMLElement;
      if (match) {
        e.preventDefault();
        e.stopPropagation();
        
        window.parent.postMessage({
          type: "SELECT_SECTION",
          sectionId: match.dataset.sectionId,
          blockType: match.dataset.blockType
        }, "*");
      }
    };
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      clearInterval(interval);
      style.remove();
      document.removeEventListener("click", handleDocumentClick, true);
      
      const elements = document.querySelectorAll(".customizer-hover-section");
      elements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.classList.remove("customizer-hover-section");
        delete htmlEl.dataset.customizerMapped;
        delete htmlEl.dataset.sectionId;
      });

      activeBadges.forEach((badge) => badge.remove());
    };
  }, [isPreview, isInspectorActive]);

  return null;
}
