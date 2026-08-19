import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/lib/query-provider";
import { ThemeTokens } from "@/components/theme-tokens";

/**
 * The font is NOT loaded through next/font here.
 *
 * Inter is self-hosted from /public/fonts/InterVariable.woff2 and declared with
 * an @font-face in globals.css — the same file and the same declaration the
 * Website Builder uses. next/font would fetch a different Inter build from
 * Google and subset it differently, so the two portals would not match.
 */
export const metadata: Metadata = {
  title: "Event Invite || Client Portal",
  description: "Manage your events, guests and RSVPs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {/* Pulls colours + font from the backend onto :root. */}
            <ThemeTokens />
            {children}
            <Toaster position="top-right" offset="80px" richColors />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
