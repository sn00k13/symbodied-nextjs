import Link from "next/link";
import { Logo } from "./logo";
import { footerCols } from "@/lib/data";
import { SubscribeForm } from "./subscribe-form";

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="max-w-[var(--container-max)] mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.6fr_repeat(3,1fr)]">
          <div>
            <Logo inverse height={32} />
            <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-[280px] font-sans">
              A living symbol of tradition, heritage and collective identity — empowering communities through commerce, culture, and solidarity.
            </p>
            {/* Newsletter */}
            <SubscribeForm />
          </div>

          {footerCols.map((col) => (
            <div key={col.heading}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.06em] text-white/50 font-sans mb-4">
                {col.heading}
              </h4>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-white/70 hover:text-white transition-colors duration-200 font-sans"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50 font-sans">
          <span>© 2026 Symbodied LLC. All rights reserved.</span>
          <div className="flex gap-5">
            {["Privacy Policy", "Security", "Terms"].map((l) => (
              <Link key={l} href="#" className="hover:text-white/80 transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
