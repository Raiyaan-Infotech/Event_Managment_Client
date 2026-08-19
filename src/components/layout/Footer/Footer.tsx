"use client";

import { Button } from "@/components/ui/button";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="px-6 py-6 border-t border-slate-50 bg-white/50 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="text-[12.5px] font-bold text-slate-400">
        Copyright © {year} •{" "}
        <a
          href="https://themewagon.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-extrabold"
        >
          Raiyaan Infotech Admin
        </a>{" "}
        • All rights reserved.
      </div>

      <div className="flex items-center gap-6">
        {["Help Center", "Terms of Use", "Privacy Policy"].map((link) => (
          <Button
            key={link}
            variant="link"
            className="p-0 h-auto text-[12.5px] font-bold text-slate-400 hover:text-primary transition-colors no-underline"
          >
            {link}
          </Button>
        ))}
      </div>
    </footer>
  );
}
