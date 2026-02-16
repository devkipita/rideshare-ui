import type { DefaultSession } from "next-auth";

type AppUserRole = "passenger" | "driver" | "admin";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: AppUserRole;
      provider?: string;
      image?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: AppUserRole;
    provider?: string;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AppUserRole;
    uid?: string;
    provider?: string;
    picture?: string | null;
  }
}
