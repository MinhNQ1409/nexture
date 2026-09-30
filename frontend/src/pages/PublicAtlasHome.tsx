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

const FALLBACK_PROFILE: CompanyProfile = {
  organization: {
    name: 'NexTure Technology',
    slug: 'nexture-technology',
    foundedYear: 2024,
    industry: 'Nền tảng Quản trị & Di sản Văn hóa Doanh nghiệp',
    employeeScale: '150 - 300 nhân sự',
    location: 'TP. Hồ Chí Minh & Hà Nội, Việt Nam',
    website: 'https://nexture.culture.io',
    shortDescription: 'Tiên phong kiến tạo nền tảng Culture Hub và Culture Atlas số hóa di sản văn hóa doanh nghiệp tại Đông Nam Á.',
    founderName: 'Đội ngũ Sáng lập NexTure',
    coreValues: 'Trust · Learning · Creativity · Empathy',
    cultureManifesto: 'Văn hóa không phải là văn mẫu đóng khung trên tường, mà là tập hợp những quyết định trung thực, dũng cảm và tử tế được thực hành mỗi ngày ngay cả khi không có ai giám sát.'
  },
  coreValuesList: [
    { id: '1', tag: 'Trust', name: 'Niềm tin & Toàn vẹn', description: 'Minh bạch tuyệt đối, dám nhận trách nhiệm và luôn giữ trọn cam kết với đồng đội và đối tác.', keywords: 'Trung thực · Minh bạch · Trách nhiệm', color: '#10b981' },
    { id: '2', tag: 'Learning', name: 'Học hỏi & Đổi mới', description: 'Tinh thần cởi mở trước cái mới, không giấu dốt và sẵn sàng học hỏi từ những thất bại thực tế.', keywords: 'Cải tiến · Phản biện · Đổi mới', color: '#0ea5e9' },
    { id: '3', tag: 'Creativity', name: 'Sáng tạo & Đột phá', description: 'Tìm kiếm giải pháp khác biệt cho các bài toán khó, không đi theo lối mòn tư duy truyền thống.', keywords: 'Đột phá · Khác biệt · Tinh gọn', color: '#f59e0b' },
    { id: '4', tag: 'Empathy', name: 'Thấu cảm & Tử tế', description: 'Lắng nghe sâu sắc, đặt mình vào vị trí của người khác và đối xử tử tế trong mọi tương tác.', keywords: 'Tử tế · Lắng nghe · Đồng hành', color: '#ec4899' }
  ],
  stories: [
    {
      id: 's1',
      entityType: 'STORY',
      slug: 'khat-vong-so-hoa-dna-van-hoa-doanh-nghiep',
      title: 'Khát vọng Số hóa DNA Văn hóa Doanh nghiệp',
      summary: 'Hành trình ra đời từ trăn trở trước sự đứt gãy ký ức và mất mát di sản văn hóa của các doanh nghiệp Việt Nam khi thế hệ sáng lập lui về hậu trường.',
      content: 'Đầu năm 2024, trong những buổi cà phê dài tại Sài Gòn, đội ngũ sáng lập NexTure nhận ra một thực tế đau lòng: Rất nhiều doanh nghiệp Việt Nam sau 10, 20 năm phát triển rực rỡ bỗng rơi vào khủng hoảng khi thế hệ sáng lập lui về hậu trường. Những bài học xương máu, những đêm thức trắng lập nghiệp, triết lý ứng xử với khách hàng và tinh thần phụng sự dường như chỉ nằm trong ký ức của một vài người và dần tan biến theo năm tháng. Thế hệ nhân sự kế cận bước vào công ty chỉ nhìn thấy những tấm bảng khẩu hiệu khô khan đóng khung trên tường, hoàn toàn không cảm nhận được ngọn lửa đã tạo nên tổ chức. NexTure ra đời từ chính niềm tin cháy bỏng: Văn hóa không phải là văn mẫu, mà là một loại tài sản vô hình quý giá nhất của doanh nghiệp. Cần có một Digital Culture Hub để ghi nhận văn hóa ngay từ khi nó đang hình thành, và một Culture Atlas để biến những giá trị vô hình đó thành một tấm bản đồ di sản sống động, minh bạch và trường tồn.',
      occurredAt: '2024-01-15T00:00:00Z',
      coreValueTag: 'Trust',
      version: 1
    },
    {
      id: 's2',
      entityType: 'STORY',
      slug: 'tranh-luan-luong-tam-ai-phuc-vu-di-san',
      title: 'Tranh luận Lương tâm: AI phục vụ Di sản, Không thay thế Con người',
      summary: 'Cuộc tranh luận nảy lửa suốt 6 giờ đêm về giới hạn của AI trong việc bảo tồn ký ức văn hóa và nguyên tắc con người luôn là mắt xích kiểm chứng cuối cùng.',
      content: 'Trong giai đoạn phát triển tính năng AI Structuring cho Culture Hub, đội ngũ kỹ sư của NexTure từng đối mặt với một cám dỗ công nghệ lớn: Tự động hóa 100%. Khi đó, AI có thể tự đọc tài liệu, tự bịa thêm các chi tiết cảm xúc và tự động xuất bản câu chuyện lên Culture Atlas chỉ sau một cú nhấp chuột. Trong buổi họp đêm căng thẳng kéo dài hơn 6 tiếng tại văn phòng, ban sáng lập đã đưa ra một quyết định mang tính bản lề cho đạo đức sản phẩm: Tuyệt đối không để AI tự tạo dữ liệu văn hóa chính thức. Văn hóa là sự thật, là trải nghiệm sống của con người, không thuật toán nào có quyền tự ý tô vẽ hay thêu dệt ký ức. NexTure thiết lập nguyên tắc bất biến: AI chỉ đóng vai trò là người thư ký mẫn cán giúp cấu trúc dữ liệu thô (AI_SUGGESTED). Con người bắt buộc phải là người đọc lại, kiểm chứng sự thật (VERIFIED), và chính Admin mới là người quyết định tạo bản snapshot xuất bản (PUBLISHED). Sự thận trọng này chính là lời cam kết cao nhất của NexTure về tính chân thực của lịch sử.',
      occurredAt: '2024-03-20T00:00:00Z',
      coreValueTag: 'Learning',
      version: 1
    },
    {
      id: 's3',
      entityType: 'STORY',
      slug: 'van-hoa-dong-sang-tao-va-lang-nghe-khong-khoang-cach',
      title: 'Văn hóa Đồng sáng tạo và Lắng nghe Không khoảng cách',
      summary: 'Xóa bỏ tháp quyền lực để mọi cá nhân từ thực tập sinh đến nhà sáng lập đều có quyền ghi nhận di sản văn hóa và đóng góp vào thư viện chung.',
      content: 'Làm thế nào một công ty công nghệ văn hóa có thể thực hành chính xác những gì mình rao giảng cho khách hàng? Tại NexTure, chúng tôi từ chối mô hình văn hóa chỉ đạo từ trên xuống. Một nét văn hóa độc đáo đã được thiết lập: Bất kỳ thành viên nào — từ một bạn thực tập sinh tuần đầu tiên đến thành viên sáng lập — đều có quyền đóng góp câu chuyện, hình ảnh, bài học kinh nghiệm vào Culture Library. Những khoảnh khắc đồng đội hỗ trợ nhau gỡ lỗi lúc nửa đêm, câu chuyện một bạn chăm sóc khách hàng kiên nhẫn lắng nghe lời phàn nàn suốt 2 tiếng... tất cả đều được trân trọng và lưu giữ bình đẳng. Văn hóa tại NexTure được nuôi dưỡng bằng sự thấu cảm hàng ngày. Chúng tôi tin rằng, văn hóa mạnh mẽ nhất không đến từ các bài phát biểu của CEO, mà đến từ hàng ngàn hành động tử tế vô danh của từng con người trong tổ chức.',
      occurredAt: '2024-06-01T00:00:00Z',
      coreValueTag: 'Empathy',
      version: 1
    },
    {
      id: 's4',
      entityType: 'STORY',
      slug: 'khung-hoang-ban-phat-hanh-dau-tien',
      title: 'Khủng hoảng Bản phát hành đầu tiên: Bài học về Niềm tin và Sự Minh bạch',
      summary: 'Sự cố kỹ thuật nghiêm trọng trong đợt thử nghiệm đầu tiên và bước ngoặt thức trắng 3 đêm khai sinh ra kiến trúc Snapshot bất biến bảo vệ dữ liệu vĩnh cửu.',
      content: 'Tháng 5/2024, chỉ 48 giờ trước khi bàn giao hệ thống thí điểm cho khách hàng doanh nghiệp đầu tiên, hệ thống đồng bộ dữ liệu giữa Hub và Atlas gặp lỗi đồng thời (race condition) khiến một số dữ liệu đang chỉnh sửa nháp bị rò rỉ ra trang hiển thị bên ngoài. Thay vì tìm cách che giấu hay đổ lỗi cho hạ tầng, đội ngũ sáng lập đã chọn con đường dũng cảm nhất: Chủ động gọi điện nhận trách nhiệm với ban giám đốc đối tác, giải thích rõ nguyên nhân kỹ thuật và xin thêm 72 giờ để thiết kế lại toàn bộ cơ chế bảo mật. Suốt 3 ngày 3 đêm sau đó, toàn bộ đội ngũ kỹ thuật thức trắng trong văn phòng, ăn mì gói và vẽ lại luồng dữ liệu. Đó là thời khắc khai sinh ra kiến trúc Immutable Publication Snapshot (Bản chụp ấn phẩm độc lập): Tách rời hoàn toàn bản ghi đang sửa đổi trong Hub với bản chụp công khai trên Atlas. Khách hàng đối tác không những không hủy hợp đồng mà còn gửi lời khen ngợi đặc biệt cho sự trung thực và tính chuyên nghiệp của NexTure.',
      occurredAt: '2024-05-25T00:00:00Z',
      coreValueTag: 'Creativity',
      version: 1
    }
  ],
  timeline: [
    { id: 'e1', entityType: 'EVENT', slug: 'khoi-tao-nexture', title: 'Khởi tạo NexTure và sứ mệnh Digital Culture Hub', summary: 'Chính thức thành lập tại TP. Hồ Chí Minh với niềm tin đưa văn hóa doanh nghiệp thành năng lực cạnh tranh cốt lõi và di sản số của người Việt.', content: 'Chính thức thành lập tại TP. Hồ Chí Minh với niềm tin đưa văn hóa doanh nghiệp thành năng lực cạnh tranh cốt lõi và di sản số của người Việt.', occurredAt: '2024-01-10T00:00:00Z', coreValueTag: 'Trust', version: 1 },
    { id: 'e2', entityType: 'EVENT', slug: 'quyet-dinh-dao-duc-human-in-the-loop', title: 'Quyết định Đạo đức: Thiết lập nguyên tắc Human-in-the-loop cho AI', summary: 'Khẳng định cam kết lương tâm: AI chỉ đóng vai trò phân tích gợi ý, con người luôn là mắt xích kiểm chứng cuối cùng.', content: 'Khẳng định cam kết lương tâm: AI chỉ đóng vai trò phân tích gợi ý, con người luôn là mắt xích kiểm chứng cuối cùng để bảo đảm tính chân thực của văn hóa.', occurredAt: '2024-03-25T00:00:00Z', coreValueTag: 'Learning', version: 1 },
    { id: 'e3', entityType: 'EVENT', slug: 'phat-minh-kien-truc-immutable-snapshot', title: 'Phát minh Kiến trúc Immutable Publication Snapshot', summary: 'Tách rời hoàn toàn bản ghi đang chỉnh sửa nội bộ trong Hub với bản chụp công khai trên Atlas.', content: 'Tách rời hoàn toàn bản ghi đang chỉnh sửa nội bộ trong Hub với bản chụp công khai trên Atlas, giúp dữ liệu công khai luôn an toàn và bất biến.', occurredAt: '2024-05-28T00:00:00Z', coreValueTag: 'Creativity', version: 1 },
    { id: 'e4', entityType: 'EVENT', slug: 'kiem-thu-pilot-10-doanh-nghiep', title: 'Hoàn thành Kiểm thử Pilot thành công với 10 doanh nghiệp SME', summary: '10 doanh nghiệp thí điểm hoàn tất trọn vẹn chuỗi: Thu thập tài liệu -> AI phân tích -> Phê duyệt -> Culture Timeline -> Xuất bản Culture Atlas.', content: '10 doanh nghiệp thí điểm hoàn tất trọn vẹn chuỗi: Thu thập tài liệu -> AI phân tích -> Phê duyệt -> Culture Timeline -> Xuất bản Culture Atlas.', occurredAt: '2024-07-15T00:00:00Z', coreValueTag: 'Trust', version: 1 },
    { id: 'e5', entityType: 'EVENT', slug: 'ra-mat-culture-atlas-v2', title: 'Chính thức ra mắt Bản đồ Văn hóa — NexTure Culture Atlas V2', summary: 'Xuất bản phiên bản công khai hoàn chỉnh, mở ra kỷ nguyên mới cho việc quản trị và lan tỏa văn hóa doanh nghiệp tại Việt Nam.', content: 'Xuất bản phiên bản công khai hoàn chỉnh, mở ra kỷ nguyên mới cho việc quản trị và lan tỏa văn hóa doanh nghiệp tại Việt Nam.', occurredAt: '2024-09-30T00:00:00Z', coreValueTag: 'Empathy', version: 1 }
  ],
  people: [
    { id: 'p1', entityType: 'PERSON', slug: 'tran-minh-duc', title: 'Trần Minh Đức', summary: 'Đồng sáng lập & Giám đốc Sản phẩm Văn hóa', content: 'Hơn 12 năm kinh nghiệm trong lĩnh vực tư vấn chuyển đổi tổ chức và xây dựng văn hóa doanh nghiệp tại Đông Nam Á. Văn hóa không phải là những khẩu hiệu trên tường, mà là những gì chúng ta lựa chọn hành động khi không có ai giám sát.', coreValueTag: 'Trust', version: 1 },
    { id: 'p2', entityType: 'PERSON', slug: 'nguyen-hoang-mai', title: 'Nguyễn Hoàng Mai', summary: 'Trưởng nhóm Nghiên cứu AI & Dữ liệu Tri thức', content: 'Tiến sĩ Khoa học Máy tính chuyên sâu về Xử lý Ngôn ngữ Tự nhiên và Hệ thống Tri thức Ngữ nghĩa. AI phải học cách thấu hiểu chiều sâu ngôn từ và cảm xúc văn hóa Việt Nam, thay vì chỉ là các phép toán số liệu đơn thuần.', coreValueTag: 'Learning', version: 1 },
    { id: 'p3', entityType: 'PERSON', slug: 'le-khac-hung', title: 'Lê Khắc Hùng', summary: 'Kiến trúc sư Trưởng Hệ thống & Bảo mật Dữ liệu', content: 'Chuyên gia kiến trúc hệ thống dữ liệu phân tán với nguyên tắc bảo mật và toàn vẹn dữ liệu ở cấp độ cao nhất. Sự trung thực trong kỹ thuật và tính toàn vẹn của dữ liệu văn hóa là cam kết sống còn của chúng tôi với khách hàng.', coreValueTag: 'Creativity', version: 1 }
  ],
  products: [
    { id: 'pr1', entityType: 'PRODUCT', slug: 'nexture-digital-culture-hub', title: 'NexTure Digital Culture Hub', summary: 'Nền tảng Doanh nghiệp (Enterprise Platform)', content: 'Không gian quản trị và AI cấu trúc dữ liệu di sản văn hóa nội bộ, giúp doanh nghiệp ghi nhận và kiểm duyệt văn hóa ngay từ khi đang hình thành.', coreValueTag: 'Trust', version: 1 },
    { id: 'pr2', entityType: 'PRODUCT', slug: 'nexture-culture-atlas', title: 'NexTure Culture Atlas', summary: 'Bản đồ Văn hóa Công khai (Public Atlas)', content: 'Cổng Bản đồ Văn hóa Doanh nghiệp công khai, trực quan hóa toàn bộ câu chuyện, con người, dòng thời gian và giá trị cốt lõi ra thế giới.', coreValueTag: 'Creativity', version: 1 },
    { id: 'pr3', entityType: 'PRODUCT', slug: 'responsible-ai-structuring-engine', title: 'Responsible AI Structuring Engine', summary: 'Sáng kiến Công nghệ AI (AI Initiative)', content: 'Bộ máy AI phân tích tài liệu văn hóa thô với nguyên tắc bảo vệ quyền riêng tư và đảm bảo con người luôn là mắt xích kiểm duyệt tối thượng.', coreValueTag: 'Learning', version: 1 }
  ]
}

export default function PublicAtlasHome() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [selectedCoreValue, setSelectedCoreValue] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeStory, setActiveStory] = useState<AtlasItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUsingFallback, setIsUsingFallback] = useState(false)

  function loadData() {
    setLoading(true)
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
          setIsUsingFallback(false)
        } else {
          setProfile(FALLBACK_PROFILE)
          setIsUsingFallback(true)
        }
      })
      .catch(err => {
        console.warn('Không thể kết nối đến máy chủ API, tự động nạp dữ liệu di sản văn hóa dự phòng:', err)
        setProfile(FALLBACK_PROFILE)
        setIsUsingFallback(true)
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

  if (!profile) {
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
          <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#132e22', marginBottom: '0.75rem' }}>Không thể kết nối máy chủ dữ liệu</h2>
          <p style={{ color: '#4d695d', maxWidth: '480px', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            Chưa thể tải dữ liệu văn hóa từ hệ sinh thái.
          </p>
          <button type="button" onClick={loadData} className="atlas-hero-button" style={{ border: 'none', cursor: 'pointer' }}>
            Thử tải lại dữ liệu
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
          <a href="#manifesto">Văn hóa</a>
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

      {isUsingFallback && (
        <div style={{ background: '#ecfdf5', color: '#065f46', borderBottom: '1px solid #a7f3d0', padding: '0.625rem 1rem', fontSize: '0.85rem', textAlign: 'center', fontWeight: 500 }}>
          Bản đồ Văn hóa NexTure (Chế độ xem trước). Dữ liệu sẽ tự động đồng bộ thời gian thực khi kết nối với máy chủ API.
        </div>
      )}

      <main className="atlas-body-wrapper">
        {/* 2. Hero Section: Định danh Doanh nghiệp & Tuyên ngôn Văn hóa */}
        <section id="manifesto" className="atlas-hero-section">
          <div className="atlas-hero-card">
            <img className="atlas-hero-photo" src={teamPhoto} width={1536} height={1024} alt="Đội ngũ cùng cộng tác trong không gian làm việc" />
            <div className="atlas-hero-content">
            <div className="hero-top-meta">
              <span className="industry-pill">{o.industry || 'CÔNG NGHỆ & QUẢN TRỊ VĂN HÓA'}</span>
              <span className="location-pill">{o.location || 'TP. Hồ Chí Minh & Hà Nội'}</span>
              <span className="verified-pill">Bản đồ Văn hóa Đã Xác minh</span>
            </div>

            <h1 className="atlas-hero-company-name">{o.name}</h1>
            <p className="atlas-hero-tagline">{o.shortDescription}</p>
            <div className="atlas-hero-actions"><a href="#values" className="atlas-hero-button">Khám phá Culture Atlas</a><a href="#stories" className="atlas-hero-secondary">Đọc câu chuyện</a></div>

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
          </div>

          {filteredStories.length === 0 ? (
            <div className="empty-filter-state">Không có câu chuyện nào khớp với bộ lọc đang chọn.</div>
          ) : (
            <div className="atlas-stories-grid">
              {filteredStories.map(s => (
                <article className="atlas-story-card" key={s.id}>
                  <div className="story-card-top">
                    {s.coreValueTag && (
                      <span className="cv-relation-badge">{s.coreValueTag}</span>
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
                      Đọc câu chuyện đầy đủ
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
                {activeStory.coreValueTag && (
                  <span className="cv-relation-badge">{activeStory.coreValueTag}</span>
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
                Đóng
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
