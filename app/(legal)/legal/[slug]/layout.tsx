import { ReactNode } from "react";

export default function LegalSlugLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      {children}
    </div>
  );
}
