import { useEffect, useState } from 'react'
import { api, currentOrg } from '../api'

type ReviewItem = {
  id: string
  sourceId: string
  suggestionType: string
  payloadJson: string
  status: string
  reviewId: string
}

export default function Reviews() {
  const org = currentOrg()
  const [items, setItems] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string>('')

  async function load() {
    setLoading(true)
    try {
      const res = await api<ReviewItem[]>(`/orgs/${org}/reviews`)
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

  async function approve(id: string) {
    setBusy(id)
    try {
      await api(`/orgs/${org}/reviews/${id}/approve`, { method: 'POST' })
      await load()
    } catch (err) {
      alert(`Lỗi phê duyệt: ${err}`)
    } finally {
      setBusy('')
    }
  }

  async function reject(id: string) {
    const reason = window.prompt('Nhập lý do từ chối đề xuất này (tùy chọn):', 'Nội dung chưa chính xác hoặc không đủ tính xác thực.')
    if (reason === null) return
    setBusy(id)
    try {
      await api(`/orgs/${org}/reviews/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ note: reason || 'Rejected by Admin' })
      })
      await load()
    } catch (err) {
      alert(`Lỗi từ chối: ${err}`)
    } finally {
      setBusy('')
    }
  }

  const parsePayload = (json: string) => {
    try {
      return JSON.parse(json)
    } catch {
      return null
    }
  }

  return (
    <div className="hub-page-container">
      <div className="hub-header-banner">
        <div>
          <span className="hub-tag">KIỂM DUYỆT ĐẠO ĐỨC & SỰ THẬT</span>
          <h1 className="hub-title">Pending Review — Kiểm duyệt Đề xuất AI</h1>
          <p className="hub-subtitle">
            <b>Nguyên tắc Human-in-the-loop:</b> AI chỉ đóng vai trò phân tích sơ bộ và gợi ý (AI_SUGGESTED). Chỉ sau khi chuyên gia con người kiểm chứng và phê duyệt, dữ liệu mới chính thức chuyển thành <b>VERIFIED</b>.
          </p>
        </div>
      </div>

      <div className="hub-panel">
        <div className="panel-header">
          <h3>Hàng đợi Chờ Kiểm duyệt ({items.length})</h3>
          <span className="pill-live">{items.length} mục cần duyệt</span>
        </div>

        {loading ? (
          <div className="loading-card">Đang tải danh sách chờ duyệt…</div>
        ) : items.length === 0 ? (
          <div className="empty-card text-center">
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🎉</span>
            <b>Tuyệt vời! Hiện không có đề xuất AI nào đang chờ duyệt.</b>
            <p className="muted" style={{ maxWidth: '480px', margin: '8px auto 0' }}>
              Khi bạn upload tài liệu vào <b>Culture Library</b> và nhấn nút <b>&ldquo;AI Analyze&rdquo;</b>, các cấu trúc Story hoặc Event được trích xuất sẽ xuất hiện tại đây để bạn thẩm định.
            </p>
          </div>
        ) : (
          <div className="review-cards-list">
            {items.map(x => {
              const p = parsePayload(x.payloadJson)
              const title = p?.title || p?.name || 'Đề xuất chưa có tiêu đề'
              const summary = p?.summary || ''
              const content = p?.content || ''
              const type = p?.storyType || p?.eventType || x.suggestionType
              const date = p?.occurredAt || p?.startDate

              return (
                <div className="review-card" key={x.id}>
                  <div className="review-header">
                    <div className="badges-group">
                      <span className="badge-type">ĐỀ XUẤT {x.suggestionType}</span>
                      <span className="badge-ai">✦ AI_SUGGESTED</span>
                      {type && <span className="badge-sub">{type}</span>}
                    </div>
                    {date && (
                      <span className="card-date">
                        Thời điểm: {new Date(date).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>

                  <div className="review-body">
                    <h3 className="review-title">{title}</h3>
                    {summary && <p className="review-summary"><b>Tóm tắt:</b> {summary}</p>}
                    <div className="review-content-box">
                      <b>Nội dung trích xuất:</b>
                      <p>{content}</p>
                    </div>
                  </div>

                  <div className="review-actions-footer">
                    <div className="review-hints">
                      <small className="muted">
                        Bấm <b>Phê duyệt</b> để tự động tạo bản ghi {x.suggestionType} với trạng thái <b>VERIFIED</b>.
                      </small>
                    </div>
                    <div className="btn-group">
                      <button
                        className="btn-danger"
                        disabled={busy === x.id}
                        onClick={() => reject(x.id)}
                      >
                        {busy === x.id ? '…' : '✕ Từ chối'}
                      </button>
                      <button
                        className="btn-primary"
                        disabled={busy === x.id}
                        onClick={() => approve(x.id)}
                      >
                        {busy === x.id ? 'Đang duyệt…' : '✓ Phê duyệt (VERIFIED)'}
                      </button>
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
