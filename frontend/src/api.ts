const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080/api'

export type Session = {
  token: string
  user: { id: string; email: string; displayName: string }
  memberships: { organizationId: string; role: string }[]
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('nexture_session')
  return raw ? JSON.parse(raw) : null
}

export function saveSession(s: Session) {
  localStorage.setItem('nexture_session', JSON.stringify(s))
  if (s.memberships[0]) localStorage.setItem('nexture_org', s.memberships[0].organizationId)
}

export function currentOrg() {
  return localStorage.getItem('nexture_org') ?? ''
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = getSession()
  const headers = new Headers(options.headers)
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (session?.token) headers.set('Authorization', `Bearer ${session.token}`)
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`)
  if (res.status === 204) return undefined as T
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}
