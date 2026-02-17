"use client";

import { useEffect, useState } from "react";

interface Section {
  id: string;
  title: string;
}

interface LegalSidebarProps {
  sections: Section[];
}

export default function LegalSidebar({ sections }: LegalSidebarProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    const headings = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];

    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost intersecting entry
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          // Pick the one closest to the top of the viewport
          const top = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
          );
          setActiveId(top.target.id);
        }
      },
      {
        rootMargin: "-10% 0px -70% 0px",
        threshold: 0,
      },
    );

    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  };

  return (
    <nav aria-label="Page sections" className="sticky top-24 space-y-0.5">
      {/* Heading */}
      <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-widest text-muted-foreground/60 pl-3">
        Contents
      </p>

      {/* Border-left track */}
      <div className="relative border-l border-border">
        {sections.map((section) => {
          const isActive = activeId === section.id;
          // Strip leading "N. " from title for a cleaner sidebar
          const label = section.title.replace(/^\d+\.\s*/, "");

          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(e) => handleClick(e, section.id)}
              className={`
                relative block pl-4 pr-2 py-1.5
                text-sm leading-snug
                transition-all duration-150
                ${
                  isActive
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span
                  className="
                    absolute left-[-1px] top-0 bottom-0
                    w-[2px] rounded-full bg-primary
                  "
                />
              )}
              {label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
