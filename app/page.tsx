import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SplashScreen } from "@/components/KipitaSplash";

export default async function LandingPage() {
  const session = await (async () => {
    try {
      return await getServerSession(authOptions);
    } catch {
      return null;
    }
  })();

  if (session) redirect("/home");

  return <SplashScreen />;
}