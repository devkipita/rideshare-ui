import { ReactNode } from "react";

export default function LegalSlugLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-y-auto bg-background">
      {children}
    </div>
  );
}