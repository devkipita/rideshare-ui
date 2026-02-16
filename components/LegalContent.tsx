interface Section {
  id: string;
  title: string;
  content: string;
}

export default function LegalContent({ sections }: { sections: Section[] }) {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <section key={section.id} id={section.id}>
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            {section.title}
          </h2>
          <div className="prose prose-neutral max-w-none text-neutral-700 leading-relaxed">
            {section.content}
          </div>
        </section>
      ))}
    </div>
  );
}
