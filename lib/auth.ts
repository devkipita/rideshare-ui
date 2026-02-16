import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";

const getRequestedLoginRole = async (): Promise<"passenger" | "driver"> => {
  try {
    const cookieStore = await cookies();
    const requestedRole = cookieStore.get("login_role")?.value;
    return requestedRole === "driver" ? "driver" : "passenger";
  } catch {
    return "passenger";
  }
};

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email || "").trim().toLowerCase();
        const password = credentials?.password || "";

        if (!email || !password) return null;

        const { data: user, error } = await supabaseAdmin
          .from("users")
          .select("id,email,name,role,provider,password_hash,image")
          .eq("email", email)
          .maybeSingle();

        if (error || !user || !user.password_hash) return null;

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          provider: user.provider ?? "credentials",
          image: user.image ?? null,
        } as any;
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account) return true;

      if (account.provider === "google") {
        const email = (user.email || "").toLowerCase();
        if (!email) return false;
        const requestedRole = await getRequestedLoginRole();

        const image = (user as any).image || (profile as any)?.picture || null;

        const name = user.name ?? null;

        await supabaseAdmin.from("users").upsert(
          {
            email,
            name,
            image,
            provider: "google",
            role: requestedRole,
          },
          { onConflict: "email" },
        );

        const { data } = await supabaseAdmin
          .from("users")
          .select("id,role,image,provider")
          .eq("email", email)
          .maybeSingle();

        if (data?.id) (user as any).id = data.id;
        if (data?.role) (user as any).role = data.role;
        (user as any).provider = data?.provider ?? "google";
        (user as any).image = data?.image ?? image;
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.uid = (user as any).id ?? token.uid;
        token.role = (user as any).role ?? token.role;
        token.provider = (user as any).provider ?? token.provider;
        token.picture = (user as any).image ?? token.picture ?? null;
      }

      if (account?.provider) token.provider = account.provider;

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.uid as string | undefined;
      session.user.role = token.role as any;
      session.user.provider =
        (token.provider as string | undefined) ?? session.user.provider;
      session.user.image =
        (token.picture as string | null) ?? session.user.image ?? null;
      return session;
    },
  },

  pages: {
    signIn: "/signin",
  },
};
