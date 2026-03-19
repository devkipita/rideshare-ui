import LegalLayout from "@/components/LegalLayout";
import { notFound } from "next/navigation";
import { terms } from "@/data/terms";
import { privacy } from "@/data/privacy";
import { cookies } from "@/data/cookies";

type PolicySlug = "terms" | "privacy" | "cookies";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const policies: Record<PolicySlug, any> = {
  terms,
  privacy,
  cookies,
};

interface PageProps {
  params: Promise<{
    slug: PolicySlug;
  }>;
}

export default async function LegalPage({ params }: PageProps) {
  const { slug } = await params;
  const policy = policies[slug];

  if (!policy) {
    notFound();
  }

  return <LegalLayout policy={policy} />;
}
