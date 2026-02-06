import type { DefaultSession } from 'next-auth'

type AppUserRole = 'passenger' | 'driver' | 'admin'

declare module 'next-auth' {
  interface Session {
    user: {
      role?: AppUserRole
    } & DefaultSession['user']
  }

  interface User {
    role?: AppUserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: AppUserRole
  }
}
