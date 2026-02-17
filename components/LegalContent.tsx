"use client";

interface Section {
  id: string;
  title: string;
  content: string;
}

interface LegalContentProps {
  sections: Section[];
}

export default function LegalContent({ sections }: LegalContentProps) {
  return (
    <div className="space-y-10">
      {sections.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          className="scroll-mt-24 group"
        >
          {/* Section number pill */}
          <div className="flex items-start gap-4">
            <span
              className="
                mt-0.5 flex-shrink-0
                inline-flex items-center justify-center
                w-7 h-7 rounded-full text-xs font-semibold
                bg-primary/10 text-primary
                dark:bg-primary/15 dark:text-primary
                transition-colors
              "
            >
              {index + 1}
            </span>

            <div className="flex-1 min-w-0">
              <h2
                className="
                  text-xl font-semibold leading-snug mb-3
                  text-foreground
                  group-hover:text-primary
                  transition-colors duration-200
                "
              >
                {section.title.replace(/^\d+\.\s*/, "")}
              </h2>

              {/* Render each paragraph as its own block */}
              <div className="space-y-3">
                {section.content
                  .trim()
                  .split(/\n\n+/)
                  .map((para, i) => (
                    <p
                      key={i}
                      className="
                        text-[0.9375rem] leading-relaxed
                        text-muted-foreground
                      "
                    >
                      {para.trim()}
                    </p>
                  ))}
              </div>
            </div>
          </div>

          {/* Divider — hidden on last item */}
          {index < sections.length - 1 && (
            <div className="mt-10 border-t border-border/60" />
          )}
        </section>
      ))}
    </div>
  );
}
