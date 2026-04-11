import { useRouter } from "next/navigation";
import { useCallback } from "react";

const history: string[] = [];

export function useBackNavigation() {
  const router = useRouter();

  const goBack = useCallback(() => {
    if (history.length > 1) {
      history.pop();
      const prev = history[history.length - 1];
      if (prev) {
        router.push(prev);
        return;
      }
    }
    router.push("/home");
  }, [router]);

  const pushRoute = useCallback(
    (path: string) => {
      history.push(path);
      router.push(path);
    },
    [router],
  );

  return { goBack, pushRoute };
}
