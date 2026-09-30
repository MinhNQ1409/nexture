import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, currentOrg, getSession } from '../api'

type DashboardData = {
  stories: number
  events: number
  people: number
  products: number
  media: number
  publicContent: number
  atlasPublished: number
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const session = getSession()
  const org = currentOrg()

  useEffect(() => {
    api<DashboardData>(`/orgs/${org}/dashboard`)
      .then(res => {
        setData(res)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [org])

  if (loading || !data) {
    return (
      <div className="hub-page-container">
        <div className="card loading-card" role="status">{loading ? 'Đang tải dữ liệu Trung tâm Điều hành Văn hóa…' : 'Chưa thể tải dữ liệu Trung tâm Điều hành Văn hóa. Vui lòng thử lại sau.'}</div>
      </div>
    )
  }

  const statCards = [
    { title: 'Culture Stories', count: data.stories, desc: 'Câu chuyện chiều sâu', link: '/stories', color: 'emerald' },
    { title: 'Timeline Events', count: data.events, desc: 'Cột mốc lịch sử', link: '/events', color: 'teal' },
    { title: 'Đại sứ Văn hóa', count: data.people, desc: 'Nhân sự & Lãnh đạo', link: '/people-products', color: 'blue' },
    { title: 'Sản phẩm & Di sản', count: data.products, desc: 'Công trình di sản', link: '/people-products', color: 'purple' },
    { title: 'Tài liệu Thư viện', count: data.media, desc: 'Tài liệu & Media gốc', link: '/library', color: 'slate' },
    { title: 'Đã xuất bản Atlas', count: data.atlasPublished, desc: 'Công khai trên Atlas', link: '/atlas-management', color: 'green' }
  ]

  return (
    <div className="hub-page-container">
      {/* Page Header */}
      <div className="hub-header-banner">
        <div>
          <span className="hub-tag">HỆ THỐNG QUẢN TRỊ DI SẢN DOANH NGHIỆP</span>
          <h1 className="hub-title">Chào mừng trở lại, {session?.user?.displayName || 'NexTure Admin'}</h1>
          <p className="hub-subtitle">
            Hệ thống quản trị trực tiếp: <b>Khởi tạo nội dung</b> → <b>Lưu trữ & Xuất bản tức thì lên Culture Atlas</b>.
          </p>
        </div>
        <div className="hub-header-actions">
          <a href="/atlas" target="_blank" rel="noreferrer" className="btn-atlas-preview">
            <span>Mở Culture Atlas</span>
          </a>
        </div>
      </div>

      {/* Quick Action Ribbon */}
      <div className="quick-actions-bar">
        <Link to="/stories" className="quick-action-btn">
          <span>Thêm Story</span>
        </Link>
        <Link to="/events" className="quick-action-btn">
          <span>Ghi nhận Cột mốc</span>
        </Link>
        <Link to="/people-products" className="quick-action-btn">
          <span>Thêm Nhân sự & Di sản</span>
        </Link>
        <Link to="/library" className="quick-action-btn">
          <span>Nạp tài liệu gốc</span>
        </Link>
        <Link to="/atlas-management" className="quick-action-btn primary">
          <span>Quản lý Xuất bản Atlas</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="hub-kpi-grid">
        {statCards.map(c => (
          <Link to={c.link} key={c.title} className={`hub-kpi-card color-${c.color}`}>
            <div className="kpi-top">
              <span className="kpi-count">{c.count}</span>
            </div>
            <div className="kpi-title">{c.title}</div>
            <div className="kpi-desc">{c.desc}</div>
          </Link>
        ))}
      </div>

      {/* Direct Management Directory */}
      <div className="hub-dashboard-columns">
        <div className="hub-panel">
          <div className="panel-header">
            <h3>Quản lý Nội dung Văn hóa</h3>
            <span className="pill-live">CRUD Trực tiếp</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
            <Link to="/stories" style={{ textDecoration: 'none', display: 'block', padding: '14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', transition: 'all 0.15s' }}>
              <b style={{ color: '#0f172a', fontSize: '14px', display: 'block', marginBottom: '4px' }}>Culture Stories (Câu chuyện Văn hóa)</b>
              <span style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.5' }}>Viết, chỉnh sửa và đăng tải các câu chuyện chiều sâu, triết lý lãnh đạo trực tiếp lên bản đồ.</span>
            </Link>
            <Link to="/events" style={{ textDecoration: 'none', display: 'block', padding: '14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', transition: 'all 0.15s' }}>
              <b style={{ color: '#0f172a', fontSize: '14px', display: 'block', marginBottom: '4px' }}>Culture Events (Dòng Lịch sử & Cột mốc)</b>
              <span style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.5' }}>Ghi nhận các sự kiện quan trọng, mốc thành lập và phát triển lên Culture Timeline.</span>
            </Link>
          </div>
        </div>

        <div className="hub-panel">
          <div className="panel-header">
            <h3>Nhân sự, Di sản & Xuất bản</h3>
            <span className="pill-live">Thời gian thực</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
            <Link to="/people-products" style={{ textDecoration: 'none', display: 'block', padding: '14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', transition: 'all 0.15s' }}>
              <b style={{ color: '#0f172a', fontSize: '14px', display: 'block', marginBottom: '4px' }}>People & Products (Đại sứ & Sản phẩm)</b>
              <span style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.5' }}>Quản lý hồ sơ nhân vật văn hóa, đại sứ tiêu biểu và các công trình, giải pháp di sản.</span>
            </Link>
            <Link to="/atlas-management" style={{ textDecoration: 'none', display: 'block', padding: '14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', transition: 'all 0.15s' }}>
              <b style={{ color: '#0f172a', fontSize: '14px', display: 'block', marginBottom: '4px' }}>Culture Atlas (Quản lý Xuất bản Công khai)</b>
              <span style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.5' }}>Xem tổng quan toàn bộ các thực thể đã được đưa ra công chúng trên bản đồ văn hóa.</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
