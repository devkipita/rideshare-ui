"use client";

import LegalContent from "./LegalContent";

interface Section {
  id: string;
  title: string;
  content: string;
}

interface Policy {
  title: string;
  description: string;
  lastUpdated: string;
  sections: Section[];
}

export default function LegalLayout({ policy }: { policy: Policy }) {
  return (
    <div>
      <div className="pb-4">
        {/* Page header */}
        <header className="mb-8">
          <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-primary mb-2">
            Legal
          </p>
          <h1 className="text-2xl font-semibold text-foreground leading-snug">
            {policy.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {policy.description}
          </p>
          <p className="mt-2 text-xs text-muted-foreground/50">
            Last updated: {policy.lastUpdated}
          </p>
        </header>

        {/* TOC accordion */}
        <details className="group mb-6 rounded-xl border border-border bg-card px-4 py-3">
          <summary className="flex items-center justify-between cursor-pointer select-none text-sm font-medium text-foreground list-none">
            <span>Jump to section</span>
            <svg
              className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </summary>
          <nav className="mt-3 space-y-0.5 border-t border-border pt-3">
            {policy.sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block text-sm py-1.5 text-muted-foreground hover:text-primary transition-colors"
              >
                {section.title.replace(/^\d+\.\s*/, "")}
              </a>
            ))}
          </nav>
        </details>

        {/* Content card */}
        <div className="rounded-2xl border border-border bg-card px-5 py-7 shadow-sm">
          <LegalContent sections={policy.sections} />
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-muted-foreground/40 text-center">
          © {new Date().getFullYear()} Kipita · Kenya
        </p>
      </div>
    </div>
  );
}
