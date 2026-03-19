"use client";

import { useRole } from "@/app/context";
import { ProfileScreen } from "@/components/profile-screen";

export default function ProfilePage() {
  const { activeRole } = useRole();
  return <ProfileScreen userMode={activeRole} />;
}
