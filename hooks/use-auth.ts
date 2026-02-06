'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { hasRole, hasAnyRole, getUserRole, UserRole } from '@/lib/rbac'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    user: session?.user,
    role: getUserRole(session),
  }
}

/**
 * Hook to protect routes based on role
 */
export function useProtectedRoute(requiredRoles?: UserRole[]) {
  const { session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (requiredRoles && requiredRoles.length > 0) {
      if (!hasAnyRole(session, requiredRoles)) {
        router.push('/unauthorized')
      }
    }
  }, [status, session, requiredRoles, router])

  return { session, status }
}

/**
 * Hook to check if user has required role
 */
export function useHasRole(requiredRole: UserRole): boolean {
  const { session } = useSession()
  return hasRole(session, requiredRole)
}

/**
 * Hook to check if user has any of the required roles
 */
export function useHasAnyRole(requiredRoles: UserRole[]): boolean {
  const { session } = useSession()
  return hasAnyRole(session, requiredRoles)
}
