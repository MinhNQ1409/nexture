const envBase = (import.meta.env.VITE_API_BASE as string | undefined)?.trim()

function resolveApiBase(): string {
  if (!envBase) {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return '/api'
    }
    return 'http://localhost:8080/api'
  }
  let base = envBase.endsWith('/') ? envBase.slice(0, -1) : envBase
  if (!base.endsWith('/api')) {
    base = `${base}/api`
  }
  return base
}

const API_BASE = resolveApiBase()

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
  
  let normalizedPath = path.startsWith('/') ? path : `/${path}`
  if (normalizedPath.startsWith('/api/')) {
    normalizedPath = normalizedPath.slice(4)
  }

  try {
    const res = await fetch(`${API_BASE}${normalizedPath}`, { ...options, headers })
    if (!res.ok) {
      const text = await res.text()
      if (res.status === 404) {
        if (!envBase && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
          throw new Error('Chưa cấu hình biến môi trường VITE_API_BASE trên Vercel trỏ tới Backend Render.')
        }
        throw new Error('Đường dẫn API không tồn tại (HTTP 404). Vui lòng kiểm tra lại địa chỉ VITE_API_BASE trên Vercel.')
      }
      if (res.status === 401) {
        throw new Error('Email hoặc mật khẩu không chính xác.')
      }
      throw new Error(text || `Lỗi máy chủ (HTTP ${res.status})`)
    }
    if (res.status === 204) return undefined as T
    const text = await res.text()
    return (text ? JSON.parse(text) : undefined) as T
  } catch (err: any) {
    if (err.name === 'TypeError' && String(err.message).toLowerCase().includes('fetch')) {
      throw new Error('Không thể kết nối tới máy chủ Backend (Render). Có thể máy chủ đang khởi động hoặc URL VITE_API_BASE chưa chính xác.')
    }
    throw err
  }
}
