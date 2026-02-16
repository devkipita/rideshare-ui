import { signIn } from "next-auth/react";

export type LoginRole = "passenger" | "driver";

function setLoginRole(role: LoginRole) {
  document.cookie = `login_role=${role}; path=/; max-age=300; samesite=lax`;
}

export async function signInAsPassenger(callbackUrl = "/") {
  setLoginRole("passenger");
  await signIn("google", { callbackUrl });
}

export async function signInAsDriver(callbackUrl = "/") {
  setLoginRole("driver");
  await signIn("google", { callbackUrl });
}
