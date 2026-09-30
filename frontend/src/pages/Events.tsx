import { FormEvent, useEffect, useState } from 'react'
import { api, currentOrg } from '../api'

type EventItem = {
  id: string
  name: string
  eventType: string
  content: string
  startDate?: string
  endDate?: string
  status: string
  visibility: string
  coreValueTag?: string
  isAtlasPublished?: boolean
  createdAt: string
  updatedAt: string
}

const EVENT_TYPES = [
  { value: 'FOUNDATION', label: 'Thành lập & Khởi đầu (Foundation)' },
  { value: 'INNOVATION', label: 'Đột phá & Sáng kiến (Innovation)' },
  { value: 'TECH_MILESTONE', label: 'Cột mốc Công nghệ (Tech Milestone)' },
  { value: 'PILOT_SUCCESS', label: 'Thành công Thí điểm (Pilot Success)' },
  { value: 'PUBLIC_LAUNCH', label: 'Ra mắt Công chúng (Public Launch)' }
]

const CORE_VALUES = [
  { value: 'Trust', label: 'Trust (Niềm tin & Toàn vẹn)', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  { value: 'Learning', label: 'Learning (Học hỏi & Đổi mới)', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
  { value: 'Creativity', label: 'Creativity (Sáng tạo & Đột phá)', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  { value: 'Empathy', label: 'Empathy (Thấu cảm & Tử tế)', color: '#db2777', bg: '#fdf2f8', border: '#fbcfe8' }
]

export default function Events() {
  const [items, setItems] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [busy, setBusy] = useState<string>('')
  const [notification, setNotification] = useState<string>('')

  // Form fields
  const [name, setName] = useState('')
  const [eventType, setEventType] = useState('TECH_MILESTONE')
  const [coreValueTag, setCoreValueTag] = useState('Trust')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [visibility, setVisibility] = useState('PUBLIC')
  const [publishDirectly, setPublishDirectly] = useState(true)
  const [content, setContent] = useState('')

  const org = currentOrg()

  async function load() {
    setLoading(true)
    try {
      const res = await api<EventItem[]>(`/orgs/${org}/events`)
      setItems(res || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [org])

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !content.trim()) {
      alert('Vui lòng nhập Tên sự kiện và Nội dung.')
      return
    }
    setBusy('creating')
    try {
      await api(`/orgs/${org}/events`, {
        method: 'POST',
        body: JSON.stringify({
          name,
          eventType,
          startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
          content,
          coreValueTag,
          status: publishDirectly ? 'VERIFIED' : 'DRAFT',
          visibility: publishDirectly ? 'PUBLIC' : visibility
        })
      })
      setName('')
      setContent('')
      setShowAddModal(false)
      setNotification(publishDirectly ? 'Đã ghi nhận và xuất bản trực tiếp sự kiện lên Culture Atlas!' : 'Đã lưu sự kiện vào danh sách nội bộ.')
      setTimeout(() => setNotification(''), 4000)
      await load()
    } catch (err) {
      alert(`Lỗi tạo sự kiện: ${err}`)
    } finally {
      setBusy('')
    }
  }

  async function prepareAtlas(eventId: string) {
    setBusy(eventId)
    try {
      await api(`/orgs/${org}/content/EVENT/${eventId}/prepare-atlas`, { method: 'POST' })
      setNotification('Đã xác minh và xuất bản thành công sự kiện lên Culture Atlas!')
      setTimeout(() => setNotification(''), 4000)
      await load()
    } catch (err) {
      alert(`Lỗi chuẩn bị và xuất bản Atlas: ${err}`)
    } finally {
      setBusy('')
    }
  }

  async function handleDelete(id: string, eventName: string) {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sự kiện "${eventName}"? Hành động này cũng sẽ gỡ sự kiện khỏi Culture Atlas nếu đã xuất bản.`)) return
    setBusy(id)
    try {
      await api(`/orgs/${org}/events/${id}`, { method: 'DELETE' })
      setNotification(`Đã xóa sự kiện "${eventName}" thành công!`)
      setTimeout(() => setNotification(''), 4000)
      await load()
    } catch (err) {
      alert(`Lỗi khi xóa sự kiện: ${err}`)
    } finally {
      setBusy('')
    }
  }

  const getTypeLabel = (type: string) => {
    const f = EVENT_TYPES.find(x => x.value === type)
    return f ? f.label.split('(')[0].trim() : type
  }

  const getCvConfig = (tag?: string) => {
    return CORE_VALUES.find(x => x.value.toLowerCase() === (tag || '').toLowerCase())
  }

  return (
    <div className="hub-page-container">
      <div className="hub-header-banner">
        <div>
          <span className="hub-tag">DÒNG THỜI GIAN VĂN HÓA</span>
          <h1 className="hub-title">Culture Events — Cột mốc & Sự kiện Lịch sử</h1>
          <p className="hub-subtitle">
            Dữ liệu sống cho Culture Timeline. Khi xuất bản lên Culture Atlas, các sự kiện này sẽ hiển thị trực tiếp cho cộng đồng và nhân viên.
          </p>
        </div>
        <div className="hub-header-actions">
          <button className="btn-primary" onClick={() => setShowAddModal(!showAddModal)}>
            {showAddModal ? 'Đóng form' : 'Ghi nhận sự kiện mới'}
          </button>
        </div>
      </div>

      {notification && (
        <div className="notification-banner" style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '0.875rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 500 }}>
          <span>{notification}</span>
        </div>
      )}

      {showAddModal && (
        <form className="hub-panel form-panel" onSubmit={handleAdd}>
          <div className="panel-header">
            <h3>Ghi nhận Cột mốc / Sự kiện Mới</h3>
            <span className="muted">Hỗ trợ xuất bản trực tiếp lên Culture Atlas Timeline</span>
          </div>

          <div className="form-grid">
            <div className="form-field full-width">
              <label>Tên sự kiện / Cột mốc *</label>
              <input
                required
                placeholder="Ví dụ: Quyết định Đạo đức: Thiết lập nguyên tắc Human-in-the-loop"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Loại sự kiện</label>
              <select value={eventType} onChange={e => setEventType(e.target.value)}>
                {EVENT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Giá trị cốt lõi (DNA Tag)</label>
              <select value={coreValueTag} onChange={e => setCoreValueTag(e.target.value)}>
                {CORE_VALUES.map(cv => (
                  <option key={cv.value} value={cv.value}>
                    {cv.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Ngày diễn ra *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Phạm vi hiển thị</label>
              <select value={visibility} onChange={e => setVisibility(e.target.value)}>
                <option value="PUBLIC">Công khai (PUBLIC — Cho phép xuất hiện trên Atlas)</option>
                <option value="INTERNAL">Nội bộ (INTERNAL — Chỉ lưu hành trong Hub)</option>
              </select>
            </div>

            <div className="form-field full-width" style={{ marginTop: '0.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: '#10b981' }}>
                <input
                  type="checkbox"
                  checked={publishDirectly}
                  onChange={e => setPublishDirectly(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
                />
                Xuất bản ngay lên Culture Atlas (Đánh dấu VERIFIED & PUBLIC để đồng bộ ngay)
              </label>
            </div>

            <div className="form-field full-width">
              <label>Mô tả ý nghĩa và tác động văn hóa *</label>
              <textarea
                required
                rows={4}
                placeholder="Giải thích rõ sự kiện này đã thay đổi văn hóa, tư duy hoặc cách vận hành của doanh nghiệp như thế nào..."
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={busy === 'creating'}>
              {busy === 'creating' ? 'Đang lưu & Xuất bản…' : (publishDirectly ? 'Lưu & Xuất bản lên Atlas' : 'Lưu Sự kiện')}
            </button>
          </div>
        </form>
      )}

      <div className="hub-panel">
        <div className="panel-header">
          <h3>Các Cột mốc Văn hóa ({items.length})</h3>
          <span className="pill-live">Thời gian thực</span>
        </div>

        {loading ? (
          <div className="loading-card">Đang tải danh sách sự kiện…</div>
        ) : items.length === 0 ? (
          <div className="empty-card">
            Chưa có sự kiện nào. Bấm <b>&ldquo;Ghi nhận sự kiện mới&rdquo;</b> để xây dựng dòng thời gian văn hóa!
          </div>
        ) : (
          <div className="timeline-hub-list">
            {items.map(ev => {
              const cv = getCvConfig(ev.coreValueTag)
              return (
                <div className="event-hub-row" key={ev.id}>
                  <div className="event-date-box">
                    <span className="ev-year">
                      {ev.startDate ? new Date(ev.startDate).getFullYear() : '—'}
                    </span>
                    <span className="ev-date">
                      {ev.startDate ? new Date(ev.startDate).toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit' }) : ''}
                    </span>
                  </div>

                  <div className="event-content-box">
                    <div className="badges-group">
                      <span className="badge-type">{getTypeLabel(ev.eventType)}</span>
                      {ev.coreValueTag && (
                        <span
                          className="badge-type"
                          style={{
                            background: cv?.bg || '#ecfdf5',
                            color: cv?.color || '#065f46',
                            borderColor: cv?.border || '#a7f3d0'
                          }}
                        >
                          {ev.coreValueTag}
                        </span>
                      )}
                      <span className={`badge-status ${ev.status.toLowerCase()}`}>
                        {ev.status}
                      </span>
                      <span className={`badge-vis ${ev.visibility.toLowerCase()}`}>
                        {ev.visibility}
                      </span>
                    </div>

                    <h4 className="event-title">{ev.name}</h4>
                    <p className="event-desc">{ev.content}</p>

                    <div className="event-footer-row">
                      <span className="audit-info">
                        Cập nhật: {new Date(ev.updatedAt).toLocaleDateString('vi-VN')}
                      </span>
                      <div className="inline-actions">
                        {ev.isAtlasPublished ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span className="ready-atlas-pill">Đã xuất bản lên Atlas</span>
                            <button
                              className="btn-action-small"
                              disabled={busy === ev.id}
                              onClick={() => prepareAtlas(ev.id)}
                              title="Đồng bộ cập nhật mới nhất lên Culture Atlas"
                            >
                              {busy === ev.id ? 'Đang đồng bộ…' : 'Cập nhật Atlas'}
                            </button>
                            <a
                              href="/#timeline"
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: '0.8rem', color: '#10b981', textDecoration: 'none', fontWeight: 600 }}
                            >
                              Xem trên Atlas
                            </a>
                          </div>
                        ) : (
                          <button
                            className="btn-action-small"
                            disabled={busy === ev.id}
                            onClick={() => prepareAtlas(ev.id)}
                            title="Chuyển sang VERIFIED + PUBLIC và xuất bản ngay lên Culture Atlas"
                          >
                            {busy === ev.id ? 'Đang xử lý…' : 'Xuất bản lên Atlas'}
                          </button>
                        )}
                        <button
                          className="btn-delete-small"
                          disabled={busy === ev.id}
                          onClick={() => handleDelete(ev.id, ev.name)}
                          title="Xóa sự kiện này"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
