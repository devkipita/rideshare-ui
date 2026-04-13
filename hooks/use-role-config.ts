import { useMemo } from "react";
import { useRole } from "@/app/context";
import { getRoleConfig, type AppRole } from "@/lib/role-config";

export function useRoleConfig() {
  const { activeRole } = useRole();
  const config = useMemo(
    () => getRoleConfig(activeRole as AppRole),
    [activeRole],
  );
  return { role: activeRole, config };
}
