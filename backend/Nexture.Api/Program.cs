using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Nexture.Api.Data;
using Nexture.Api.Endpoints;
using Nexture.Api.Models;
using Nexture.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<OrganizationAccess>();
builder.Services.AddScoped<IAiStructuringService, MockAiStructuringService>();

var jwtKey = builder.Configuration["Jwt:Key"] ?? "DEV_ONLY_CHANGE_THIS_KEY_12345678901234567890";
var issuer = builder.Configuration["Jwt:Issuer"] ?? "nexture";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true, ValidateAudience = true, ValidateLifetime = true, ValidateIssuerSigningKey = true,
            ValidIssuer = issuer, ValidAudience = issuer,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });
builder.Services.AddAuthorization();
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.AllowAnyHeader().AllowAnyMethod().SetIsOriginAllowed(_ => true).AllowCredentials()));

var app = builder.Build();
app.UseCors();
app.UseStaticFiles();
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "uploads");
Directory.CreateDirectory(uploadsPath);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});
app.UseAuthentication();
app.UseAuthorization();
app.UseSwagger();
app.UseSwaggerUI();

app.MapAuthEndpoints();
app.MapOrganizationEndpoints();
app.MapContentEndpoints();
app.MapLibraryAiReviewEndpoints();
app.MapTimelineDashboardEndpoints();
app.MapAtlasEndpoints();

await SeedAsync(app);

app.Run();

static async Task SeedAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.EnsureCreatedAsync();

    // 1. Tự động bổ sung các cột mới vào PostgreSQL nếu chưa tồn tại
    try
    {
        await db.Database.ExecuteSqlRawAsync(@"
            ALTER TABLE ""Organizations"" ADD COLUMN IF NOT EXISTS ""CultureManifesto"" text;
            ALTER TABLE ""Organizations"" ADD COLUMN IF NOT EXISTS ""Location"" text;
            ALTER TABLE ""Organizations"" ADD COLUMN IF NOT EXISTS ""CoreValuesListJson"" text;
            ALTER TABLE ""Stories"" ADD COLUMN IF NOT EXISTS ""CoreValueTag"" text;
            ALTER TABLE ""Events"" ADD COLUMN IF NOT EXISTS ""CoreValueTag"" text;
            ALTER TABLE ""People"" ADD COLUMN IF NOT EXISTS ""CoreValueTag"" text;
            ALTER TABLE ""ProductsProjects"" ADD COLUMN IF NOT EXISTS ""CoreValueTag"" text;
            ALTER TABLE ""AtlasPublications"" ADD COLUMN IF NOT EXISTS ""CoreValueTag"" text;
            ALTER TABLE ""MediaAssets"" ADD COLUMN IF NOT EXISTS ""CoreValueTag"" text;
            ALTER TABLE ""Sources"" ADD COLUMN IF NOT EXISTS ""CoreValueTag"" text;
        ");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"DB Migration note: {ex.Message}");
    }

    var nextureLogo = "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" fill=\"none\"><rect width=\"100\" height=\"100\" rx=\"22\" fill=\"%2314241b\"/><path d=\"M28 72V28L52 56V28H72V72L48 44V72H28Z\" fill=\"%2310b981\"/></svg>";
    var manifesto = "Văn hóa không phải là văn mẫu đóng khung trên tường, mà là tập hợp những quyết định trung thực, dũng cảm và tử tế được thực hành mỗi ngày ngay cả khi không có ai giám sát.";
    var location = "TP. Hồ Chí Minh & Hà Nội, Việt Nam";
    var coreValuesJson = System.Text.Json.JsonSerializer.Serialize(new[]
    {
        new { tag = "Trust", title = "Niềm tin & Toàn vẹn", description = "Minh bạch tuyệt đối, dám nhận trách nhiệm và luôn giữ trọn cam kết với đồng đội và đối tác.", keywords = "Trung thực · Minh bạch · Trách nhiệm" },
        new { tag = "Learning", title = "Học hỏi & Đổi mới", description = "Tinh thần cởi mở trước cái mới, không giấu dốt và sẵn sàng học hỏi từ những thất bại thực tế.", keywords = "Cải tiến · Phản biện · Đổi mới" },
        new { tag = "Creativity", title = "Sáng tạo & Đột phá", description = "Tìm kiếm giải pháp khác biệt cho các bài toán khó, không đi theo lối mòn tư duy truyền thống.", keywords = "Đột phá · Khác biệt · Tinh gọn" },
        new { tag = "Empathy", title = "Thấu cảm & Tử tế", description = "Lắng nghe sâu sắc, đặt mình vào vị trí của người khác và đối xử tử tế trong mọi tương tác.", keywords = "Tử tế · Lắng nghe · Đồng hành" }
    });

    if (!await db.Users.AnyAsync())
    {
        var user = new AppUser { Email = "admin@example.com", DisplayName = "NexTure Admin" };
        var hasher = new PasswordHasher<AppUser>();
        user.PasswordHash = hasher.HashPassword(user, "ChangeMe123!");
        db.Users.Add(user);

        // Duy nhất 1 doanh nghiệp: NexTure Technology
        var org = new Organization
        {
            Name = "NexTure Technology", Slug = "nexture-technology", LogoUrl = nextureLogo, FoundedYear = 2024,
            Industry = "Nền tảng Quản trị & Di sản Văn hóa Doanh nghiệp", EmployeeScale = "150 - 300 nhân sự",
            Website = "https://nexture.culture.io",
            ShortDescription = "Tiên phong kiến tạo nền tảng Culture Hub và Culture Atlas số hóa di sản văn hóa doanh nghiệp tại Đông Nam Á.",
            FounderName = "Đội ngũ Sáng lập NexTure", CoreValues = "Trust · Learning · Creativity · Empathy",
            CultureManifesto = manifesto, Location = location, CoreValuesListJson = coreValuesJson,
            AtlasEnabled = true
        };
        db.Organizations.Add(org);
        db.OrganizationMembers.Add(new OrganizationMember { OrganizationId = org.Id, UserId = user.Id, Role = MemberRole.ADMIN });

        // 4 Câu chuyện văn hóa chiều sâu, cảm xúc, hoàn chỉnh
        var s1 = new Story
        {
            OrganizationId = org.Id,
            Title = "Khát vọng Số hóa DNA Văn hóa Doanh nghiệp",
            StoryType = "FOUNDER_STORY",
            CoreValueTag = "Trust",
            Summary = "Hành trình ra đời từ trăn trở trước sự đứt gãy ký ức và mất mát di sản văn hóa của các doanh nghiệp Việt Nam khi thế hệ sáng lập lui về hậu trường.",
            Content = "Đầu năm 2024, trong những buổi cà phê dài tại Sài Gòn, đội ngũ sáng lập NexTure nhận ra một thực tế đau lòng: Rất nhiều doanh nghiệp Việt Nam sau 10, 20 năm phát triển rực rỡ bỗng rơi vào khủng hoảng khi thế hệ sáng lập lui về hậu trường. Những bài học xương máu, những đêm thức trắng lập nghiệp, triết lý ứng xử với khách hàng và tinh thần phụng sự dường như chỉ nằm trong ký ức của một vài người và dần tan biến theo năm tháng. Thế hệ nhân sự kế cận bước vào công ty chỉ nhìn thấy những tấm bảng khẩu hiệu khô khan đóng khung trên tường, hoàn toàn không cảm nhận được 'ngọn lửa' đã tạo nên tổ chức. NexTure ra đời từ chính niềm tin cháy bỏng: Văn hóa không phải là văn mẫu, mà là một loại tài sản vô hình quý giá nhất của doanh nghiệp. Cần có một Digital Culture Hub để ghi nhận văn hóa ngay từ khi nó đang hình thành, và một Culture Atlas để biến những giá trị vô hình đó thành một tấm bản đồ di sản sống động, minh bạch và trường tồn.",
            Status = ContentStatus.VERIFIED,
            Visibility = Visibility.PUBLIC,
            OccurredAt = new DateTimeOffset(2024, 1, 15, 0, 0, 0, TimeSpan.Zero)
        };

        var s2 = new Story
        {
            OrganizationId = org.Id,
            Title = "Tranh luận Lương tâm: AI phục vụ Di sản, Không thay thế Con người",
            StoryType = "CULTURE_STORY",
            CoreValueTag = "Learning",
            Summary = "Cuộc tranh luận nảy lửa suốt 6 giờ đêm về giới hạn của AI trong việc bảo tồn ký ức văn hóa và nguyên tắc con người luôn là mắt xích kiểm chứng cuối cùng.",
            Content = "Trong giai đoạn phát triển tính năng AI Structuring cho Culture Hub, đội ngũ kỹ sư của NexTure từng đối mặt với một cám dỗ công nghệ lớn: Tự động hóa 100%. Khi đó, AI có thể tự đọc tài liệu, tự bịa thêm các chi tiết cảm xúc và tự động xuất bản câu chuyện lên Culture Atlas chỉ sau một cú nhấp chuột. Trong buổi họp đêm căng thẳng kéo dài hơn 6 tiếng tại văn phòng, ban sáng lập đã đưa ra một quyết định mang tính bản lề cho đạo đức sản phẩm: Tuyệt đối không để AI tự tạo dữ liệu văn hóa chính thức. Văn hóa là sự thật, là trải nghiệm sống của con người, không thuật toán nào có quyền tự ý tô vẽ hay thêu dệt ký ức. NexTure thiết lập nguyên tắc bất biến: AI chỉ đóng vai trò là 'người thư ký mẫn cán' giúp cấu trúc dữ liệu thô (AI_SUGGESTED). Con người bắt buộc phải là người đọc lại, kiểm chứng sự thật (VERIFIED), và chính Admin mới là người quyết định tạo bản snapshot xuất bản (PUBLISHED). Sự thận trọng này chính là lời cam kết cao nhất của NexTure về tính chân thực của lịch sử.",
            Status = ContentStatus.VERIFIED,
            Visibility = Visibility.PUBLIC,
            OccurredAt = new DateTimeOffset(2024, 3, 20, 0, 0, 0, TimeSpan.Zero)
        };

        var s3 = new Story
        {
            OrganizationId = org.Id,
            Title = "Văn hóa Đồng sáng tạo và Lắng nghe Không khoảng cách",
            StoryType = "PEOPLE_STORY",
            CoreValueTag = "Empathy",
            Summary = "Xóa bỏ tháp quyền lực để mọi cá nhân từ thực tập sinh đến nhà sáng lập đều có quyền ghi nhận di sản văn hóa và đóng góp vào thư viện chung.",
            Content = "Làm thế nào một công ty công nghệ văn hóa có thể thực hành chính xác những gì mình rao giảng cho khách hàng? Tại NexTure, chúng tôi từ chối mô hình 'văn hóa chỉ đạo từ trên xuống'. Một nét văn hóa độc đáo đã được thiết lập: Bất kỳ thành viên nào — từ một bạn thực tập sinh tuần đầu tiên đến thành viên sáng lập — đều có quyền đóng góp câu chuyện, hình ảnh, bài học kinh nghiệm vào Culture Library. Những khoảnh khắc đồng đội hỗ trợ nhau gỡ lỗi lúc nửa đêm, câu chuyện một bạn chăm sóc khách hàng kiên nhẫn lắng nghe lời phàn nàn suốt 2 tiếng... tất cả đều được trân trọng và lưu giữ bình đẳng. Văn hóa tại NexTure được nuôi dưỡng bằng sự thấu cảm hàng ngày. Chúng tôi tin rằng, văn hóa mạnh mẽ nhất không đến từ các bài phát biểu của CEO, mà đến từ hàng ngàn hành động tử tế vô danh của từng con người trong tổ chức.",
            Status = ContentStatus.VERIFIED,
            Visibility = Visibility.PUBLIC,
            OccurredAt = new DateTimeOffset(2024, 6, 1, 0, 0, 0, TimeSpan.Zero)
        };

        var s4 = new Story
        {
            OrganizationId = org.Id,
            Title = "Khủng hoảng Bản phát hành đầu tiên: Bài học về Niềm tin và Sự Minh bạch",
            StoryType = "TURNING_POINT",
            CoreValueTag = "Creativity",
            Summary = "Sự cố kỹ thuật nghiêm trọng trong đợt thử nghiệm đầu tiên và bước ngoặt thức trắng 3 đêm khai sinh ra kiến trúc Snapshot bất biến bảo vệ dữ liệu vĩnh cửu.",
            Content = "Tháng 5/2024, chỉ 48 giờ trước khi bàn giao hệ thống thí điểm cho khách hàng doanh nghiệp đầu tiên, hệ thống đồng bộ dữ liệu giữa Hub và Atlas gặp lỗi đồng thời (race condition) khiến một số dữ liệu đang chỉnh sửa nháp bị rò rỉ ra trang hiển thị bên ngoài. Thay vì tìm cách che giấu hay đổ lỗi cho hạ tầng, đội ngũ sáng lập đã chọn con đường dũng cảm nhất: Chủ động gọi điện nhận trách nhiệm với ban giám đốc đối tác, giải thích rõ nguyên nhân kỹ thuật và xin thêm 72 giờ để thiết kế lại toàn bộ cơ chế bảo mật. Suốt 3 ngày 3 đêm sau đó, toàn bộ đội ngũ kỹ thuật thức trắng trong văn phòng, ăn mì gói và vẽ lại luồng dữ liệu. Đó là thời khắc khai sinh ra kiến trúc Immutable Publication Snapshot (Bản chụp ấn phẩm độc lập): Tách rời hoàn toàn bản ghi đang sửa đổi trong Hub với bản chụp công khai trên Atlas. Khách hàng đối tác không những không hủy hợp đồng mà còn gửi lời khen ngợi đặc biệt cho sự trung thực và tính chuyên nghiệp của NexTure.",
            Status = ContentStatus.VERIFIED,
            Visibility = Visibility.PUBLIC,
            OccurredAt = new DateTimeOffset(2024, 5, 25, 0, 0, 0, TimeSpan.Zero)
        };

        db.Stories.AddRange(s1, s2, s3, s4);

        // 5 Cột mốc Timeline lịch sử của NexTure
        var ev1 = new CultureEvent
        {
            OrganizationId = org.Id, Name = "Khởi tạo NexTure và sứ mệnh Digital Culture Hub",
            EventType = "FOUNDATION", CoreValueTag = "Trust",
            Content = "Chính thức thành lập tại TP. Hồ Chí Minh với niềm tin đưa văn hóa doanh nghiệp thành năng lực cạnh tranh cốt lõi và di sản số của người Việt.",
            StartDate = new DateTimeOffset(2024, 1, 10, 0, 0, 0, TimeSpan.Zero), Status = ContentStatus.VERIFIED, Visibility = Visibility.PUBLIC
        };
        var ev2 = new CultureEvent
        {
            OrganizationId = org.Id, Name = "Quyết định Đạo đức: Thiết lập nguyên tắc Human-in-the-loop cho AI",
            EventType = "INNOVATION", CoreValueTag = "Learning",
            Content = "Khẳng định cam kết lương tâm: AI chỉ đóng vai trò phân tích gợi ý, con người luôn là mắt xích kiểm chứng cuối cùng để bảo đảm tính chân thực của văn hóa.",
            StartDate = new DateTimeOffset(2024, 3, 25, 0, 0, 0, TimeSpan.Zero), Status = ContentStatus.VERIFIED, Visibility = Visibility.PUBLIC
        };
        var ev3 = new CultureEvent
        {
            OrganizationId = org.Id, Name = "Phát minh Kiến trúc Immutable Publication Snapshot",
            EventType = "TECH_MILESTONE", CoreValueTag = "Creativity",
            Content = "Tách rời hoàn toàn bản ghi đang chỉnh sửa nội bộ trong Hub với bản chụp công khai trên Atlas, giúp dữ liệu công khai luôn an toàn và bất biến.",
            StartDate = new DateTimeOffset(2024, 5, 28, 0, 0, 0, TimeSpan.Zero), Status = ContentStatus.VERIFIED, Visibility = Visibility.PUBLIC
        };
        var ev4 = new CultureEvent
        {
            OrganizationId = org.Id, Name = "Hoàn thành Kiểm thử Pilot thành công với 10 doanh nghiệp SME",
            EventType = "PILOT_SUCCESS", CoreValueTag = "Trust",
            Content = "10 doanh nghiệp thí điểm hoàn tất trọn vẹn chuỗi: Thu thập tài liệu -> AI phân tích -> Phê duyệt -> Culture Timeline -> Xuất bản Culture Atlas.",
            StartDate = new DateTimeOffset(2024, 7, 15, 0, 0, 0, TimeSpan.Zero), Status = ContentStatus.VERIFIED, Visibility = Visibility.PUBLIC
        };
        var ev5 = new CultureEvent
        {
            OrganizationId = org.Id, Name = "Chính thức ra mắt Bản đồ Văn hóa — NexTure Culture Atlas V2",
            EventType = "PUBLIC_LAUNCH", CoreValueTag = "Empathy",
            Content = "Xuất bản phiên bản công khai hoàn chỉnh, mở ra kỷ nguyên mới cho việc quản trị và lan tỏa văn hóa doanh nghiệp tại Việt Nam.",
            StartDate = new DateTimeOffset(2024, 9, 30, 0, 0, 0, TimeSpan.Zero), Status = ContentStatus.VERIFIED, Visibility = Visibility.PUBLIC
        };
        db.Events.AddRange(ev1, ev2, ev3, ev4, ev5);

        // 3 Nhân vật lãnh đạo & Đại sứ văn hóa
        var p1 = new Person
        {
            OrganizationId = org.Id, FullName = "Trần Minh Đức", RoleTitle = "Đồng sáng lập & Giám đốc Sản phẩm Văn hóa",
            CoreValueTag = "Trust", AvatarUrl = "/uploads/portrait-tran-minh-duc.jpg",
            Bio = "Hơn 12 năm kinh nghiệm trong lĩnh vực tư vấn chuyển đổi tổ chức và xây dựng văn hóa doanh nghiệp tại Đông Nam Á.",
            NotableContribution = "Văn hóa không phải là những khẩu hiệu trên tường, mà là những gì chúng ta lựa chọn hành động khi không có ai giám sát.",
            JoinedAt = new DateTimeOffset(2024, 1, 1, 0, 0, 0, TimeSpan.Zero), Status = ContentStatus.VERIFIED, Visibility = Visibility.PUBLIC
        };
        var p2 = new Person
        {
            OrganizationId = org.Id, FullName = "Nguyễn Hoàng Mai", RoleTitle = "Trưởng nhóm Nghiên cứu AI & Dữ liệu Tri thức",
            CoreValueTag = "Learning", AvatarUrl = "/uploads/portrait-nguyen-hoang-mai.jpg",
            Bio = "Tiến sĩ Khoa học Máy tính chuyên sâu về Xử lý Ngôn ngữ Tự nhiên và Hệ thống Tri thức Ngữ nghĩa.",
            NotableContribution = "AI phải học cách thấu hiểu chiều sâu ngôn từ và cảm xúc văn hóa Việt Nam, thay vì chỉ là các phép toán số liệu đơn thuần.",
            JoinedAt = new DateTimeOffset(2024, 2, 15, 0, 0, 0, TimeSpan.Zero), Status = ContentStatus.VERIFIED, Visibility = Visibility.PUBLIC
        };
        var p3 = new Person
        {
            OrganizationId = org.Id, FullName = "Lê Khắc Hùng", RoleTitle = "Kiến trúc sư Trưởng Hệ thống & Bảo mật Dữ liệu",
            CoreValueTag = "Creativity", AvatarUrl = "/uploads/portrait-le-khac-hung.jpg",
            Bio = "Chuyên gia kiến trúc hệ thống dữ liệu phân tán với nguyên tắc bảo mật và toàn vẹn dữ liệu ở cấp độ cao nhất.",
            NotableContribution = "Sự trung thực trong kỹ thuật và tính toàn vẹn của dữ liệu văn hóa là cam kết sống còn của chúng tôi với khách hàng.",
            JoinedAt = new DateTimeOffset(2024, 3, 1, 0, 0, 0, TimeSpan.Zero), Status = ContentStatus.VERIFIED, Visibility = Visibility.PUBLIC
        };
        db.People.AddRange(p1, p2, p3);

        // 3 Sản phẩm & Dự án di sản
        var pr1 = new ProductProject
        {
            OrganizationId = org.Id, Name = "NexTure Digital Culture Hub", Kind = "ENTERPRISE_PLATFORM",
            CoreValueTag = "Trust",
            Description = "Không gian quản trị và AI cấu trúc dữ liệu di sản văn hóa nội bộ, giúp doanh nghiệp ghi nhận và kiểm duyệt văn hóa ngay từ khi đang hình thành.",
            StartedAt = new DateTimeOffset(2024, 1, 15, 0, 0, 0, TimeSpan.Zero), Status = ContentStatus.VERIFIED, Visibility = Visibility.PUBLIC
        };
        var pr2 = new ProductProject
        {
            OrganizationId = org.Id, Name = "NexTure Culture Atlas", Kind = "PUBLIC_ATLAS",
            CoreValueTag = "Creativity",
            Description = "Cổng Bản đồ Văn hóa Doanh nghiệp công khai, trực quan hóa toàn bộ câu chuyện, con người, dòng thời gian và giá trị cốt lõi ra thế giới.",
            StartedAt = new DateTimeOffset(2024, 6, 1, 0, 0, 0, TimeSpan.Zero), Status = ContentStatus.VERIFIED, Visibility = Visibility.PUBLIC
        };
        var pr3 = new ProductProject
        {
            OrganizationId = org.Id, Name = "Responsible AI Structuring Engine", Kind = "AI_INITIATIVE",
            CoreValueTag = "Learning",
            Description = "Bộ máy AI phân tích tài liệu văn hóa thô với nguyên tắc bảo vệ quyền riêng tư và đảm bảo con người luôn là mắt xích kiểm duyệt tối thượng.",
            StartedAt = new DateTimeOffset(2024, 3, 1, 0, 0, 0, TimeSpan.Zero), Status = ContentStatus.VERIFIED, Visibility = Visibility.PUBLIC
        };
        db.ProductsProjects.AddRange(pr1, pr2, pr3);

        // Seed Media Assets & Sources cho Culture Library
        var m1 = new MediaAsset
        {
            OrganizationId = org.Id, Name = "Ảnh lễ ký kết Pilot 10 SME Văn hóa.jpg",
            MediaType = "image/jpeg", FileUrl = "/uploads/pilot-sme-signing.jpg",
            SourceName = "Ban Truyền thông Nội bộ", ProviderName = "NexTure Archive",
            Tags = "Pilot, SME, LeKyKet, 2024", OccurredAt = new DateTimeOffset(2024, 7, 15, 0, 0, 0, TimeSpan.Zero),
            Status = ContentStatus.VERIFIED, Visibility = Visibility.INTERNAL
        };
        var m2 = new MediaAsset
        {
            OrganizationId = org.Id, Name = "Sơ đồ kiến trúc Immutable Snapshot Architecture.png",
            MediaType = "image/png", FileUrl = "/uploads/immutable-snapshot-architecture.png",
            SourceName = "Nhóm Kỹ thuật Core", ProviderName = "Lê Khắc Hùng",
            Tags = "Architecture, Technical, Snapshot, Database", OccurredAt = new DateTimeOffset(2024, 5, 28, 0, 0, 0, TimeSpan.Zero),
            Status = ContentStatus.VERIFIED, Visibility = Visibility.INTERNAL
        };
        var m3 = new MediaAsset
        {
            OrganizationId = org.Id, Name = "Bản ghi âm tọa đàm: Lương tâm AI & Di sản Văn hóa.mp3",
            MediaType = "audio/mpeg", FileUrl = "/uploads/ai-ethics-discussion.mp3",
            SourceName = "Hội thảo Nội bộ", ProviderName = "Nguyễn Hoàng Mai",
            Tags = "Audio, AI, Ethics, Talkshow", OccurredAt = new DateTimeOffset(2024, 3, 20, 0, 0, 0, TimeSpan.Zero),
            Status = ContentStatus.VERIFIED, Visibility = Visibility.INTERNAL
        };
        db.MediaAssets.AddRange(m1, m2, m3);

        var src1 = new SourceRecord
        {
            OrganizationId = org.Id, Name = "Bản thảo Tuyên ngôn Văn hóa NexTure 2024",
            SourceType = "TEXT", TextContent = "Đầu năm 2024, ban giám đốc và nhóm kỹ sư hạt nhân họp mặt thống nhất xây dựng nền tảng văn hóa doanh nghiệp độc lập. Quyết định quan trọng nhất là tôn trọng dữ liệu thật, không bao giờ để AI tự tô vẽ câu chuyện giả mạo. Văn hóa phải là sự thật sống động từ những việc nhỏ mỗi ngày.",
            Status = ContentStatus.VERIFIED, Visibility = Visibility.INTERNAL
        };
        var src2 = new SourceRecord
        {
            OrganizationId = org.Id, Name = "Biên bản cuộc họp đêm: Nguyên tắc Human-in-the-loop",
            SourceType = "TEXT", TextContent = "Biên bản thống nhất nguyên tắc tối cao: Mọi đề xuất trích xuất văn hóa từ AI chỉ mang tính tham khảo (AI_SUGGESTED). Chỉ con người mới có quyền kiểm chứng (VERIFIED) và thẩm quyền cao nhất phê duyệt công khai (PUBLISHED).",
            Status = ContentStatus.VERIFIED, Visibility = Visibility.INTERNAL
        };
        var src3 = new SourceRecord
        {
            OrganizationId = org.Id, Name = "Báo cáo Tổng kết Thí điểm 10 Doanh nghiệp SME",
            SourceType = "FILE", FileUrl = m1.FileUrl, MediaAssetId = m1.Id,
            Status = ContentStatus.VERIFIED, Visibility = Visibility.INTERNAL
        };
        db.Sources.AddRange(src1, src2, src3);

        // Seed AI Suggestions & Reviews cho Culture Review
        var sug1 = new AiSuggestion
        {
            OrganizationId = org.Id, SourceId = src1.Id, SuggestionType = EntityType.STORY,
            PayloadJson = System.Text.Json.JsonSerializer.Serialize(new
            {
                title = "Chuyện người trực đêm gỡ lỗi hệ thống Culture Hub 24/7",
                summary = "Ghi nhận sự tận tâm của đội ngũ vận hành hạ tầng trong giai đoạn thử nghiệm tải cao điểm.",
                content = "Đêm ngày 12/8/2024, khi cụm máy chủ cơ sở dữ liệu gặp áp lực lớn trong đợt thử nghiệm diện rộng, kỹ sư trực ca đã chủ động ở lại văn phòng suốt đêm để theo dõi chỉ số và tối ưu truy vấn mà không cần cấp trên yêu cầu. Tinh thần trách nhiệm thầm lặng này chính là biểu hiện rõ nét nhất của giá trị Trust.",
                storyType = "PEOPLE_STORY",
                occurredAt = new DateTimeOffset(2024, 8, 12, 0, 0, 0, TimeSpan.Zero),
                visibility = "PUBLIC"
            }),
            Status = ContentStatus.PENDING_REVIEW
        };
        var sug2 = new AiSuggestion
        {
            OrganizationId = org.Id, SourceId = src2.Id, SuggestionType = EntityType.EVENT,
            PayloadJson = System.Text.Json.JsonSerializer.Serialize(new
            {
                name = "Tọa đàm Chia sẻ Văn hóa Số nội bộ Quý 3/2024",
                startDate = new DateTimeOffset(2024, 8, 30, 0, 0, 0, TimeSpan.Zero),
                content = "Buổi sinh hoạt nội bộ kết nối hơn 100 nhân sự trực tuyến và trực tiếp, thảo luận về cách mỗi thành viên ứng dụng văn hóa vào công việc lập trình và hỗ trợ khách hàng.",
                eventType = "COMMUNITY_EVENT",
                visibility = "INTERNAL"
            }),
            Status = ContentStatus.PENDING_REVIEW
        };
        db.AiSuggestions.AddRange(sug1, sug2);
        db.Reviews.Add(new Review { OrganizationId = org.Id, SuggestionId = sug1.Id, Decision = ReviewDecision.PENDING });
        db.Reviews.Add(new Review { OrganizationId = org.Id, SuggestionId = sug2.Id, Decision = ReviewDecision.PENDING });

        // Xuất bản toàn bộ sang AtlasPublications (Status = PUBLISHED) kèm CoreValueTag
        AddPub(db, org.Id, EntityType.STORY, s1.Id, "khat-vong-so-hoa-dna-van-hoa", s1.Title, s1.Summary, s1.Content, s1.OccurredAt, user.Id, s1, s1.CoreValueTag);
        AddPub(db, org.Id, EntityType.STORY, s2.Id, "tranh-luan-luong-tam-ai", s2.Title, s2.Summary, s2.Content, s2.OccurredAt, user.Id, s2, s2.CoreValueTag);
        AddPub(db, org.Id, EntityType.STORY, s3.Id, "van-hoa-dong-sang-tao", s3.Title, s3.Summary, s3.Content, s3.OccurredAt, user.Id, s3, s3.CoreValueTag);
        AddPub(db, org.Id, EntityType.STORY, s4.Id, "khung-hoang-ban-phat-hanh-dau-tien", s4.Title, s4.Summary, s4.Content, s4.OccurredAt, user.Id, s4, s4.CoreValueTag);

        AddPub(db, org.Id, EntityType.EVENT, ev1.Id, "khoi-tao-nexture-2024", ev1.Name, ev1.EventType, ev1.Content, ev1.StartDate, user.Id, ev1, ev1.CoreValueTag);
        AddPub(db, org.Id, EntityType.EVENT, ev2.Id, "quyet-dinh-dao-duc-ai", ev2.Name, ev2.EventType, ev2.Content, ev2.StartDate, user.Id, ev2, ev2.CoreValueTag);
        AddPub(db, org.Id, EntityType.EVENT, ev3.Id, "immutable-snapshot-breakthrough", ev3.Name, ev3.EventType, ev3.Content, ev3.StartDate, user.Id, ev3, ev3.CoreValueTag);
        AddPub(db, org.Id, EntityType.EVENT, ev4.Id, "pilot-10-sme-success", ev4.Name, ev4.EventType, ev4.Content, ev4.StartDate, user.Id, ev4, ev4.CoreValueTag);
        AddPub(db, org.Id, EntityType.EVENT, ev5.Id, "ra-mat-culture-atlas-v2", ev5.Name, ev5.EventType, ev5.Content, ev5.StartDate, user.Id, ev5, ev5.CoreValueTag);

        AddPub(db, org.Id, EntityType.PERSON, p1.Id, "tran-minh-duc", p1.FullName, p1.RoleTitle, p1.NotableContribution, p1.JoinedAt, user.Id, p1, p1.CoreValueTag);
        AddPub(db, org.Id, EntityType.PERSON, p2.Id, "nguyen-hoang-mai", p2.FullName, p2.RoleTitle, p2.NotableContribution, p2.JoinedAt, user.Id, p2, p2.CoreValueTag);
        AddPub(db, org.Id, EntityType.PERSON, p3.Id, "le-khac-hung", p3.FullName, p3.RoleTitle, p3.NotableContribution, p3.JoinedAt, user.Id, p3, p3.CoreValueTag);

        AddPub(db, org.Id, EntityType.PRODUCT, pr1.Id, "nexture-culture-hub", pr1.Name, pr1.Kind, pr1.Description, pr1.StartedAt, user.Id, pr1, pr1.CoreValueTag);
        AddPub(db, org.Id, EntityType.PRODUCT, pr2.Id, "nexture-culture-atlas", pr2.Name, pr2.Kind, pr2.Description, pr2.StartedAt, user.Id, pr2, pr2.CoreValueTag);
        AddPub(db, org.Id, EntityType.PRODUCT, pr3.Id, "responsible-ai-engine", pr3.Name, pr3.Kind, pr3.Description, pr3.StartedAt, user.Id, pr3, pr3.CoreValueTag);

        db.ActivityLogs.Add(new ActivityLog { OrganizationId = org.Id, UserId = user.Id, Action = "NEXTURE_HERITAGE_SEEDED", EntityType = "ORGANIZATION", EntityId = org.Id });
        await db.SaveChangesAsync();
    }
    else
    {
        // 2. Di chuyển dữ liệu tương thích nếu DB đã khởi tạo từ trước
        var existingOrg = await db.Organizations.FirstOrDefaultAsync(x => x.Slug == "nexture-technology");
        if (existingOrg != null)
        {
            existingOrg.CultureManifesto = manifesto;
            existingOrg.Location = location;
            existingOrg.CoreValuesListJson = coreValuesJson;
            existingOrg.CoreValues = "Trust · Learning · Creativity · Empathy";

            // Gán CoreValueTag cho Stories
            var stories = await db.Stories.Where(x => x.OrganizationId == existingOrg.Id).ToListAsync();
            foreach (var s in stories)
            {
                if (s.Title.Contains("DNA") || s.Title.Contains("Khát vọng")) s.CoreValueTag = "Trust";
                else if (s.Title.Contains("Lương tâm") || s.Title.Contains("AI")) s.CoreValueTag = "Learning";
                else if (s.Title.Contains("Đồng sáng tạo") || s.Title.Contains("Lắng nghe")) s.CoreValueTag = "Empathy";
                else s.CoreValueTag = "Creativity";
            }

            // Gán CoreValueTag cho Events
            var events = await db.Events.Where(x => x.OrganizationId == existingOrg.Id).ToListAsync();
            foreach (var ev in events)
            {
                if (ev.Name.Contains("Khởi tạo") || ev.Name.Contains("Pilot")) ev.CoreValueTag = "Trust";
                else if (ev.Name.Contains("Đạo đức")) ev.CoreValueTag = "Learning";
                else if (ev.Name.Contains("Snapshot")) ev.CoreValueTag = "Creativity";
                else ev.CoreValueTag = "Empathy";
            }

            // Gán CoreValueTag cho People
            var people = await db.People.Where(x => x.OrganizationId == existingOrg.Id).ToListAsync();
            foreach (var p in people)
            {
                if (p.FullName.Contains("Trần Minh Đức")) p.CoreValueTag = "Trust";
                else if (p.FullName.Contains("Nguyễn Hoàng Mai")) p.CoreValueTag = "Learning";
                else p.CoreValueTag = "Creativity";
            }

            // Gán CoreValueTag cho Products
            var prods = await db.ProductsProjects.Where(x => x.OrganizationId == existingOrg.Id).ToListAsync();
            foreach (var pr in prods)
            {
                if (pr.Name.Contains("Hub")) pr.CoreValueTag = "Trust";
                else if (pr.Name.Contains("Atlas")) pr.CoreValueTag = "Creativity";
                else pr.CoreValueTag = "Learning";
            }

            // Gán CoreValueTag cho AtlasPublications
            var pubs = await db.AtlasPublications.Where(x => x.OrganizationId == existingOrg.Id).ToListAsync();
            foreach (var pub in pubs)
            {
                if (pub.Slug.Contains("khat-vong") || pub.Slug.Contains("khoi-tao") || pub.Slug.Contains("pilot") || pub.Slug.Contains("tran-minh-duc") || pub.Slug.Contains("nexture-culture-hub"))
                    pub.CoreValueTag = "Trust";
                else if (pub.Slug.Contains("tranh-luan") || pub.Slug.Contains("quyet-dinh") || pub.Slug.Contains("nguyen-hoang-mai") || pub.Slug.Contains("responsible-ai"))
                    pub.CoreValueTag = "Learning";
                else if (pub.Slug.Contains("van-hoa-dong-sang-tao") || pub.Slug.Contains("ra-mat-culture-atlas-v2"))
                    pub.CoreValueTag = "Empathy";
                else
                    pub.CoreValueTag = "Creativity";
            }

            // Seed thêm Media và Sources nếu chưa có
            if (!await db.MediaAssets.AnyAsync(x => x.OrganizationId == existingOrg.Id))
            {
                var m1 = new MediaAsset
                {
                    OrganizationId = existingOrg.Id, Name = "Ảnh lễ ký kết Pilot 10 SME Văn hóa.jpg",
                    MediaType = "image/jpeg", FileUrl = "/uploads/pilot-sme-signing.jpg",
                    SourceName = "Ban Truyền thông Nội bộ", ProviderName = "NexTure Archive",
                    Tags = "Pilot, SME, LeKyKet, 2024", OccurredAt = new DateTimeOffset(2024, 7, 15, 0, 0, 0, TimeSpan.Zero),
                    Status = ContentStatus.VERIFIED, Visibility = Visibility.INTERNAL
                };
                var m2 = new MediaAsset
                {
                    OrganizationId = existingOrg.Id, Name = "Sơ đồ kiến trúc Immutable Snapshot Architecture.png",
                    MediaType = "image/png", FileUrl = "/uploads/immutable-snapshot-architecture.png",
                    SourceName = "Nhóm Kỹ thuật Core", ProviderName = "Lê Khắc Hùng",
                    Tags = "Architecture, Technical, Snapshot, Database", OccurredAt = new DateTimeOffset(2024, 5, 28, 0, 0, 0, TimeSpan.Zero),
                    Status = ContentStatus.VERIFIED, Visibility = Visibility.INTERNAL
                };
                var m3 = new MediaAsset
                {
                    OrganizationId = existingOrg.Id, Name = "Bản ghi âm tọa đàm: Lương tâm AI & Di sản Văn hóa.mp3",
                    MediaType = "audio/mpeg", FileUrl = "/uploads/ai-ethics-discussion.mp3",
                    SourceName = "Hội thảo Nội bộ", ProviderName = "Nguyễn Hoàng Mai",
                    Tags = "Audio, AI, Ethics, Talkshow", OccurredAt = new DateTimeOffset(2024, 3, 20, 0, 0, 0, TimeSpan.Zero),
                    Status = ContentStatus.VERIFIED, Visibility = Visibility.INTERNAL
                };
                db.MediaAssets.AddRange(m1, m2, m3);

                var src1 = new SourceRecord
                {
                    OrganizationId = existingOrg.Id, Name = "Bản thảo Tuyên ngôn Văn hóa NexTure 2024",
                    SourceType = "TEXT", TextContent = "Đầu năm 2024, ban giám đốc và nhóm kỹ sư hạt nhân họp mặt thống nhất xây dựng nền tảng văn hóa doanh nghiệp độc lập. Quyết định quan trọng nhất là tôn trọng dữ liệu thật, không bao giờ để AI tự tô vẽ câu chuyện giả mạo. Văn hóa phải là sự thật sống động từ những việc nhỏ mỗi ngày.",
                    Status = ContentStatus.VERIFIED, Visibility = Visibility.INTERNAL
                };
                var src2 = new SourceRecord
                {
                    OrganizationId = existingOrg.Id, Name = "Biên bản cuộc họp đêm: Nguyên tắc Human-in-the-loop",
                    SourceType = "TEXT", TextContent = "Biên bản thống nhất nguyên tắc tối cao: Mọi đề xuất trích xuất văn hóa từ AI chỉ mang tính tham khảo (AI_SUGGESTED). Chỉ con người mới có quyền kiểm chứng (VERIFIED) và thẩm quyền cao nhất phê duyệt công khai (PUBLISHED).",
                    Status = ContentStatus.VERIFIED, Visibility = Visibility.INTERNAL
                };
                var src3 = new SourceRecord
                {
                    OrganizationId = existingOrg.Id, Name = "Báo cáo Tổng kết Thí điểm 10 Doanh nghiệp SME",
                    SourceType = "FILE", FileUrl = m1.FileUrl, MediaAssetId = m1.Id,
                    Status = ContentStatus.VERIFIED, Visibility = Visibility.INTERNAL
                };
                db.Sources.AddRange(src1, src2, src3);
            }

            // Seed thêm Reviews nếu chưa có
            if (!await db.Reviews.AnyAsync(x => x.OrganizationId == existingOrg.Id && x.Decision == ReviewDecision.PENDING))
            {
                var src = await db.Sources.FirstOrDefaultAsync(x => x.OrganizationId == existingOrg.Id);
                var srcId = src?.Id ?? Guid.NewGuid();

                var sug1 = new AiSuggestion
                {
                    OrganizationId = existingOrg.Id, SourceId = srcId, SuggestionType = EntityType.STORY,
                    PayloadJson = System.Text.Json.JsonSerializer.Serialize(new
                    {
                        title = "Chuyện người trực đêm gỡ lỗi hệ thống Culture Hub 24/7",
                        summary = "Ghi nhận sự tận tâm của đội ngũ vận hành hạ tầng trong giai đoạn thử nghiệm tải cao điểm.",
                        content = "Đêm ngày 12/8/2024, khi cụm máy chủ cơ sở dữ liệu gặp áp lực lớn trong đợt thử nghiệm diện rộng, kỹ sư trực ca đã chủ động ở lại văn phòng suốt đêm để theo dõi chỉ số và tối ưu truy vấn mà không cần cấp trên yêu cầu. Tinh thần trách nhiệm thầm lặng này chính là biểu hiện rõ nét nhất của giá trị Trust.",
                        storyType = "PEOPLE_STORY",
                        occurredAt = new DateTimeOffset(2024, 8, 12, 0, 0, 0, TimeSpan.Zero),
                        visibility = "PUBLIC"
                    }),
                    Status = ContentStatus.PENDING_REVIEW
                };
                var sug2 = new AiSuggestion
                {
                    OrganizationId = existingOrg.Id, SourceId = srcId, SuggestionType = EntityType.EVENT,
                    PayloadJson = System.Text.Json.JsonSerializer.Serialize(new
                    {
                        name = "Tọa đàm Chia sẻ Văn hóa Số nội bộ Quý 3/2024",
                        startDate = new DateTimeOffset(2024, 8, 30, 0, 0, 0, TimeSpan.Zero),
                        content = "Buổi sinh hoạt nội bộ kết nối hơn 100 nhân sự trực tuyến và trực tiếp, thảo luận về cách mỗi thành viên ứng dụng văn hóa vào công việc lập trình và hỗ trợ khách hàng.",
                        eventType = "COMMUNITY_EVENT",
                        visibility = "INTERNAL"
                    }),
                    Status = ContentStatus.PENDING_REVIEW
                };
                db.AiSuggestions.AddRange(sug1, sug2);
                db.Reviews.Add(new Review { OrganizationId = existingOrg.Id, SuggestionId = sug1.Id, Decision = ReviewDecision.PENDING });
                db.Reviews.Add(new Review { OrganizationId = existingOrg.Id, SuggestionId = sug2.Id, Decision = ReviewDecision.PENDING });
            }

            await db.SaveChangesAsync();
        }
    }
}

static void AddPub<T>(AppDbContext db, Guid orgId, EntityType type, Guid entityId, string slug, string title, string? summary, string? content, DateTimeOffset? occurredAt, Guid userId, T obj, string? coreValueTag = null)
{
    db.AtlasPublications.Add(new AtlasPublication
    {
        OrganizationId = orgId,
        EntityType = type,
        EntityId = entityId,
        Status = AtlasPublicationStatus.PUBLISHED,
        Slug = slug,
        PublishedTitle = title,
        PublishedSummary = summary,
        PublishedContent = content,
        CoverMediaUrl = null,
        CoreValueTag = coreValueTag,
        OccurredAt = occurredAt,
        SnapshotJson = System.Text.Json.JsonSerializer.Serialize(obj),
        SourceUpdatedAt = DateTimeOffset.UtcNow,
        PublishedByUserId = userId,
        PublishedAt = DateTimeOffset.UtcNow,
        Version = 1
    });
}

