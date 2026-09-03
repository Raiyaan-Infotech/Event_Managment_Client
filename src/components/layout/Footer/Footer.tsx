"use client";

import { Button } from "@/components/ui/button";
import { WEBSITE_URL } from "@/lib/site";

/**
 * The template shipped this crediting "Raiyaan Infotech Admin" and linking to
 * themewagon.com — so the one word a CLIENT saw at the bottom of their own
 * portal was "Admin", pointing at the theme vendor. Both are wrong here: this
 * is not the admin panel, and the link should go to the tenant's website.
 *
 * The three footer links were `<Button>`s with no handler and no href, which
 * look clickable and do nothing. They point at the website's real pages now.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  // No website configured means no real destination. The labels stay — the
  // footer should not visibly change shape because of a missing setting — but
  // they render as plain text rather than as links that go nowhere.
  const links = WEBSITE_URL
    ? [
        { label: "Help Center", href: `${WEBSITE_URL}/contact` },
        { label: "Terms of Use", href: `${WEBSITE_URL}/terms-and-conditions` },
        { label: "Privacy Policy", href: `${WEBSITE_URL}/privacy-policy` },
      ]
    : [];

  return (
    <footer className="px-6 py-6 border-t border-slate-50 bg-white/50 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="text-[12.5px] font-bold text-slate-400">
        Copyright © {year} •{" "}
        {WEBSITE_URL ? (
          <a
            href={WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block py-2 -my-2 text-primary hover:underline font-extrabold"
          >
            Event Invite
          </a>
        ) : (
          <span className="text-primary font-extrabold">Event Invite</span>
        )}{" "}
        • All rights reserved.
      </div>

      <div className="flex items-center gap-6 empty:hidden">
        {links.map((link) => (
          <Button
            key={link.label}
            asChild
            variant="link"
            // px-0 keeps the horizontal gap exactly what `gap-6` already sets;
            // py-2.5 / -my-2.5 cancel out visually and only grow the vertical
            // tap target. Safe here — the footer has plenty of surrounding
            // whitespace, unlike a dense table row.
            className="h-auto px-0 py-2.5 -my-2.5 text-[12.5px] font-bold text-slate-400 hover:text-primary transition-colors no-underline"
          >
            <a href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          </Button>
        ))}
      </div>
    </footer>
  );
}
