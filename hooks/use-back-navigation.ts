import { useRouter } from "next/navigation";
import { useCallback } from "react";

const history: string[] = [];

export function recordRoute(path: string) {
  if (!path.startsWith("/")) return;
  if (history[history.length - 1] === path) return;
  history.push(path);
}

export function getPreviousRoute(fallback = "/home") {
  if (history.length <= 1) return fallback;
  history.pop();
  return history[history.length - 1] ?? fallback;
}

export function useBackNavigation() {
  const router = useRouter();

  const goBack = useCallback(() => {
    router.push(getPreviousRoute());
  }, [router]);

  const pushRoute = useCallback(
    (path: string) => {
      recordRoute(path);
      router.push(path);
    },
    [router],
  );

  return { goBack, pushRoute };
}
