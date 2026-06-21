import type { Database } from './supabase/types'

type UserRole = Database['public']['Enums']['user_role']

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  funding_manager: 'Funding Manager',
  virtual_assistant: 'Virtual Assistant',
  referral_partner: 'Referral Partner',
  client: 'Client',
}

export function canViewRevenue(role: UserRole) {
  return role === 'admin' || role === 'funding_manager'
}

export function canViewPartners(role: UserRole) {
  return role === 'admin' || role === 'funding_manager'
}

export function canCreateFile(role: UserRole) {
  return role === 'admin' || role === 'funding_manager'
}

export function canDeleteFile(role: UserRole) {
  return role === 'admin'
}

export function isPartner(role: UserRole) {
  return role === 'referral_partner'
}

export function isInternal(role: UserRole) {
  return ['admin', 'funding_manager', 'virtual_assistant'].includes(role)
}

export function navItemsForRole(role: UserRole) {
  const all = [
    { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Pipeline', href: '/pipeline', icon: 'Columns2' },
    { label: 'Files', href: '/files', icon: 'FolderOpen' },
    { label: 'Applications', href: '/applications', icon: 'FileText' },
    { label: 'Documents', href: '/documents', icon: 'Files' },
    { label: 'Tasks', href: '/tasks', icon: 'CheckSquare' },
    ...(canViewPartners(role) ? [{ label: 'Partners', href: '/partners', icon: 'Users' }] : []),
    ...(canViewRevenue(role) ? [{ label: 'Revenue', href: '/revenue', icon: 'DollarSign' }] : []),
    { label: 'AI Updates', href: '/ai', icon: 'Sparkles' },
    { label: 'Settings', href: '/settings', icon: 'Settings' },
  ]
  return all
}
