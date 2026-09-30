import { useEffect, useMemo, useState } from 'react'
import { api, currentOrg } from '../api'

type Candidate = {
  entityType: string
  entityId: string
  title: string
  status: string
  visibility: string
  updatedAt: string
}

type Publication = {
  id: string
  entityType: string
  entityId: string
  status: string
  slug: string
  publishedTitle: string
  version: number
  publishedAt?: string
  isOutdated: boolean
}

type AtlasData = {
  organization: { id: string; name: string; slug: string; atlasEnabled: boolean }
  candidates: Candidate[]
  publications: Publication[]
}

export default function AtlasManagement() {
  const org = currentOrg()
  const [data, setData] = useState<AtlasData | null>(null)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [notification, setNotification] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const res = await api<AtlasData>(`/orgs/${org}/atlas`)
      setData(res)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [org])

  const pubByEntity = useMemo(
    () => new Map((data?.publications ?? []).map(p => [`${p.entityType}:${p.entityId}`, p])),
    [data]
  )

  async function prepare(c: Candidate) {
    setBusy(c.entityId)
    setError('')
    setNotification('')
    try {
      await api(`/orgs/${org}/content/${c.entityType}/${c.entityId}/prepare-atlas`, { method: 'POST' })
      setNotification(`Đã chuyển "${c.title}" sang trạng thái VERIFIED + PUBLIC. Sẵn sàng xuất bản!`)
      await load()
    } catch (e) {
      setError(String(e))
    } finally {
      setBusy('')
    }
  }

  async function publish(c: Candidate) {
    setBusy(c.entityId)
    setError('')
    setNotification('')
    try {
      await api(`/orgs/${org}/atlas/publish`, {
        method: 'POST',
        body: JSON.stringify({ entityType: c.entityType, entityId: c.entityId })
      })
      setNotification(`Đã xuất bản snapshot bất biến cho "${c.title}" lên Culture Atlas!`)
      await load()
    } catch (e) {
      setError(String(e))
    } finally {
      setBusy('')
    }
  }

  async function unpublish(p: Publication) {
    if (!window.confirm(`Bạn có chắc chắn muốn gỡ ấn phẩm "${p.publishedTitle}" khỏi Culture Atlas?`)) return
    setBusy(p.id)
    setError('')
    setNotification('')
    try {
      await api(`/orgs/${org}/atlas/publications/${p.id}/unpublish`, { method: 'POST' })
      setNotification(`Đã gỡ ấn phẩm "${p.publishedTitle}" khỏi Culture Atlas.`)
      await load()
    } catch (e) {
      setError(String(e))
    } finally {
      setBusy('')
    }
  }

  if (!data) {
    return (
      <div className="hub-page-container">
        <div className="card loading-card" role="status">
          {loading
            ? 'Đang tải Trung tâm Xuất bản Culture Atlas…'
            : 'Chưa thể tải dữ liệu Culture Atlas. Vui lòng thử lại sau.'}
        </div>
      </div>
    )
  }

  // Thống kê nhanh
  const totalCandidates = data.candidates.length
  const totalPublished = data.publications.filter(p => p.status === 'PUBLISHED').length
  const totalOutdated = data.publications.filter(p => p.isOutdated).length
  const eligibleCount = data.candidates.filter(c => c.status === 'VERIFIED' && c.visibility === 'PUBLIC').length

  return (
    <div className="hub-page-container">
      <div className="hub-header-banner">
        <div>
          <span className="hub-tag">TRUNG TÂM XUẤT BẢN & PHÁT HÀNH</span>
          <h1 className="hub-title">Culture Atlas Publishing — Quản lý Bản đồ Văn hóa</h1>
          <p className="hub-subtitle">
            <b>Kiến trúc Immutable Publication Snapshot:</b> Dữ liệu trên Culture Atlas độc lập hoàn toàn với bản nháp trong Hub. Chỉ khi Admin bấm &ldquo;Publish&rdquo;, một bản chụp bất biến mới được tạo và công khai ra thế giới.
          </p>
        </div>
        <div className="hub-header-actions">
          <a className="btn-atlas-preview" href="/atlas" target="_blank" rel="noreferrer">
            <span>Mở NexTure Culture Atlas</span>
            <span>↗</span>
          </a>
        </div>
      </div>

      {notification && (
        <div className="hub-notification-box">
          <span>✓ {notification}</span>
        </div>
      )}

      {error && <div className="hub-error-box">✕ {error}</div>}

      {/* KPI Ribbon */}
      <div className="hub-kpi-grid">
        <div className="hub-kpi-card color-slate">
          <div className="kpi-top">
            <span className="kpi-icon">📋</span>
            <span className="kpi-count">{totalCandidates}</span>
          </div>
          <div className="kpi-title">Tổng thực thể Hub</div>
          <div className="kpi-desc">Stories, Events, People, Products</div>
        </div>

        <div className="hub-kpi-card color-teal">
          <div className="kpi-top">
            <span className="kpi-icon">✨</span>
            <span className="kpi-count">{eligibleCount}</span>
          </div>
          <div className="kpi-title">Đủ điều kiện xuất bản</div>
          <div className="kpi-desc">VERIFIED + PUBLIC</div>
        </div>

        <div className="hub-kpi-card color-green">
          <div className="kpi-top">
            <span className="kpi-icon">🌐</span>
            <span className="kpi-count">{totalPublished}</span>
          </div>
          <div className="kpi-title">Đang công khai trên Atlas</div>
          <div className="kpi-desc">Snapshot bất biến (PUBLISHED)</div>
        </div>

        <div className={`hub-kpi-card color-${totalOutdated > 0 ? 'amber' : 'gray'}`}>
          <div className="kpi-top">
            <span className="kpi-icon">⚠️</span>
            <span className="kpi-count">{totalOutdated}</span>
          </div>
          <div className="kpi-title">Cần cập nhật Snapshot</div>
          <div className="kpi-desc">Hub có thay đổi sau khi publish</div>
        </div>
      </div>

      {/* Candidate Table */}
      <div className="hub-panel">
        <div className="panel-header">
          <h3>Bảng Quản lý Thực thể & Snapshot Công khai</h3>
          <span className="pill-live">Bảo vệ tính toàn vẹn</span>
        </div>

        <div className="table-responsive">
          <table className="hub-table">
            <thead>
              <tr>
                <th>Thực thể di sản</th>
                <th>Phân loại</th>
                <th>Trạng thái Hub</th>
                <th>Trạng thái Atlas</th>
                <th>Phiên bản</th>
                <th>Hành động Quản trị</th>
              </tr>
            </thead>
            <tbody>
              {data.candidates.map(c => {
                const p = pubByEntity.get(`${c.entityType}:${c.entityId}`)
                const eligible = c.status === 'VERIFIED' && c.visibility === 'PUBLIC'
                const isPublished = p?.status === 'PUBLISHED'

                return (
                  <tr key={`${c.entityType}:${c.entityId}`} className={p?.isOutdated ? 'row-outdated' : ''}>
                    <td>
                      <div className="entity-cell">
                        <b>{c.title}</b>
                        {p?.isOutdated && (
                          <span className="outdated-warning-tag">
                            Hub đã sửa đổi sau lần publish gần nhất
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge-type">{c.entityType}</span>
                    </td>
                    <td>
                      <div className="badges-stack">
                        <span className={`badge-status ${c.status.toLowerCase()}`}>{c.status}</span>
                        <span className={`badge-vis ${c.visibility.toLowerCase()}`}>{c.visibility}</span>
                      </div>
                    </td>
                    <td>
                      {isPublished ? (
                        <span className="badge-published">PUBLISHED</span>
                      ) : p ? (
                        <span className="badge-unpub">{p.status}</span>
                      ) : (
                        <span className="badge-draft">Chưa xuất bản</span>
                      )}
                    </td>
                    <td>
                      <span className="version-pill">{p ? `v${p.version}` : '—'}</span>
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        {!eligible && (
                          <button
                            className="btn-action-small"
                            disabled={!!busy}
                            onClick={() => prepare(c)}
                            title="Xác thực và chuyển quyền sang PUBLIC"
                          >
                            {busy === c.entityId ? '…' : 'Chuẩn bị Atlas'}
                          </button>
                        )}
                        {eligible && (!p || p.status !== 'PUBLISHED' || p.isOutdated) && (
                          <button
                            className="btn-publish-now"
                            disabled={!!busy}
                            onClick={() => publish(c)}
                          >
                            {busy === c.entityId ? '…' : p ? 'Publish bản mới' : 'Publish lên Atlas'}
                          </button>
                        )}
                        {isPublished && (
                          <button
                            className="btn-action-ghost"
                            disabled={!!busy}
                            onClick={() => unpublish(p)}
                            title="Gỡ khỏi bản đồ công khai"
                          >
                            {busy === p.id ? '…' : 'Gỡ Atlas'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Snapshots Log */}
      <div className="hub-panel">
        <div className="panel-header">
          <h3>Các Bản chụp Ấn phẩm Độc lập (Publication Snapshots)</h3>
          <span className="muted">{data.publications.length} snapshot đã tạo</span>
        </div>
        {data.publications.length === 0 ? (
          <p className="empty-card">Chưa có snapshot nào được tạo.</p>
        ) : (
          <div className="snapshots-list">
            {data.publications.map(p => (
              <div className="snapshot-item-row" key={p.id}>
                <div className="snapshot-item-left">
                  <span className="version-badge">v{p.version}</span>
                  <div>
                    <b>{p.publishedTitle}</b>
                    <small className="muted">
                      {p.entityType} · slug: <code>{p.slug}</code>
                      {p.publishedAt ? ` · Xuất bản: ${new Date(p.publishedAt).toLocaleDateString('vi-VN')}` : ''}
                    </small>
                  </div>
                </div>
                <div className="snapshot-item-right">
                  {p.isOutdated ? (
                    <span className="badge-outdated">OUTDATED</span>
                  ) : (
                    <span className="badge-up-to-date">Đồng bộ</span>
                  )}
                  <span className={`badge-status ${p.status.toLowerCase()}`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
