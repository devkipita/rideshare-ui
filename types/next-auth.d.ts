import type { DefaultSession } from 'next-auth'

type AppUserRole = 'passenger' | 'driver' | 'admin'

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string
      role?: AppUserRole
    } & DefaultSession['user']
  }

  interface User {
    id?: string
    role?: AppUserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: AppUserRole
    uid?: string
  }
}
