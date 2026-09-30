import { FormEvent, useEffect, useState } from 'react'
import { api, currentOrg } from '../api'

type PersonItem = {
  id: string
  fullName: string
  roleTitle?: string
  bio?: string
  notableContribution?: string
  joinedAt?: string
  status: string
  visibility: string
  coreValueTag?: string
  isAtlasPublished?: boolean
  updatedAt: string
}

type ProductItem = {
  id: string
  name: string
  kind?: string
  description?: string
  startedAt?: string
  status: string
  visibility: string
  coreValueTag?: string
  isAtlasPublished?: boolean
  updatedAt: string
}

const PRODUCT_KINDS = [
  { value: 'ENTERPRISE_PLATFORM', label: 'Nền tảng Doanh nghiệp (Platform)' },
  { value: 'PUBLIC_ATLAS', label: 'Bản đồ Văn hóa Công khai (Atlas)' },
  { value: 'AI_INITIATIVE', label: 'Sáng kiến Công nghệ AI (Initiative)' },
  { value: 'COMMUNITY_PROJECT', label: 'Dự án Di sản Cộng đồng (Community)' }
]

const CORE_VALUES = [
  { value: 'Trust', label: 'Trust (Niềm tin & Toàn vẹn)', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  { value: 'Learning', label: 'Learning (Học hỏi & Đổi mới)', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
  { value: 'Creativity', label: 'Creativity (Sáng tạo & Đột phá)', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  { value: 'Empathy', label: 'Empathy (Thấu cảm & Tử tế)', color: '#db2777', bg: '#fdf2f8', border: '#fbcfe8' }
]

export default function PeopleProducts() {
  const org = currentOrg()
  const [activeTab, setActiveTab] = useState<'people' | 'products'>('people')

  const [people, setPeople] = useState<PersonItem[]>([])
  const [products, setProducts] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [notification, setNotification] = useState('')

  // People Form
  const [fullName, setFullName] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [personCoreValueTag, setPersonCoreValueTag] = useState('Trust')
  const [bio, setBio] = useState('')
  const [notableContribution, setNotableContribution] = useState('')
  const [joinedAt, setJoinedAt] = useState(new Date().toISOString().slice(0, 10))
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null)
  const [showPersonModal, setShowPersonModal] = useState(false)

  // Product Form
  const [productName, setProductName] = useState('')
  const [productKind, setProductKind] = useState('ENTERPRISE_PLATFORM')
  const [productCoreValueTag, setProductCoreValueTag] = useState('Creativity')
  const [description, setDescription] = useState('')
  const [startedAt, setStartedAt] = useState(new Date().toISOString().slice(0, 10))
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [peo, pro] = await Promise.all([
        api<PersonItem[]>(`/orgs/${org}/people`),
        api<ProductItem[]>(`/orgs/${org}/products`)
      ])
      setPeople(peo || [])
      setProducts(pro || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [org])

  function resetPersonForm() {
    setFullName('')
    setRoleTitle('')
    setBio('')
    setNotableContribution('')
    setPersonCoreValueTag('Trust')
    setJoinedAt(new Date().toISOString().slice(0, 10))
    setEditingPersonId(null)
    setShowPersonModal(false)
  }

  function startEditPerson(p: PersonItem) {
    setEditingPersonId(p.id)
    setFullName(p.fullName)
    setRoleTitle(p.roleTitle || '')
    setBio(p.bio || '')
    setNotableContribution(p.notableContribution || '')
    setPersonCoreValueTag(p.coreValueTag || 'Trust')
    setJoinedAt(p.joinedAt ? p.joinedAt.slice(0, 10) : new Date().toISOString().slice(0, 10))
    setShowPersonModal(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSavePerson(e: FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) return
    setBusy('person')
    try {
      const payload = {
        fullName,
        roleTitle,
        bio,
        notableContribution,
        coreValueTag: personCoreValueTag,
        joinedAt: joinedAt ? new Date(joinedAt).toISOString() : null,
        status: 'VERIFIED',
        visibility: 'PUBLIC'
      }

      if (editingPersonId) {
        await api(`/orgs/${org}/people/${editingPersonId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        })
        setNotification(`Đã cập nhật hồ sơ "${fullName}" và đồng bộ lên Culture Atlas!`)
      } else {
        await api(`/orgs/${org}/people`, {
          method: 'POST',
          body: JSON.stringify(payload)
        })
        setNotification(`Đã thêm và đăng hồ sơ Đại sứ "${fullName}" lên Culture Atlas thành công!`)
      }

      resetPersonForm()
      setTimeout(() => setNotification(''), 4000)
      await load()
    } catch (err) {
      alert(`Lỗi lưu hồ sơ nhân sự: ${err}`)
    } finally {
      setBusy('')
    }
  }

  function resetProductForm() {
    setProductName('')
    setDescription('')
    setProductKind('ENTERPRISE_PLATFORM')
    setProductCoreValueTag('Creativity')
    setStartedAt(new Date().toISOString().slice(0, 10))
    setEditingProductId(null)
    setShowProductModal(false)
  }

  function startEditProduct(pr: ProductItem) {
    setEditingProductId(pr.id)
    setProductName(pr.name)
    setProductKind(pr.kind || 'ENTERPRISE_PLATFORM')
    setProductCoreValueTag(pr.coreValueTag || 'Creativity')
    setDescription(pr.description || '')
    setStartedAt(pr.startedAt ? pr.startedAt.slice(0, 10) : new Date().toISOString().slice(0, 10))
    setShowProductModal(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSaveProduct(e: FormEvent) {
    e.preventDefault()
    if (!productName.trim()) return
    setBusy('product')
    try {
      const payload = {
        name: productName,
        kind: productKind,
        description,
        coreValueTag: productCoreValueTag,
        startedAt: startedAt ? new Date(startedAt).toISOString() : null,
        status: 'VERIFIED',
        visibility: 'PUBLIC'
      }

      if (editingProductId) {
        await api(`/orgs/${org}/products/${editingProductId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        })
        setNotification(`Đã cập nhật sản phẩm "${productName}" và đồng bộ lên Culture Atlas!`)
      } else {
        await api(`/orgs/${org}/products`, {
          method: 'POST',
          body: JSON.stringify(payload)
        })
        setNotification(`Đã thêm và đăng sản phẩm "${productName}" lên Culture Atlas thành công!`)
      }

      resetProductForm()
      setTimeout(() => setNotification(''), 4000)
      await load()
    } catch (err) {
      alert(`Lỗi lưu sản phẩm: ${err}`)
    } finally {
      setBusy('')
    }
  }

  async function prepareAtlas(type: 'PERSON' | 'PRODUCT', id: string) {
    setBusy(id)
    try {
      await api(`/orgs/${org}/content/${type}/${id}/prepare-atlas`, { method: 'POST' })
      setNotification('Đã xác minh và xuất bản thành công lên Culture Atlas!')
      setTimeout(() => setNotification(''), 4000)
      await load()
    } catch (err) {
      alert(`Lỗi chuẩn bị và xuất bản Atlas: ${err}`)
    } finally {
      setBusy('')
    }
  }

  async function handleDeletePerson(id: string, name: string) {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ "${name}"? Hành động này cũng sẽ gỡ hồ sơ khỏi Culture Atlas nếu đã xuất bản.`)) return
    setBusy(id)
    try {
      await api(`/orgs/${org}/people/${id}`, { method: 'DELETE' })
      setNotification(`Đã xóa hồ sơ "${name}" thành công!`)
      setTimeout(() => setNotification(''), 4000)
      await load()
    } catch (err) {
      alert(`Lỗi khi xóa hồ sơ nhân sự: ${err}`)
    } finally {
      setBusy('')
    }
  }

  async function handleDeleteProduct(id: string, name: string) {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm/dự án "${name}"? Hành động này cũng sẽ gỡ sản phẩm khỏi Culture Atlas nếu đã xuất bản.`)) return
    setBusy(id)
    try {
      await api(`/orgs/${org}/products/${id}`, { method: 'DELETE' })
      setNotification(`Đã xóa sản phẩm/dự án "${name}" thành công!`)
      setTimeout(() => setNotification(''), 4000)
      await load()
    } catch (err) {
      alert(`Lỗi khi xóa sản phẩm: ${err}`)
    } finally {
      setBusy('')
    }
  }

  const getCvConfig = (tag?: string) => {
    return CORE_VALUES.find(x => x.value.toLowerCase() === (tag || '').toLowerCase())
  }

  return (
    <div className="hub-page-container">
      <div className="hub-header-banner">
        <div>
          <span className="hub-tag">THỰC THỂ DI SẢN</span>
          <h1 className="hub-title">People & Products — Đại sứ Văn hóa & Công trình Di sản</h1>
          <p className="hub-subtitle">
            Ghi danh những cá nhân tiêu biểu, lãnh đạo văn hóa cùng các sản phẩm và sáng kiến định hình bản sắc NexTure.
          </p>
        </div>
        <div className="hub-header-actions">
          {activeTab === 'people' ? (
            <button className="btn-primary" onClick={() => { if (showPersonModal) resetPersonForm(); else setShowPersonModal(true); }}>
              {showPersonModal ? 'Đóng form' : 'Thêm Đại sứ Văn hóa'}
            </button>
          ) : (
            <button className="btn-primary" onClick={() => { if (showProductModal) resetProductForm(); else setShowProductModal(true); }}>
              {showProductModal ? 'Đóng form' : 'Thêm Sản phẩm Di sản'}
            </button>
          )}
        </div>
      </div>

      {notification && (
        <div className="notification-banner" style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '0.875rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 500 }}>
          <span>{notification}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="hub-tabs-row">
        <button
          className={`hub-tab-btn ${activeTab === 'people' ? 'active' : ''}`}
          onClick={() => setActiveTab('people')}
        >
          Đại sứ Văn hóa & Lãnh đạo ({people.length})
        </button>
        <button
          className={`hub-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Sản phẩm & Dự án Di sản ({products.length})
        </button>
      </div>

      {/* PEOPLE TAB */}
      {activeTab === 'people' && (
        <>
          {showPersonModal && (
            <form className="hub-panel form-panel" onSubmit={handleSavePerson}>
              <div className="panel-header">
                <h3>{editingPersonId ? 'Chỉnh sửa Hồ sơ Đại sứ' : 'Thêm Đại sứ Văn hóa / Lãnh đạo Mới'}</h3>
                <span className="muted">{editingPersonId ? 'Tự động đồng bộ ngay lên Culture Atlas' : 'Tự động xuất bản trực tiếp lên Culture Atlas People'}</span>
              </div>
              <div className="form-grid">
                <div className="form-field">
                  <label>Họ và tên *</label>
                  <input
                    required
                    placeholder="Ví dụ: Trần Minh Đức"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Chức danh / Vai trò</label>
                  <input
                    placeholder="Ví dụ: Đồng sáng lập & Giám đốc Sản phẩm Văn hóa"
                    value={roleTitle}
                    onChange={e => setRoleTitle(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Giá trị cốt lõi đại diện</label>
                  <select value={personCoreValueTag} onChange={e => setPersonCoreValueTag(e.target.value)}>
                    {CORE_VALUES.map(cv => (
                      <option key={cv.value} value={cv.value}>
                        {cv.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Thời điểm gia nhập / Đóng góp</label>
                  <input
                    type="date"
                    value={joinedAt}
                    onChange={e => setJoinedAt(e.target.value)}
                  />
                </div>
                <div className="form-field full-width">
                  <label>Câu nói / Triết lý hành động tiêu biểu</label>
                  <input
                    placeholder="Ví dụ: Văn hóa là những gì chúng ta làm khi không có ai giám sát."
                    value={notableContribution}
                    onChange={e => setNotableContribution(e.target.value)}
                  />
                </div>
                <div className="form-field full-width">
                  <label>Tiểu sử & Đóng góp</label>
                  <textarea
                    rows={3}
                    placeholder="Tóm tắt kinh nghiệm, dấu ấn văn hóa hoặc đóng góp quan trọng cho tổ chức..."
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetPersonForm}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary" disabled={busy === 'person'}>
                  {busy === 'person' ? 'Đang lưu & Xuất bản…' : (editingPersonId ? 'Lưu thay đổi & Cập nhật Atlas' : 'Lưu & Đăng lên Culture Atlas')}
                </button>
              </div>
            </form>
          )}

          <div className="hub-panel">
            <div className="panel-header">
              <h3>Đội ngũ & Đại sứ Văn hóa ({people.length})</h3>
              <span className="pill-live">Thời gian thực</span>
            </div>
            {loading ? (
              <div className="loading-card">Đang tải hồ sơ nhân sự…</div>
            ) : people.length === 0 ? (
              <div className="empty-card">Chưa có hồ sơ nhân sự nào. Bấm &ldquo;Thêm Đại sứ Văn hóa&rdquo; để khởi tạo!</div>
            ) : (
              <div className="people-hub-grid">
                {people.map(p => {
                  const cv = getCvConfig(p.coreValueTag)
                  return (
                    <div className="person-hub-card" key={p.id}>
                      <div className="person-hub-header">
                        <div className="person-avatar-circle">{p.fullName.slice(0, 1)}</div>
                        <div>
                          <h4 className="person-name">{p.fullName}</h4>
                          <span className="person-role">{p.roleTitle || 'Thành viên'}</span>
                        </div>
                      </div>

                      {p.notableContribution && (
                        <blockquote className="person-quote-box">
                          &ldquo;{p.notableContribution}&rdquo;
                        </blockquote>
                      )}

                      {p.bio && <p className="person-bio-text">{p.bio}</p>}

                      <div className="card-meta-row">
                        {p.coreValueTag && (
                          <span
                            className="badge-type"
                            style={{
                              background: cv?.bg || '#ecfdf5',
                              color: cv?.color || '#065f46',
                              borderColor: cv?.border || '#a7f3d0'
                            }}
                          >
                            {p.coreValueTag}
                          </span>
                        )}
                      </div>

                      <div className="person-card-footer">
                        <div className="inline-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="btn-action-small"
                            onClick={() => startEditPerson(p)}
                            title="Chỉnh sửa hồ sơ này"
                          >
                            Chỉnh sửa
                          </button>
                          <button
                            type="button"
                            className="btn-delete-small"
                            disabled={busy === p.id}
                            onClick={() => handleDeletePerson(p.id, p.fullName)}
                            title="Xóa hồ sơ này"
                          >
                            Xóa
                          </button>
                          <a
                            href="/#people"
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
        </>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <>
          {showProductModal && (
            <form className="hub-panel form-panel" onSubmit={handleSaveProduct}>
              <div className="panel-header">
                <h3>{editingProductId ? 'Chỉnh sửa Sản phẩm / Dự án Di sản' : 'Thêm Sản phẩm / Dự án Di sản'}</h3>
                <span className="muted">{editingProductId ? 'Tự động đồng bộ ngay lên Culture Atlas' : 'Tự động xuất bản trực tiếp lên Culture Atlas Products'}</span>
              </div>
              <div className="form-grid">
                <div className="form-field full-width">
                  <label>Tên sản phẩm / Dự án *</label>
                  <input
                    required
                    placeholder="Ví dụ: NexTure Digital Culture Hub"
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Loại công trình</label>
                  <select value={productKind} onChange={e => setProductKind(e.target.value)}>
                    {PRODUCT_KINDS.map(k => (
                      <option key={k.value} value={k.value}>
                        {k.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Giá trị cốt lõi đại diện</label>
                  <select value={productCoreValueTag} onChange={e => setProductCoreValueTag(e.target.value)}>
                    {CORE_VALUES.map(cv => (
                      <option key={cv.value} value={cv.value}>
                        {cv.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field full-width">
                  <label>Thời điểm bắt đầu</label>
                  <input
                    type="date"
                    value={startedAt}
                    onChange={e => setStartedAt(e.target.value)}
                  />
                </div>
                <div className="form-field full-width">
                  <label>Mô tả sản phẩm & ý nghĩa văn hóa</label>
                  <textarea
                    rows={4}
                    placeholder="Mô tả mục tiêu, công nghệ và giá trị mang lại cho văn hóa tổ chức..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetProductForm}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary" disabled={busy === 'product'}>
                  {busy === 'product' ? 'Đang lưu & Xuất bản…' : (editingProductId ? 'Lưu thay đổi & Cập nhật Atlas' : 'Lưu & Đăng lên Culture Atlas')}
                </button>
              </div>
            </form>
          )}

          <div className="hub-panel">
            <div className="panel-header">
              <h3>Sản phẩm & Dự án Di sản ({products.length})</h3>
              <span className="pill-live">Thời gian thực</span>
            </div>
            {loading ? (
              <div className="loading-card">Đang tải danh sách sản phẩm…</div>
            ) : products.length === 0 ? (
              <div className="empty-card">Chưa có sản phẩm nào. Bấm &ldquo;Thêm Sản phẩm Di sản&rdquo; để khởi tạo!</div>
            ) : (
              <div className="products-hub-grid">
                {products.map(pr => {
                  const cv = getCvConfig(pr.coreValueTag)
                  return (
                    <div className="product-hub-card" key={pr.id}>
                      <div className="product-hub-top">
                        <span className="product-kind-tag">{pr.kind || 'PRODUCT'}</span>
                        <div className="badges-group">
                          {pr.coreValueTag && (
                            <span
                              className="badge-type"
                              style={{
                                background: cv?.bg || '#ecfdf5',
                                color: cv?.color || '#065f46',
                                borderColor: cv?.border || '#a7f3d0'
                              }}
                            >
                              {pr.coreValueTag}
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="product-name">{pr.name}</h4>
                      <p className="product-desc-text">{pr.description}</p>

                      <div className="product-card-footer">
                        <span className="audit-info">
                          {pr.startedAt ? `Bắt đầu: ${new Date(pr.startedAt).toLocaleDateString('vi-VN')}` : ''}
                        </span>
                        <div className="inline-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="btn-action-small"
                            onClick={() => startEditProduct(pr)}
                            title="Chỉnh sửa sản phẩm này"
                          >
                            Chỉnh sửa
                          </button>
                          <button
                            type="button"
                            className="btn-delete-small"
                            disabled={busy === pr.id}
                            onClick={() => handleDeleteProduct(pr.id, pr.name)}
                            title="Xóa sản phẩm/dự án này"
                          >
                            Xóa
                          </button>
                          <a
                            href="/#products"
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
        </>
      )}
    </div>
  )
}
