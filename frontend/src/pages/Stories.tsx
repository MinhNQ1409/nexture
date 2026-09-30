import { FormEvent, useEffect, useState } from 'react'
import { api, currentOrg } from '../api'

type StoryItem = {
  id: string
  title: string
  storyType: string
  summary?: string
  content: string
  occurredAt?: string
  status: string
  visibility: string
  coreValueTag?: string
  isAtlasPublished?: boolean
  createdAt: string
  updatedAt: string
}

const STORY_TYPES = [
  { value: 'FOUNDER_STORY', label: 'Câu chuyện Sáng lập (Founder Story)' },
  { value: 'CULTURE_STORY', label: 'Câu chuyện Văn hóa (Culture Story)' },
  { value: 'PEOPLE_STORY', label: 'Câu chuyện Con người (People Story)' },
  { value: 'TURNING_POINT', label: 'Bước ngoặt / Khủng hoảng (Turning Point)' }
]

const CORE_VALUES = [
  { value: 'Trust', label: 'Trust (Niềm tin & Toàn vẹn)', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  { value: 'Learning', label: 'Learning (Học hỏi & Đổi mới)', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
  { value: 'Creativity', label: 'Creativity (Sáng tạo & Đột phá)', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  { value: 'Empathy', label: 'Empathy (Thấu cảm & Tử tế)', color: '#db2777', bg: '#fdf2f8', border: '#fbcfe8' }
]

export default function Stories() {
  const [items, setItems] = useState<StoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [busy, setBusy] = useState<string>('')
  const [notification, setNotification] = useState<string>('')

  // Form fields
  const [title, setTitle] = useState('')
  const [storyType, setStoryType] = useState('CULTURE_STORY')
  const [coreValueTag, setCoreValueTag] = useState('Trust')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString().slice(0, 10))

  const org = currentOrg()

  async function load() {
    setLoading(true)
    try {
      const res = await api<StoryItem[]>(`/orgs/${org}/stories`)
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

  function resetForm() {
    setTitle('')
    setSummary('')
    setContent('')
    setEditingId(null)
    setStoryType('CULTURE_STORY')
    setCoreValueTag('Trust')
    setOccurredAt(new Date().toISOString().slice(0, 10))
    setShowAddModal(false)
  }

  function startEdit(s: StoryItem) {
    setEditingId(s.id)
    setTitle(s.title)
    setStoryType(s.storyType || 'CULTURE_STORY')
    setCoreValueTag(s.coreValueTag || 'Trust')
    setSummary(s.summary || '')
    setContent(s.content || '')
    setOccurredAt(s.occurredAt ? s.occurredAt.slice(0, 10) : new Date().toISOString().slice(0, 10))
    setShowAddModal(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      alert('Vui lòng nhập Tiêu đề và Nội dung câu chuyện.')
      return
    }
    setBusy('saving')
    try {
      const payload = {
        title,
        storyType,
        summary,
        content,
        coreValueTag,
        occurredAt: occurredAt ? new Date(occurredAt).toISOString() : null,
        status: 'VERIFIED',
        visibility: 'PUBLIC'
      }

      if (editingId) {
        await api(`/orgs/${org}/stories/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        })
        setNotification(`Đã cập nhật câu chuyện "${title}" và đồng bộ lên Culture Atlas!`)
      } else {
        await api(`/orgs/${org}/stories`, {
          method: 'POST',
          body: JSON.stringify(payload)
        })
        setNotification(`Đã tạo và đăng câu chuyện "${title}" lên Culture Atlas thành công!`)
      }

      resetForm()
      setTimeout(() => setNotification(''), 4000)
      await load()
    } catch (err) {
      alert(`Lỗi lưu câu chuyện: ${err}`)
    } finally {
      setBusy('')
    }
  }

  async function prepareAtlas(storyId: string) {
    setBusy(storyId)
    try {
      await api(`/orgs/${org}/content/STORY/${storyId}/prepare-atlas`, { method: 'POST' })
      setNotification('Đã xác minh và xuất bản thành công câu chuyện lên Culture Atlas!')
      setTimeout(() => setNotification(''), 4000)
      await load()
    } catch (err) {
      alert(`Lỗi chuẩn bị và xuất bản Atlas: ${err}`)
    } finally {
      setBusy('')
    }
  }

  async function handleDelete(id: string, storyTitle: string) {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa câu chuyện "${storyTitle}"? Hành động này cũng sẽ gỡ câu chuyện khỏi Culture Atlas nếu đã xuất bản.`)) return
    setBusy(id)
    try {
      await api(`/orgs/${org}/stories/${id}`, { method: 'DELETE' })
      setNotification(`Đã xóa câu chuyện "${storyTitle}" thành công!`)
      setTimeout(() => setNotification(''), 4000)
      await load()
    } catch (err) {
      alert(`Lỗi khi xóa câu chuyện: ${err}`)
    } finally {
      setBusy('')
    }
  }

  const getTypeLabel = (type: string) => {
    const f = STORY_TYPES.find(x => x.value === type)
    return f ? (f.label.split('(')[0] ?? '').trim() : type
  }

  const getCvConfig = (tag?: string) => {
    return CORE_VALUES.find(x => x.value.toLowerCase() === (tag || '').toLowerCase())
  }

  return (
    <div className="hub-page-container">
      <div className="hub-header-banner">
        <div>
          <span className="hub-tag">DI SẢN NỘI BỘ</span>
          <h1 className="hub-title">Culture Stories — Ký ức & Câu chuyện Văn hóa</h1>
          <p className="hub-subtitle">
            Lưu giữ và biên tập các câu chuyện lập nghiệp, truyền thống, bài học kinh nghiệm và khoảnh khắc văn hóa của NexTure.
          </p>
        </div>
        <div className="hub-header-actions">
          <button className="btn-primary" onClick={() => { if (showAddModal) resetForm(); else setShowAddModal(true); }}>
            {showAddModal ? 'Đóng form' : 'Viết câu chuyện mới'}
          </button>
        </div>
      </div>

      {notification && (
        <div className="notification-banner" style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '0.875rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 500 }}>
          <span>{notification}</span>
        </div>
      )}

      {/* Add / Edit Story Form Modal/Panel */}
      {showAddModal && (
        <form className="hub-panel form-panel" onSubmit={handleSave}>
          <div className="panel-header">
            <h3>{editingId ? 'Chỉnh sửa Câu chuyện Văn hóa' : 'Tạo Câu chuyện Văn hóa Mới'}</h3>
            <span className="muted">{editingId ? 'Tự động đồng bộ ngay lên Culture Atlas' : 'Tự động xuất bản trực tiếp lên Culture Atlas Stories'}</span>
          </div>

          <div className="form-grid">
            <div className="form-field full-width">
              <label>Tiêu đề câu chuyện *</label>
              <input
                required
                placeholder="Ví dụ: Khát vọng Số hóa DNA Văn hóa Doanh nghiệp"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Phân loại câu chuyện</label>
              <select value={storyType} onChange={e => setStoryType(e.target.value)}>
                {STORY_TYPES.map(t => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Giá trị cốt lõi</label>
              <select value={coreValueTag} onChange={e => setCoreValueTag(e.target.value)}>
                {CORE_VALUES.map(cv => (
                  <option key={cv.value} value={cv.value}>
                    {cv.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field full-width">
              <label>Thời điểm diễn ra</label>
              <input
                type="date"
                value={occurredAt}
                onChange={e => setOccurredAt(e.target.value)}
              />
            </div>

            <div className="form-field full-width">
              <label>Tóm tắt thông điệp cốt lõi (1-2 câu)</label>
              <input
                placeholder="Tóm tắt ngắn gọn bối cảnh và bài học văn hóa cốt lõi..."
                value={summary}
                onChange={e => setSummary(e.target.value)}
              />
            </div>

            <div className="form-field full-width">
              <label>Nội dung chi tiết câu chuyện *</label>
              <textarea
                required
                rows={6}
                placeholder="Kể lại câu chuyện với đầy đủ bối cảnh, con người, mâu thuẫn, quyết định và bài học kinh nghiệm sâu sắc..."
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={busy === 'saving'}>
              {busy === 'saving' ? 'Đang lưu & Xuất bản…' : (editingId ? 'Lưu thay đổi & Cập nhật Atlas' : 'Lưu & Đăng lên Culture Atlas')}
            </button>
          </div>
        </form>
      )}

      {/* Stories List */}
      <div className="hub-panel">
        <div className="panel-header">
          <h3>Danh sách Câu chuyện ({items.length})</h3>
          <span className="pill-live">Thời gian thực</span>
        </div>

        {loading ? (
          <div className="loading-card">Đang tải danh sách câu chuyện…</div>
        ) : items.length === 0 ? (
          <div className="empty-card">
            Chưa có câu chuyện nào. Bấm <b>&ldquo;Viết câu chuyện mới&rdquo;</b> để bắt đầu ghi lại di sản văn hóa đầu tiên!
          </div>
        ) : (
          <div className="story-cards-container">
            {items.map(s => {
              const cv = getCvConfig(s.coreValueTag)
              return (
                <div className="story-hub-card" key={s.id}>
                  <div className="story-hub-card-header">
                    <div className="badges-group">
                      <span className="badge-type">{getTypeLabel(s.storyType)}</span>
                      {s.coreValueTag && (
                        <span
                          className="badge-type"
                          style={{
                            background: cv?.bg || '#ecfdf5',
                            color: cv?.color || '#065f46',
                            borderColor: cv?.border || '#a7f3d0'
                          }}
                        >
                          {s.coreValueTag}
                        </span>
                      )}
                    </div>
                    {s.occurredAt && (
                      <span className="card-date">
                        Diễn ra: {new Date(s.occurredAt).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>

                  <h3 className="story-hub-title">{s.title}</h3>
                  {s.summary && <p className="story-hub-summary">{s.summary}</p>}
                  <p className="story-hub-content-preview">{s.content}</p>

                  <div className="story-hub-footer">
                    <span className="audit-info">
                      Cập nhật: {new Date(s.updatedAt).toLocaleDateString('vi-VN')}
                    </span>
                    <div className="inline-actions">
                      <button
                        type="button"
                        className="btn-action-small"
                        onClick={() => startEdit(s)}
                        title="Chỉnh sửa câu chuyện này"
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        type="button"
                        className="btn-delete-small"
                        disabled={busy === s.id}
                        onClick={() => handleDelete(s.id, s.title)}
                        title="Xóa câu chuyện này"
                      >
                        Xóa
                      </button>
                      <a
                        href="/#stories"
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.8rem', color: '#10b981', textDecoration: 'none', fontWeight: 600, marginLeft: '4px' }}
                      >
                        Xem trên Atlas
                      </a>
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
