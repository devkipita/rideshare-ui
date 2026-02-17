"use client";

import LegalContent from "./LegalContent";
import LegalSidebar from "./LegalSidebar";
import { TopNav } from "./top-nav";



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
    <div className="max-w-7xl mx-auto px-2 py-4 sm:py-8">
      <TopNav variant="default" title={policy.title} />

      <div className="mt-8 sm:mt-10 grid grid-cols-1 gap-10 sm:gap-12">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <LegalSidebar sections={policy.sections} />
        </aside>

        {/* Content */}
        <main className="lg:col-span-3">
          <div className="mb-10">
            <h1 className="text-4xl font-semibold text-neutral-900">
              {policy.title}
            </h1>
            <p className="mt-3 text-neutral-600">{policy.description}</p>
            <p className="mt-2 text-sm text-neutral-500">
              Last updated: {policy.lastUpdated}
            </p>
          </div>

          <LegalContent sections={policy.sections} />
        </main>
      </div>
    </div>
  );
}
