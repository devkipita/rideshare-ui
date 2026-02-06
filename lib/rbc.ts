'use client'

import { Session } from 'next-auth'

export type UserRole = 'passenger' | 'driver' | 'admin'

/**
 * Check if user has required role
 */
export function hasRole(session: Session | null, requiredRole: UserRole): boolean {
  if (!session?.user) return false
  return session.user.role === requiredRole
}

/**
 * Check if user has any of the required roles
 */
export function hasAnyRole(session: Session | null, requiredRoles: UserRole[]): boolean {
  if (!session?.user) return false
  return requiredRoles.includes(session.user.role as UserRole)
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(session: Session | null): boolean {
  return !!session?.user
}

/**
 * Get user role with type safety
 */
export function getUserRole(session: Session | null): UserRole | null {
  if (!session?.user) return null
  return (session.user.role as UserRole) || null
}

/**
 * Check if user is admin
 */
export function isAdmin(session: Session | null): boolean {
  return hasRole(session, 'admin')
}

/**
 * Check if user is driver
 */
export function isDriver(session: Session | null): boolean {
  return hasRole(session, 'driver')
}

/**
 * Check if user is passenger
 */
export function isPassenger(session: Session | null): boolean {
  return hasRole(session, 'passenger')
}
