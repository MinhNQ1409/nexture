import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, currentOrg, getSession } from '../api'

type DashboardData = {
  stories: number
  events: number
  people: number
  products: number
  media: number
  pendingReview: number
  publicContent: number
  atlasPublished: number
  recentActivity?: { id: string; action: string; entityType: string; createdAt: string }[]
}

const actionLabels: Record<string, { label: string; badge: string }> = {
  STORY_CREATED: { label: 'Tạo câu chuyện văn hóa mới', badge: 'STORY' },
  STORY_UPDATED: { label: 'Cập nhật câu chuyện văn hóa', badge: 'STORY' },
  EVENT_CREATED: { label: 'Ghi nhận sự kiện / cột mốc mới', badge: 'EVENT' },
  PERSON_CREATED: { label: 'Thêm hồ sơ đại sứ văn hóa', badge: 'PERSON' },
  PRODUCT_CREATED: { label: 'Thêm sản phẩm / dự án di sản', badge: 'PRODUCT' },
  MEDIA_UPLOADED: { label: 'Tải tài liệu / hình ảnh lên Library', badge: 'MEDIA' },
  REVIEW_APPROVED: { label: 'Phê duyệt đề xuất AI thành công', badge: 'VERIFIED' },
  REVIEW_REJECTED: { label: 'Từ chối đề xuất AI', badge: 'REJECT' },
  ATLAS_PUBLISHED: { label: 'Xuất bản snapshot lên Culture Atlas', badge: 'ATLAS' },
  NEXTURE_HERITAGE_SEEDED: { label: 'Khởi tạo bộ dữ liệu di sản NexTure', badge: 'SEED' }
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
    {
      title: 'Chờ kiểm duyệt AI',
      count: data.pendingReview,
      desc: 'Cần chuyên gia duyệt',
      link: '/reviews',
      color: data.pendingReview > 0 ? 'amber' : 'gray',
      highlight: data.pendingReview > 0
    },
    { title: 'Sẵn sàng Atlas', count: data.publicContent, desc: 'VERIFIED & PUBLIC', link: '/atlas-management', color: 'cyan' },
    { title: 'Đã xuất bản Atlas', count: data.atlasPublished, desc: 'Snapshot bất biến', link: '/atlas-management', color: 'green' }
  ]

  return (
    <div className="hub-page-container">
      {/* Page Header */}
      <div className="hub-header-banner">
        <div>
          <span className="hub-tag">HỆ THỐNG QUẢN TRỊ DI SẢN DOANH NGHIỆP</span>
          <h1 className="hub-title">Chào mừng trở lại, {session?.user?.displayName || 'NexTure Admin'}</h1>
          <p className="hub-subtitle">
            Quy trình chuẩn hóa di sản: <b>Ghi nhận dữ liệu</b> → <b>AI Cấu trúc</b> → <b>Kiểm duyệt Con người</b> → <b>Culture Timeline</b> → <b>Xuất bản Culture Atlas</b>.
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
        <Link to="/library" className="quick-action-btn">
          <span>Nạp tài liệu gốc</span>
        </Link>
        <Link to="/reviews" className="quick-action-btn">
          <span>Duyệt đề xuất AI {data.pendingReview > 0 ? `(${data.pendingReview})` : ''}</span>
        </Link>
        <Link to="/atlas-management" className="quick-action-btn primary">
          <span>Quản lý Xuất bản Atlas</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="hub-kpi-grid">
        {statCards.map(c => (
          <Link to={c.link} key={c.title} className={`hub-kpi-card color-${c.color} ${c.highlight ? 'has-badge' : ''}`}>
            <div className="kpi-top">
              <span className="kpi-count">{c.count}</span>
            </div>
            <div className="kpi-title">{c.title}</div>
            <div className="kpi-desc">{c.desc}</div>
          </Link>
        ))}
      </div>

      {/* Two Column Section: Pipeline Overview & Recent Activities */}
      <div className="hub-dashboard-columns">
        {/* Pipeline Guide */}
        <div className="hub-panel">
          <div className="panel-header">
            <h3>Luồng Vận hành Văn hóa NexTure</h3>
            <span className="pill-secure">Bảo toàn vĩnh cửu</span>
          </div>
          <div className="pipeline-steps">
            <div className="pipeline-step">
              <div className="step-num">1</div>
              <div className="step-body">
                <b>Culture Library (Thu thập di sản)</b>
                <p>Nạp phỏng vấn, tài liệu ghi âm, biên bản thành lập và hình ảnh thực tế vào kho dữ liệu gốc.</p>
              </div>
            </div>
            <div className="pipeline-step">
              <div className="step-num">2</div>
              <div className="step-body">
                <b>AI Structuring Engine (Đề xuất ngữ nghĩa)</b>
                <p>AI phân tích dữ liệu phi cấu trúc, bóc tách câu chuyện, sự kiện, triết lý lãnh đạo.</p>
              </div>
            </div>
            <div className="pipeline-step">
              <div className="step-num">3</div>
              <div className="step-body">
                <b>Pending Review (Kiểm duyệt chuyên gia)</b>
                <p>Tuyệt đối không để AI tự quyết định. Chuyên gia văn hóa kiểm chứng tính xác thực (VERIFIED).</p>
              </div>
            </div>
            <div className="pipeline-step">
              <div className="step-num">4</div>
              <div className="step-body">
                <b>Culture Atlas Snapshot (Bản chụp công khai)</b>
                <p>Tạo bản chụp độc lập bất biến (PUBLISHED). An toàn tuyệt đối trước mọi sửa đổi nháp nội bộ.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="hub-panel">
          <div className="panel-header">
            <h3>Nhật ký Hoạt động gần đây</h3>
            <span className="pill-live">Real-time</span>
          </div>
          <div className="activity-feed">
            {(!data.recentActivity || data.recentActivity.length === 0) ? (
              <p className="empty-text">Chưa có nhật ký hoạt động nào.</p>
            ) : (
              data.recentActivity.map(act => {
                const info = actionLabels[act.action] || { label: act.action, badge: act.entityType || 'INFO' }
                return (
                  <div className="activity-item" key={act.id}>
                    <div className="activity-dot" />
                    <div className="activity-content">
                      <div className="activity-title-row">
                        <span className="activity-label">{info.label}</span>
                        <span className="activity-badge">{info.badge}</span>
                      </div>
                      <span className="activity-time">
                        {new Date(act.createdAt).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
