import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

export type AppUserRole = 'passenger' | 'driver' | 'admin'

type DemoUser = {
  id: string
  name: string
  email: string
  phone?: string
  password: string
  role: AppUserRole
}

const demoUsers: DemoUser[] = [
  {
    id: 'user-passenger',
    name: 'Demo Passenger',
    email: 'passenger@kipita.app',
    phone: '+254700000001',
    password: 'passenger',
    role: 'passenger',
  },
  {
    id: 'user-driver',
    name: 'Demo Driver',
    email: 'driver@kipita.app',
    phone: '+254700000002',
    password: 'driver',
    role: 'driver',
  },
  {
    id: 'user-admin',
    name: 'Demo Admin',
    email: 'admin@kipita.app',
    phone: '+254700000003',
    password: 'admin',
    role: 'admin',
  },
]

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Demo Credentials',
      credentials: {
        email: {
          label: 'Email or phone',
          type: 'text',
          placeholder: 'passenger@kipita.app',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const rawIdentifier = credentials?.email?.trim()
        const password = credentials?.password ?? ''

        if (!rawIdentifier || !password) return null
        const identifier = rawIdentifier.toLowerCase()
        const isEmail = rawIdentifier.includes('@')

        const match = demoUsers.find(
          (user) =>
            (user.email.toLowerCase() === identifier ||
              user.phone === rawIdentifier) &&
            user.password === password
        )

        if (match) {
          return {
            id: match.id,
            name: match.name,
            email: match.email,
            role: match.role,
          }
        }

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
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user?.role) {
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token.role) {
        session.user.role = token.role as AppUserRole
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
