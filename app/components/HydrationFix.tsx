"use client";

import { useEffect } from "react";

export default function HydrationFix() {
  useEffect(() => {
    const removeBisAttributes = () => {
      const nodes = document.querySelectorAll("*");
      nodes.forEach((node) => {
        Array.from(node.attributes).forEach((attribute) => {
          const name = attribute.name;
          if (name.startsWith("bis_") || name.startsWith("data-bis") || name.startsWith("aria-bis")) {
            node.removeAttribute(name);
          }
        });
      });
    };

    // Intercept client console warnings specifically from browser extension mutations
    const filterFn = (originalFn: (...args: any[]) => void) => {
      return (...args: any[]) => {
        const text = args
          .map((a) => (typeof a === "string" ? a : a?.message || JSON.stringify(a) || ""))
          .join(" ");

        if (
          text.includes("bis_skin_checked") ||
          text.includes("bis_register") ||
          text.includes("bis_frame_id") ||
          text.includes("data-bis") ||
          (text.includes("hydration-mismatch") && text.includes("bis_"))
        ) {
          return;
        }
        originalFn.apply(console, args);
      };
    };

    const originalError = console.error;
    const originalWarn = console.warn;

    removeBisAttributes();

    const observer = new MutationObserver(() => {
      removeBisAttributes();
    });

    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
    });

    console.error = filterFn(originalError);
    console.warn = filterFn(originalWarn);

    return () => {
      observer.disconnect();
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return null;
}
