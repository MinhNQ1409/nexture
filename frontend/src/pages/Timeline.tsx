import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, currentOrg } from '../api'

type TimelineEvent = {
  id: string
  name: string
  eventType: string
  content: string
  startDate?: string
  endDate?: string
  visibility: string
}

export default function Timeline() {
  const [items, setItems] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const org = currentOrg()

  useEffect(() => {
    setLoading(true)
    api<TimelineEvent[]>(`/orgs/${org}/timeline`)
      .then(res => {
        setItems(res || [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [org])

  return (
    <div className="hub-page-container">
      <div className="hub-header-banner">
        <div>
          <span className="hub-tag">DÒNG LỊCH SỬ NỘI BỘ</span>
          <h1 className="hub-title">Culture Timeline — Dòng Thời gian Văn hóa</h1>
          <p className="hub-subtitle">
            Dòng thời gian hiển thị độc quyền các sự kiện và cột mốc đã đạt tiêu chuẩn <b>VERIFIED</b>. Đây là xương sống lịch sử của NexTure.
          </p>
        </div>
        <div className="hub-header-actions">
          <Link to="/events" className="btn-secondary">
            Quản lý Sự kiện →
          </Link>
        </div>
      </div>

      <div className="hub-panel">
        <div className="panel-header">
          <h3>Các Cột mốc Lịch sử ({items.length})</h3>
          <span className="pill-live">Đã xác minh (VERIFIED)</span>
        </div>

        {loading ? (
          <div className="loading-card">Đang dựng dòng thời gian…</div>
        ) : items.length === 0 ? (
          <div className="empty-card">
            Chưa có sự kiện nào đạt trạng thái VERIFIED. Hãy vào mục <Link to="/events">Culture Events</Link> hoặc <Link to="/reviews">Pending Review</Link> để xác thực các sự kiện đầu tiên!
          </div>
        ) : (
          <div className="hub-timeline-vertical">
            {items.map(ev => (
              <div className="hub-timeline-item" key={ev.id}>
                <div className="hub-timeline-node" />
                <div className="hub-timeline-card">
                  <div className="hub-timeline-card-header">
                    <div className="badges-group">
                      <span className="badge-type">{ev.eventType}</span>
                      <span className={`badge-vis ${ev.visibility.toLowerCase()}`}>
                        {ev.visibility === 'PUBLIC' ? '🌐 PUBLIC' : '🔒 INTERNAL'}
                      </span>
                    </div>
                    <time className="timeline-date-label">
                      {ev.startDate
                        ? new Date(ev.startDate).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Không rõ thời điểm'}
                    </time>
                  </div>
                  <h3 className="hub-timeline-title">{ev.name}</h3>
                  <p className="hub-timeline-content">{ev.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
