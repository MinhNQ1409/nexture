import { FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import teamPhoto from '../assets/nexture-team.jpg'
import collaborationPhoto from '../assets/nexture-collaboration.jpg'
import portraitPhoto from '../assets/nexture-portrait.jpg'
export type CoreValueItem = {
  id: string
  name: string
  tag: string
  description: string
  keywords?: string
  color?: string
}

export type AtlasItem = {
  id: string
  entityType: 'STORY' | 'EVENT' | 'PERSON' | 'PRODUCT'
  slug: string
  title: string
  summary?: string
  content?: string
  coverMediaUrl?: string
  occurredAt?: string
  publishedAt?: string
  version: number
  coreValueTag?: string
  relatedEntities?: string[]
}

export type CompanyProfile = {
  organization: {
    name: string
    slug: string
    logoUrl?: string
    foundedYear?: number
    industry?: string
    employeeScale?: string
    location?: string
    website?: string
    shortDescription?: string
    founderName?: string
    coreValues?: string
    cultureManifesto?: string
    coreValuesList?: CoreValueItem[]
  }
  coreValuesList: CoreValueItem[]
  stories: AtlasItem[]
  timeline: AtlasItem[]
  people: AtlasItem[]
  products: AtlasItem[]
}

const coreValueColors: Record<string, string> = {
  Trust: '#10b981',
  Learning: '#0ea5e9',
  Creativity: '#f59e0b',
  Empathy: '#ec4899'
}

export default function PublicAtlasHome() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [selectedCoreValue, setSelectedCoreValue] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeStory, setActiveStory] = useState<AtlasItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function loadData() {
    setLoading(true)
    setError(null)
    api<CompanyProfile>('/atlas/nexture-technology')
      .then(res => {
        if (res && res.organization) {
          const rawCV: any[] = res.coreValuesList || res.organization.coreValuesList || []
          const normalizedCV: CoreValueItem[] = rawCV.map((cv: any, idx: number) => ({
            id: cv.id || cv.tag || String(idx),
            tag: cv.tag || 'Trust',
            name: cv.title || cv.name || cv.tag,
            description: cv.description || '',
            keywords: cv.keywords || '',
            color: cv.color || coreValueColors[cv.tag] || '#10b981'
          }))

          setProfile({
            ...res,
            coreValuesList: normalizedCV,
            stories: res.stories || [],
            timeline: res.timeline || [],
            people: res.people || [],
            products: res.products || []
          })
        } else {
          setError('Không tìm thấy thông tin tổ chức.')
        }
      })
      .catch(err => {
        console.error('Lỗi nạp dữ liệu văn hóa:', err)
        setError('Không thể kết nối đến máy chủ API. Vui lòng thử lại.')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    loadData()
  }, [])

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault()
  }

  if (loading) {
    return (
      <div className="atlas-public-experience">
        <header className="atlas-top-nav">
          <div className="atlas-nav-brand">
            <div className="atlas-logo-box">
              <svg viewBox="0 0 100 100" fill="none" width="28" height="28">
                <rect width="100" height="100" rx="22" fill="#10b981" />
                <path d="M28 72V28L52 56V28H72V72L48 44V72H28Z" fill="#ffffff" />
              </svg>
            </div>
            <div className="atlas-brand-titles">
              <span className="atlas-main-title">Nexture <small>Culture Atlas</small></span>
            </div>
          </div>
          <div className="atlas-nav-cta">
            <Link to="/login" className="btn-hub-link">Culture Hub</Link>
          </div>
        </header>

        <main className="atlas-body-wrapper" style={{ minHeight: '75vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid rgba(16, 185, 129, 0.2)', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#132e22', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Đang nạp Bản đồ Văn hóa Di sản...</h2>
          <p style={{ color: '#4d695d', fontSize: '0.95rem' }}>Đồng bộ dữ liệu thời gian thực từ PostgreSQL Database</p>
        </main>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="atlas-public-experience">
        <header className="atlas-top-nav">
          <div className="atlas-nav-brand">
            <div className="atlas-logo-box">
              <svg viewBox="0 0 100 100" fill="none" width="28" height="28">
                <rect width="100" height="100" rx="22" fill="#10b981" />
                <path d="M28 72V28L52 56V28H72V72L48 44V72H28Z" fill="#ffffff" />
              </svg>
            </div>
            <div className="atlas-brand-titles">
              <span className="atlas-main-title">Nexture <small>Culture Atlas</small></span>
            </div>
          </div>
          <div className="atlas-nav-cta">
            <Link to="/login" className="btn-hub-link">Culture Hub</Link>
          </div>
        </header>

        <main className="atlas-body-wrapper" style={{ minHeight: '75vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#132e22', marginBottom: '0.75rem' }}>Không thể kết nối máy chủ dữ liệu</h2>
          <p style={{ color: '#4d695d', maxWidth: '480px', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            {error || 'Chưa thể tải dữ liệu văn hóa từ hệ sinh thái.'}
          </p>
          <button type="button" onClick={loadData} className="atlas-hero-button" style={{ border: 'none', cursor: 'pointer' }}>
            Thử tải lại dữ liệu ↺
          </button>
        </main>
      </div>
    )
  }

  const { organization: o, coreValuesList, stories, timeline, people, products } = profile

  // Lọc dữ liệu theo Giá trị cốt lõi (selectedCoreValue) và Từ khóa tìm kiếm (searchTerm)
  const filterByCriteria = (item: AtlasItem) => {
    // 1. Lọc theo Core Value
    if (selectedCoreValue && item.coreValueTag && item.coreValueTag.toLowerCase() !== selectedCoreValue.toLowerCase()) {
      return false
    }
    // 2. Lọc theo Search Term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim()
      const inTitle = item.title.toLowerCase().includes(q)
      const inSummary = item.summary ? item.summary.toLowerCase().includes(q) : false
      const inContent = item.content ? item.content.toLowerCase().includes(q) : false
      return inTitle || inSummary || inContent
    }
    return true
  }

  const filteredTimeline = timeline.filter(filterByCriteria)
  const filteredStories = stories.filter(filterByCriteria)
  const filteredPeople = people.filter(filterByCriteria)
  const filteredProducts = products.filter(filterByCriteria)

  const totalFilteredItems =
    filteredTimeline.length + filteredStories.length + filteredPeople.length + filteredProducts.length

  return (
    <div className="atlas-public-experience">
      {/* 1. Sticky Navigation Header */}
      <header className="atlas-top-nav">
        <div className="atlas-nav-brand">
          <div className="atlas-logo-box">
            <svg viewBox="0 0 100 100" fill="none" width="28" height="28">
              <rect width="100" height="100" rx="22" fill="#10b981" />
              <path d="M28 72V28L52 56V28H72V72L48 44V72H28Z" fill="#ffffff" />
            </svg>
          </div>
          <div className="atlas-brand-titles">
            <span className="atlas-main-title">Nexture <small>Culture Atlas</small></span>
          </div>
        </div>

        <nav className="atlas-nav-links">
          <a href="#manifesto">DNA Văn hóa</a>
          <a href="#values">Giá trị cốt lõi</a>
          <a href="#timeline">Dòng thời gian</a>
          <a href="#stories">Câu chuyện</a>
          <a href="#people">Đại sứ & Lãnh đạo</a>
          <a href="#products">Sản phẩm & Di sản</a>
        </nav>

        <div className="atlas-nav-cta">
          <Link to="/login" className="btn-hub-link">
            Culture Hub
          </Link>
        </div>
      </header>

      <main className="atlas-body-wrapper">
        {/* 2. Hero Section: Định danh Doanh nghiệp & Tuyên ngôn Văn hóa */}
        <section id="manifesto" className="atlas-hero-section">
          <div className="atlas-hero-card">
            <img className="atlas-hero-photo" src={teamPhoto} width={1536} height={1024} alt="Đội ngũ cùng cộng tác trong không gian làm việc" />
            <div className="atlas-hero-content">
            <div className="hero-top-meta">
              <span className="industry-pill">{o.industry || 'CÔNG NGHỆ & QUẢN TRỊ VĂN HÓA'}</span>
              <span className="location-pill">📍 {o.location || 'TP. Hồ Chí Minh & Hà Nội'}</span>
              <span className="verified-pill">✓ Bản đồ Văn hóa Đã Xác minh</span>
            </div>

            <h1 className="atlas-hero-company-name">{o.name}</h1>
            <p className="atlas-hero-tagline">{o.shortDescription}</p>
            <div className="atlas-hero-actions"><a href="#values" className="atlas-hero-button">Khám phá Culture Atlas <span aria-hidden="true">↗</span></a><a href="#stories" className="atlas-hero-secondary">Đọc câu chuyện <span aria-hidden="true">↗</span></a></div>

            <div className="atlas-meta-bar">
              <div className="meta-col">
                <span className="meta-label">Năm khởi tạo</span>
                <span className="meta-value">{o.foundedYear || 2024}</span>
              </div>
              <div className="meta-col">
                <span className="meta-label">Quy mô nhân sự</span>
                <span className="meta-value">{o.employeeScale || '150 - 300 nhân sự'}</span>
              </div>
              <div className="meta-col">
                <span className="meta-label">Đội ngũ sáng lập</span>
                <span className="meta-value">{o.founderName || 'Đội ngũ Sáng lập NexTure'}</span>
              </div>
              {o.website && (
                <div className="meta-col">
                  <span className="meta-label">Trang thông tin</span>
                  <a href={o.website} target="_blank" rel="noreferrer" className="meta-link">
                    nexture.culture.io ↗
                  </a>
                </div>
              )}
            </div>

            {/* Tuyên ngôn Văn hóa */}
            {o.cultureManifesto && (
              <div className="culture-manifesto-box">
                <div className="manifesto-badge">TUYÊN NGÔN VĂN HÓA DOANH NGHIỆP</div>
                <blockquote className="manifesto-quote-text">
                  &ldquo;{o.cultureManifesto}&rdquo;
                </blockquote>
              </div>
            )}
            </div>
          </div>
        </section>

        <section className="atlas-editorial-intro" aria-label="Khám phá bản đồ văn hóa">
          <div className="atlas-editorial-heading"><span className="section-eyebrow">01 / KHÁM PHÁ</span><h2>Bản đồ văn hóa đang sống</h2><p>Mỗi câu chuyện, cột mốc và con người góp phần tạo nên một Nexture luôn chuyển động.</p></div>
          <div className="atlas-editorial-index">
            <a href="#stories"><span>01 / CÂU CHUYỆN</span><strong>Culture Stories</strong><small>{stories.length} câu chuyện</small></a>
            <a href="#timeline"><span>02 / CỘT MỐC</span><strong>Culture Timeline</strong><small>{timeline.length} cột mốc</small></a>
            <a href="#people"><span>03 / CON NGƯỜI</span><strong>People & Leadership</strong><small>{people.length} gương mặt</small></a>
            <a href="#products"><span>04 / SẢN PHẨM</span><strong>Products & Initiatives</strong><small>{products.length} sản phẩm</small></a>
          </div>
          <div className="atlas-editorial-feature">
            <a href="#stories" className="atlas-feature-story"><img src={collaborationPhoto} loading="lazy" width={1024} height={640} alt="Đội ngũ thảo luận và phát triển ý tưởng" /><span className="section-eyebrow">CULTURE STORIES</span><strong>{stories[0]?.title || 'Những câu chuyện định hình văn hóa'}</strong><span>{stories[0]?.summary || 'Khám phá hành trình phía sau những giá trị của Nexture.'} <b aria-hidden="true">↗</b></span></a>
            <div className="atlas-feature-side"><a href="#timeline"><span className="section-eyebrow">CULTURE TIMELINE</span><strong>{timeline[0]?.title || 'Những cột mốc của Nexture'}</strong><span>Khám phá dòng thời gian ↗</span></a><a href="#people"><img src={portraitPhoto} loading="lazy" width={816} height={816} alt="Chân dung thành viên trong một không gian làm việc" /><span><small className="section-eyebrow">PEOPLE & LEADERSHIP</small><strong>{people[0]?.title || 'Con người Nexture'}</strong><small>Gặp gỡ đội ngũ ↗</small></span></a></div>
          </div>
        </section>

        {/* 3. Tầng Giá trị Cốt lõi & La bàn Tương tác */}
        <section id="values" className="atlas-section">
          <div className="section-title-wrap">
            <div>
              <span className="section-eyebrow">CULTURAL DNA</span>
              <h2 className="section-heading-text">Bản đồ Giá trị Cốt lõi (Interactive Culture Compass)</h2>
              <p className="section-subtext">
                Nhấp vào từng Giá trị cốt lõi bên dưới để làm sáng các Câu chuyện, Cột mốc và Nhân sự minh chứng sống động.
              </p>
            </div>
            {selectedCoreValue && (
              <button
                type="button"
                className="btn-reset-filter"
                onClick={() => setSelectedCoreValue(null)}
              >
                ✕ Hủy lọc ({selectedCoreValue})
              </button>
            )}
          </div>

          <div className="core-values-cards-grid">
            {coreValuesList.map((cv: CoreValueItem) => {
              const isActive = selectedCoreValue === cv.tag
              return (
                <button
                  key={cv.id}
                  type="button"
                  className={`cv-card-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() => setSelectedCoreValue(isActive ? null : cv.tag)}
                >
                  <div className="cv-card-header">
                    <span className="cv-tag-indicator" style={{ backgroundColor: cv.color || '#10b981' }}>
                      {cv.tag}
                    </span>
                    <span className="cv-filter-action">{isActive ? '✓ Đang xem' : 'Lọc liên kết →'}</span>
                  </div>
                  <h3 className="cv-title-text">{cv.name}</h3>
                  <p className="cv-desc-text">{cv.description}</p>
                </button>
              )
            })}
          </div>

          {/* In-Atlas Search Bar */}
          <form onSubmit={handleSearchSubmit} className="atlas-search-container">
            <span className="search-icon-symbol">🔍</span>
            <input
              type="text"
              className="atlas-search-input"
              placeholder={`Tìm kiếm trong Bản đồ Văn hóa của NexTure (cột mốc, bài học sáng lập, câu chuyện văn hóa, đại sứ...)`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setSearchTerm('')}
              >
                Xóa
              </button>
            )}
          </form>

          {/* Filter Status Feedback */}
          {(selectedCoreValue || searchTerm) && (
            <div className="active-filter-feedback">
              <span>
                Đang hiển thị <b>{totalFilteredItems}</b> nội dung phù hợp với:{' '}
                {selectedCoreValue && <span className="filter-pill-tag">Giá trị: {selectedCoreValue}</span>}
                {searchTerm && <span className="filter-pill-tag">Từ khóa: &ldquo;{searchTerm}&rdquo;</span>}
              </span>
              <button
                type="button"
                className="link-clear-all"
                onClick={() => {
                  setSelectedCoreValue(null)
                  setSearchTerm('')
                }}
              >
                Xem toàn bộ Bản đồ
              </button>
            </div>
          )}
        </section>

        {/* 4. Tầng Dòng thời gian Văn hóa (Culture Timeline) */}
        <section id="timeline" className="atlas-section">
          <div className="section-title-wrap">
            <div>
              <span className="section-eyebrow">LỊCH SỬ HÌNH THÀNH</span>
              <h2 className="section-heading-text">Culture Timeline — Dòng thời gian Văn hóa</h2>
              <p className="section-subtext">
                Các bước ngoặt lịch sử, quyết định đạo đức và cột mốc tôi luyện nên tinh thần NexTure.
              </p>
            </div>
            <span className="count-pill-badge">{filteredTimeline.length} cột mốc</span>
          </div>

          {filteredTimeline.length === 0 ? (
            <div className="empty-filter-state">Không có sự kiện nào khớp với bộ lọc đang chọn.</div>
          ) : (
            <div className="atlas-timeline-stream">
              {filteredTimeline.map(e => (
                <div className="timeline-stream-item" key={e.id}>
                  <div className="timeline-left-node">
                    <div className="timeline-bullet-point" />
                    <span className="timeline-year-text">
                      {e.occurredAt ? new Date(e.occurredAt).getFullYear() : '2024'}
                    </span>
                  </div>
                  <div className="timeline-card-content">
                    <div className="timeline-card-header">
                      {e.summary && <span className="event-type-badge">{e.summary}</span>}
                      {e.coreValueTag && (
                        <span className="cv-relation-badge">Giá trị: {e.coreValueTag}</span>
                      )}
                    </div>
                    <h3 className="timeline-event-title">{e.title}</h3>
                    <p className="timeline-event-content">{e.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 5. Tầng Câu chuyện Văn hóa Chiều sâu (Culture Stories) */}
        <section id="stories" className="atlas-section">
          <div className="section-title-wrap">
            <div>
              <span className="section-eyebrow">KÝ ỨC VĂN HÓA</span>
              <h2 className="section-heading-text">Culture Stories — Câu chuyện Văn hóa Chiều sâu</h2>
              <p className="section-subtext">
                Những ký ức lập nghiệp, bài học vượt qua khủng hoảng và triết lý sống động được bảo tồn vĩnh cửu.
              </p>
            </div>
            <span className="count-pill-badge">{filteredStories.length} câu chuyện</span>
          </div>

          {filteredStories.length === 0 ? (
            <div className="empty-filter-state">Không có câu chuyện nào khớp với bộ lọc đang chọn.</div>
          ) : (
            <div className="atlas-stories-grid">
              {filteredStories.map(s => (
                <article className="atlas-story-card" key={s.id}>
                  <div className="story-card-top">
                    <span className="story-pill-type">STORY · v{s.version}</span>
                    {s.coreValueTag && (
                      <span className="cv-relation-badge">DNA: {s.coreValueTag}</span>
                    )}
                  </div>
                  <h3 className="atlas-story-title">{s.title}</h3>
                  {s.summary && <p className="atlas-story-summary">{s.summary}</p>}
                  <p className="atlas-story-snippet">{s.content?.slice(0, 180)}…</p>

                  <div className="atlas-story-card-footer">
                    <button
                      type="button"
                      className="btn-read-story"
                      onClick={() => setActiveStory(s)}
                    >
                      Đọc câu chuyện đầy đủ →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* 6. Tầng Con người & Đại sứ Văn hóa (People & Leadership) */}
        <section id="people" className="atlas-section">
          <div className="section-title-wrap">
            <div>
              <span className="section-eyebrow">CON NGƯỜI & LÃNH ĐẠO</span>
              <h2 className="section-heading-text">People & Leadership — Đại sứ Văn hóa</h2>
              <p className="section-subtext">
                Những gương mặt tiêu biểu thực hành giá trị văn hóa và truyền cảm hứng cho toàn thể tổ chức.
              </p>
            </div>
            <span className="count-pill-badge">{filteredPeople.length} đại sứ</span>
          </div>

          {filteredPeople.length === 0 ? (
            <div className="empty-filter-state">Không có nhân vật nào khớp với bộ lọc đang chọn.</div>
          ) : (
            <div className="atlas-people-grid">
              {filteredPeople.map(p => (
                <article className="atlas-person-card" key={p.id}>
                  <div className="person-avatar-circle-large">{p.title.slice(0, 1)}</div>
                  <h3 className="atlas-person-name">{p.title}</h3>
                  <span className="atlas-person-role">{p.summary}</span>
                  <blockquote className="atlas-person-quote">
                    &ldquo;{p.content}&rdquo;
                  </blockquote>
                  {p.coreValueTag && (
                    <span className="person-cv-pill">Đại diện cho: {p.coreValueTag}</span>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* 7. Tầng Sản phẩm, Dự án & Di sản (Products & Initiatives) */}
        <section id="products" className="atlas-section">
          <div className="section-title-wrap">
            <div>
              <span className="section-eyebrow">CÔNG TRÌNH VĂN HÓA</span>
              <h2 className="section-heading-text">Products & Initiatives — Sản phẩm & Sáng kiến Di sản</h2>
              <p className="section-subtext">
                Các sản phẩm công nghệ và sáng kiến phụng sự sứ mệnh số hóa di sản của NexTure.
              </p>
            </div>
            <span className="count-pill-badge">{filteredProducts.length} sản phẩm</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-filter-state">Không có sản phẩm nào khớp với bộ lọc đang chọn.</div>
          ) : (
            <div className="atlas-products-grid">
              {filteredProducts.map(pr => (
                <article className="atlas-product-card" key={pr.id}>
                  <div className="product-card-top-row">
                    <span className="product-kind-badge">{pr.summary || 'DI SẢN SẢN PHẨM'}</span>
                    {pr.coreValueTag && (
                      <span className="cv-relation-badge">Giá trị: {pr.coreValueTag}</span>
                    )}
                  </div>
                  <h3 className="atlas-product-name">{pr.title}</h3>
                  <p className="atlas-product-desc">{pr.content}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* 8. Call to Action Footer */}
        <footer className="atlas-public-footer">
          <div className="footer-callout">
            <span className="footer-tag">HỆ SINH THÁI NEXTURE</span>
            <h2 className="footer-heading">Quản trị & Kiến tạo Bản đồ Văn hóa cho Doanh nghiệp</h2>
            <p className="footer-desc">
              Khởi tạo không gian Culture Hub nội bộ để thu thập tư liệu, ứng dụng AI để cấu trúc di sản, và xuất bản Bản đồ Văn hóa độc lập, bất biến để lan tỏa niềm tin ra cộng đồng.
            </p>
            <div className="footer-cta-buttons">
              <Link to="/login" className="btn-footer-primary">
                Truy cập NexTure Culture Hub →
              </Link>
            </div>
          </div>
          <div className="footer-bottom-row">
            <span>© 2024 NexTure Technology. Bản quyền thuộc về nền tảng Culture Hub & Culture Atlas.</span>
            <span>Bảo tồn Di sản Văn hóa Doanh nghiệp Số hóa</span>
          </div>
        </footer>
      </main>

      {/* 9. Story Reader Modal — Trải nghiệm đọc sâu không gián đoạn */}
      {activeStory && (
        <div className="story-reader-backdrop" onClick={() => setActiveStory(null)}>
          <div className="story-reader-modal" onClick={e => e.stopPropagation()}>
            <div className="reader-modal-header">
              <div className="reader-meta">
                <span className="reader-pill">STORY · v{activeStory.version}</span>
                {activeStory.coreValueTag && (
                  <span className="cv-relation-badge">DNA: {activeStory.coreValueTag}</span>
                )}
                {activeStory.occurredAt && (
                  <span className="reader-date">
                    Thời điểm: {new Date(activeStory.occurredAt).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="btn-close-reader"
                onClick={() => setActiveStory(null)}
              >
                ✕
              </button>
            </div>

            <div className="reader-modal-body">
              <h1 className="reader-title">{activeStory.title}</h1>
              {activeStory.summary && (
                <div className="reader-lead-summary">
                  <b>Thông điệp cốt lõi:</b> {activeStory.summary}
                </div>
              )}

              <div className="reader-narrative-text">
                {activeStory.content?.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              {activeStory.relatedEntities && activeStory.relatedEntities.length > 0 && (
                <div className="reader-related-entities">
                  <b>Thực thể liên quan:</b>
                  <div className="related-tags-list">
                    {activeStory.relatedEntities.map(rel => (
                      <span key={rel} className="rel-tag">
                        {rel}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="reader-modal-footer">
              <button
                type="button"
                className="btn-done-reading"
                onClick={() => setActiveStory(null)}
              >
                Đóng bài đọc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
