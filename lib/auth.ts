import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

export type AppUserRole = 'passenger' | 'driver' | 'admin'

type SupabaseUserRow = {
  id: string | number
  role: AppUserRole | null
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

const normalizeEmail = (value?: string | null) =>
  typeof value === 'string' ? value.trim().toLowerCase() : ''

const defaultRole: AppUserRole = 'passenger'

const fetchUserByEmail = async (
  email: string
): Promise<SupabaseUserRow | null> => {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('users')
    .select('id, role')
    .eq('email', email)
    .maybeSingle()

  if (error || !data) return null
  return {
    id: data.id,
    role: (data.role as AppUserRole) ?? defaultRole,
  }
}

const upsertOAuthUser = async ({
  email,
  name,
  provider,
}: {
  email: string
  name?: string | null
  provider: 'google'
}): Promise<SupabaseUserRow | null> => {
  if (!supabase) return null

  const existing = await fetchUserByEmail(email)
  if (existing) {
    await supabase
      .from('users')
      .update({
        name: name ?? null,
        provider,
      })
      .eq('id', existing.id)
    return existing
  }

  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        email,
        name: name ?? null,
        provider,
        role: defaultRole,
      },
    ])
    .select('id, role')
    .single()

  if (error || !data) return null
  return {
    id: data.id,
    role: (data.role as AppUserRole) ?? defaultRole,
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email or phone',
          type: 'text',
          placeholder: 'you@example.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const rawIdentifier = credentials?.email?.trim()
        const password = credentials?.password ?? ''

        if (!rawIdentifier || !password) return null
        const identifier = rawIdentifier.toLowerCase()
        const isEmail = rawIdentifier.includes('@')

        if (!supabase) return null

        const { data: dbUser, error } = await supabase
          .from('users')
          .select('id, name, email, phone, password_hash, role')
          .eq(isEmail ? 'email' : 'phone', isEmail ? identifier : rawIdentifier)
          .maybeSingle()

        if (error || !dbUser?.password_hash) return null

        const isValid = await bcrypt.compare(password, dbUser.password_hash)
        if (!isValid) return null

        return {
          id: String(dbUser.id),
          name: dbUser.name ?? dbUser.email ?? dbUser.phone ?? 'User',
          email: dbUser.email ?? undefined,
          role: (dbUser.role as AppUserRole) ?? 'passenger',
        }
      },
    }),
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider !== 'google') return true
      if (!supabase) return false

      const email = normalizeEmail(
        (profile as { email?: string | null })?.email ?? user?.email ?? null
      )
      if (!email) return false

      const name =
        (profile as { name?: string | null })?.name ??
        user?.name ??
        null

      const result = await upsertOAuthUser({
        email,
        name,
        provider: 'google',
      })

      return Boolean(result)
    },
    async jwt({ token, user, account, profile }) {
      if (user?.role) {
        token.role = user.role
      }
      if (user?.id) {
        token.uid = String(user.id)
      }

      if (account?.provider === 'google') {
        const email = normalizeEmail(
          (profile as { email?: string | null })?.email ?? token.email ?? null
        )

        if (email) {
          const dbUser = await fetchUserByEmail(email)
          if (dbUser) {
            token.role = dbUser.role ?? defaultRole
            token.uid = String(dbUser.id)
          }
        }
      }

      return token
    },
    session({ session, token }) {
      if (session.user && token.role) {
        session.user.role = token.role as AppUserRole
      }
      if (session.user && token.uid) {
        session.user.id = token.uid as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
