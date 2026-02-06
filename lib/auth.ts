import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export type AppUserRole = 'passenger' | 'driver' | 'admin'

type DemoUser = {
  id: string
  name: string
  email: string
  password: string
  role: AppUserRole
}

const demoUsers: DemoUser[] = [
  {
    id: 'user-passenger',
    name: 'Demo Passenger',
    email: 'passenger@kipita.app',
    password: 'passenger',
    role: 'passenger',
  },
  {
    id: 'user-driver',
    name: 'Demo Driver',
    email: 'driver@kipita.app',
    password: 'driver',
    role: 'driver',
  },
  {
    id: 'user-admin',
    name: 'Demo Admin',
    email: 'admin@kipita.app',
    password: 'admin',
    role: 'admin',
  },
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Demo Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'passenger@kipita.app' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim()
        const password = credentials?.password ?? ''

        if (!email || !password) return null

        const match = demoUsers.find(
          (user) =>
            user.email.toLowerCase() === email && user.password === password
        )

        if (!match) return null

        return {
          id: match.id,
          name: match.name,
          email: match.email,
          role: match.role,
        }
      },
    }),
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
