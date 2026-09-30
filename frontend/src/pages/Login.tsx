import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, saveSession, Session } from '../api'

export default function Login() {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('ChangeMe123!')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const session = await api<Session>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })
      saveSession(session)
      nav('/hub')
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <svg viewBox="0 0 100 100" fill="none" width="40" height="40">
            <rect width="100" height="100" rx="22" fill="#10b981" />
            <path d="M28 72V28L52 56V28H72V72L48 44V72H28Z" fill="#ffffff" />
          </svg>
          <div>
            <span style={{ display: 'block', fontSize: '18px', fontWeight: 800, color: '#0f241c' }}>
              NexTure
            </span>
            <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700, letterSpacing: '0.05em' }}>
              DIGITAL CULTURE HUB
            </span>
          </div>
        </div>

        <h1>Đăng nhập Quản trị</h1>
        <p className="muted">Hệ thống Số hóa & Quản trị Di sản Doanh nghiệp</p>

        <label>
          Email công vụ
          <input
            required
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </label>

        <label>
          Mật khẩu
          <input
            required
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </label>

        {error && <div className="hub-error-box" style={{ marginBottom: '14px' }}>✕ {error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Đang xác thực…' : 'Đăng nhập vào Culture Hub →'}
        </button>

        <div style={{ marginTop: '20px', textAlign: 'center', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
          <Link to="/atlas" style={{ fontSize: '13px', color: '#059669', fontWeight: 600, textDecoration: 'none' }}>
            Xem NexTure Culture Atlas công khai ↗
          </Link>
        </div>
      </form>
    </div>
  )
}
