import type { Metadata } from "next";
import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import SmoothScroll from "@/app/components/SmoothScroll";
import MeshBackground from "@/app/components/MeshBackground";
import HydrationFix from "@/app/components/HydrationFix";

const newsreader = Newsreader({
  variable: "--font-serif-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans-ui",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BoardLanka — Curated Real Estate & Residential Marketplace",
  description: "Boutique property rental marketplace for verified Sri Lankan residences, annexes, and university boarding accommodations.",
  icons: {
    icon: "/logo/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // 1. Instant Theme Configuration
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch (e) {}

                // 2. Strip browser extension DOM mutations before hydration can compare them against SSR markup
                try {
                  const removeBisAttributes = function() {
                    const nodes = document.querySelectorAll('*');
                    nodes.forEach(function(node) {
                      Array.from(node.attributes || []).forEach(function(attribute) {
                        const name = attribute.name;
                        if (
                          name.indexOf('bis_') === 0 ||
                          name.indexOf('data-bis') === 0 ||
                          name.indexOf('aria-bis') === 0
                        ) {
                          node.removeAttribute(name);
                        }
                      });
                    });
                  };

                  removeBisAttributes();

                  const mutationObserver = new MutationObserver(function() {
                    removeBisAttributes();
                  });

                  mutationObserver.observe(document.documentElement, {
                    subtree: true,
                    childList: true,
                    attributes: true,
                  });
                } catch (e) {}

                // 3. Filter out noisy browser extension DOM mutations (e.g. Bitdefender bis_skin_checked)
                try {
                  const filterExtensionError = function(fn) {
                    return function(...args) {
                      const text = args.map(function(a) {
                        if (typeof a === 'string') return a;
                        if (a && a.message) return a.message;
                        try { return JSON.stringify(a); } catch(e) { return ''; }
                      }).join(' ');

                      if (
                        text.indexOf('bis_skin_checked') !== -1 ||
                        text.indexOf('bis_register') !== -1 ||
                        text.indexOf('bis_frame_id') !== -1 ||
                        text.indexOf('data-bis') !== -1 ||
                        (text.indexOf('hydration-mismatch') !== -1 && text.indexOf('bis_') !== -1)
                      ) {
                        return;
                      }
                      return fn.apply(console, args);
                    };
                  };

                  console.error = filterExtensionError(console.error);
                  console.warn = filterExtensionError(console.warn);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${newsreader.variable} ${plusJakartaSans.variable} font-sans antialiased selection:bg-[var(--accent-earth)]/20 selection:text-[var(--foreground)] bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200`}
        suppressHydrationWarning
      >
        <HydrationFix />
        <MeshBackground />
        <SmoothScroll>
          <Navbar />
          <main className="min-h-screen" suppressHydrationWarning>
            {children}
          </main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
