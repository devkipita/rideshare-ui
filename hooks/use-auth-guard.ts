import { useCallback } from "react";
import { useAuthDrawer } from "@/components/auth-drawer-provider";

export function useAuthGuard() {
  const { isSignedIn, openAuthDrawer } = useAuthDrawer();

  const guard = useCallback(
    (action: () => void, role?: "passenger" | "driver") => {
      if (!isSignedIn) {
        openAuthDrawer({ selectedRole: role });
        return;
      }
      action();
    },
    [isSignedIn, openAuthDrawer],
  );

  return { isSignedIn, guard };
}
