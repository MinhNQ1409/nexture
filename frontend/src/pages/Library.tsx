import { FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, currentOrg } from '../api'

type SourceItem = {
  id: string
  name: string
  sourceType: string
  createdAt: string
}

type MediaItem = {
  id: string
  fileName?: string
  name?: string
  contentType?: string
  mediaType?: string
  createdAt: string
}

export default function Library() {
  const [data, setData] = useState<{ media: MediaItem[]; sources: SourceItem[] }>({ media: [], sources: [] })
  const [loading, setLoading] = useState(true)
  const [analyzingId, setAnalyzingId] = useState<string>('')
  const [notification, setNotification] = useState<string>('')

  // Text source inputs
  const [textName, setTextName] = useState('Phỏng vấn Sáng lập: Tầm nhìn 2024')
  const [textContent, setTextContent] = useState(
    'Tháng 1/2024, ban giám đốc và nhóm kỹ sư hạt nhân họp mặt thống nhất xây dựng nền tảng văn hóa doanh nghiệp độc lập. Quyết định quan trọng nhất là tôn trọng dữ liệu thật, không bao giờ để AI tự tô vẽ câu chuyện giả mạo.'
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const org = currentOrg()

  async function load() {
    setLoading(true)
    try {
      const res = await api<{ media: MediaItem[]; sources: SourceItem[] }>(`/orgs/${org}/library`)
      setData(res || { media: [], sources: [] })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [org])

  async function addText(e: FormEvent) {
    e.preventDefault()
    if (!textName.trim() || !textContent.trim()) return
    setIsSubmitting(true)
    try {
      await api(`/orgs/${org}/sources/text`, {
        method: 'POST',
        body: JSON.stringify({ name: textName, textContent })
      })
      setTextName('')
      setTextContent('')
      setNotification('Đã thêm nguồn text thành công! Bạn có thể bấm "AI Analyze" để bóc tách dữ liệu.')
      await load()
    } catch (err) {
      alert(`Lỗi thêm nguồn text: ${err}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function upload(file: File) {
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      await api(`/orgs/${org}/media/upload`, { method: 'POST', body: fd })
      setNotification(`Đã tải lên tệp ${file.name} thành công vào kho Media!`)
      await load()
    } catch (err) {
      alert(`Lỗi tải tệp: ${err}`)
    } finally {
      setIsUploading(false)
    }
  }

  async function analyze(id: string) {
    setAnalyzingId(id)
    setNotification('')
    try {
      await api(`/orgs/${org}/ai/analyze/${id}`, { method: 'POST' })
      setNotification('✦ AI Structuring Engine đã phân tích thành công! Các đề xuất Story/Event đang chờ bạn duyệt trong Pending Review.')
    } catch (err) {
      alert(`Lỗi AI phân tích: ${err}`)
    } finally {
      setAnalyzingId('')
    }
  }

  return (
    <div className="hub-page-container">
      <div className="hub-header-banner">
        <div>
          <span className="hub-tag">NGUỒN DỮ LIỆU GỐC</span>
          <h1 className="hub-title">Culture Library — Kho Tri thức & Dữ liệu Gốc</h1>
          <p className="hub-subtitle">
            Thu thập tài liệu phỏng vấn, biên bản cuộc họp, tư liệu sáng lập và tệp đính kèm. AI Structuring Engine sẽ xử lý nguồn này để đề xuất câu chuyện văn hóa.
          </p>
        </div>
      </div>

      {notification && (
        <div className="hub-notification-box">
          <span>{notification}</span>
          <Link to="/reviews" className="btn-link-action">
            Xem Pending Review →
          </Link>
        </div>
      )}

      <div className="hub-dashboard-columns">
        {/* Nguồn Text */}
        <form className="hub-panel form-panel" onSubmit={addText}>
          <div className="panel-header">
            <h3>Nạp Nguồn Văn Bản Trực Tiếp</h3>
            <span className="pill-live">Khuyên dùng</span>
          </div>

          <div className="form-field full-width">
            <label>Tên nguồn tài liệu *</label>
            <input
              required
              value={textName}
              placeholder="Ví dụ: Phỏng vấn Tổng Giám Đốc nhân dịp kỷ niệm 1 năm"
              onChange={e => setTextName(e.target.value)}
            />
          </div>

          <div className="form-field full-width">
            <label>Nội dung văn bản thô *</label>
            <textarea
              required
              rows={7}
              value={textContent}
              placeholder="Dán nội dung phỏng vấn, hồi ức hoặc biên bản sự kiện vào đây..."
              onChange={e => setTextContent(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu…' : '+ Thêm vào Kho Nguồn'}
            </button>
          </div>
        </form>

        {/* Upload File */}
        <div className="hub-panel">
          <div className="panel-header">
            <h3>Tải lên Tệp Tư liệu / Media</h3>
            <span className="muted">Kho tài sản số</span>
          </div>

          <div className="upload-dropzone">
            <div className="upload-icon">📁</div>
            <b>Kéo thả hoặc chọn tệp tư liệu từ máy tính</b>
            <p className="muted">Hỗ trợ PDF, DOCX, JPG, PNG, MP3, MP4</p>
            <label className="btn-secondary upload-btn-label">
              <span>{isUploading ? 'Đang tải tệp lên…' : 'Chọn tệp tư liệu'}</span>
              <input
                type="file"
                style={{ display: 'none' }}
                disabled={isUploading}
                onChange={e => e.target.files?.[0] && upload(e.target.files[0])}
              />
            </label>
          </div>

          <div className="media-list-preview">
            <small>Media gần đây ({data.media.length}):</small>
            {data.media.slice(0, 3).map(m => (
              <div className="media-item-pill" key={m.id}>
                <span>📄 {m.name || m.fileName || 'Tệp tư liệu'}</span>
                <small className="muted">{m.mediaType || m.contentType || 'file'}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sources List */}
      <div className="hub-panel">
        <div className="panel-header">
          <h3>Tất cả Nguồn Tư liệu Đã Nạp ({data.sources.length})</h3>
          <span className="pill-live">Sẵn sàng AI phân tích</span>
        </div>

        {loading ? (
          <div className="loading-card">Đang tải danh sách nguồn tư liệu…</div>
        ) : data.sources.length === 0 ? (
          <div className="empty-card">Chưa có nguồn tư liệu nào. Hãy thêm nguồn text hoặc upload tệp ở trên!</div>
        ) : (
          <div className="sources-list-grid">
            {data.sources.map(s => {
              const isAnalyzing = analyzingId === s.id
              return (
                <div className="source-card" key={s.id}>
                  <div className="source-top">
                    <span className="source-type-pill">{s.sourceType}</span>
                    <span className="source-date">
                      {new Date(s.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <h4 className="source-title">{s.name}</h4>
                  <div className="source-actions">
                    <button
                      className="btn-ai-analyze"
                      disabled={isAnalyzing}
                      onClick={() => analyze(s.id)}
                    >
                      {isAnalyzing ? (
                        <>
                          <span className="spinner-inline" /> Đang chạy AI…
                        </>
                      ) : (
                        '✦ AI Analyze (Bóc tách dữ liệu)'
                      )}
                    </button>
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
