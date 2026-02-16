"use client";

interface Section {
  id: string;
  title: string;
}

export default function LegalSidebar({ sections }: { sections: Section[] }) {
  return (
    <nav className="sticky top-24 space-y-4 border-l border-neutral-200 pl-6">
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="block text-sm text-neutral-600 hover:text-green-700 transition-colors"
        >
          {section.title}
        </a>
      ))}
    </nav>
  );
}
