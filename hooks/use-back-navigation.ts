import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

const history: string[] = [];
const HISTORY_LIMIT = 32;
const SPLASH_ROUTE = "/";

function normalizeRoute(path: string) {
  if (path === "/splash") return SPLASH_ROUTE;
  return path;
}

function getFallbackRoute(path: string) {
  const normalizedPath = normalizeRoute(path);
  if (normalizedPath === "/home") return SPLASH_ROUTE;
  return "/home";
}

export function recordRoute(path: string) {
  if (!path.startsWith("/")) return;

  const normalizedPath = normalizeRoute(path);

  if (history[history.length - 1] === normalizedPath) return;
  history.push(normalizedPath);

  if (history.length > HISTORY_LIMIT) {
    history.splice(0, history.length - HISTORY_LIMIT);
  }
}

export function getPreviousRoute(currentPath: string) {
  const fallback = getFallbackRoute(currentPath);

  if (history.length <= 1) return fallback;
  history.pop();
  return history[history.length - 1] ?? fallback;
}

export function useBackNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const goBack = useCallback(() => {
    router.push(getPreviousRoute(pathname));
  }, [pathname, router]);

  const pushRoute = useCallback(
    (path: string) => {
      recordRoute(path);
      router.push(path);
    },
    [router],
  );

  return { goBack, pushRoute };
}
