**NEXTURE MVP — PHẦN 1**

**DIGITAL CULTURE HUB**

*Bản mô tả sản phẩm và yêu cầu phát triển MVP*

# 1\. MỤC TIÊU SẢN PHẨM

Digital Culture Hub là không gian quản trị văn hóa riêng của từng doanh nghiệp. Trong giai đoạn MVP, Hub tập trung vào doanh nghiệp nhỏ và vừa và giải quyết bài toán: giúp doanh nghiệp ghi nhận văn hóa ngay từ khi văn hóa đang được hình thành.

Doanh nghiệp sử dụng Hub theo chuỗi:

Thu thập dữ liệu → AI hỗ trợ cấu trúc → Con người kiểm duyệt → Hình thành hồ sơ văn hóa → Quản trị và khai thác → Chọn nội dung phù hợp để công khai lên Culture Atlas.

Hub là nguồn dữ liệu gốc của NexTure. Mọi nội dung xuất hiện trên Vietnam Enterprise Culture Atlas về sau phải bắt nguồn từ dữ liệu trong Hub đã được doanh nghiệp xác minh.

# 2\. ĐỐI TƯỢNG SỬ DỤNG

## 2.1. Admin

Admin có quyền cao nhất trong Culture Hub:

• Tạo và chỉnh sửa hồ sơ doanh nghiệp.

• Quản lý thành viên.

• Quản lý quyền truy cập.

• Thêm, sửa và duyệt dữ liệu.

• Duyệt các đề xuất của AI.

• Quyết định nội dung nào được phép công khai.

• Gửi nội dung sang Culture Atlas.

• Gỡ nội dung khỏi Atlas.

## 2.2. Editor

Editor có thể:

• Tạo Story.

• Tạo Event.

• Tạo Person.

• Tạo Product/Project.

• Upload tài liệu.

• Sử dụng AI.

• Chỉnh sửa nội dung.

• Gửi nội dung cho Admin kiểm duyệt.

## 2.3. Viewer

Viewer chỉ xem những dữ liệu mà doanh nghiệp cho phép.

## 2.4. Contributor — P1

Contributor có thể đóng góp câu chuyện, ảnh, video, tài liệu và cột mốc nhưng không được tự xác minh hoặc công khai.

Trong Pilot đầu tiên có thể rút gọn thành ba vai trò: Admin — Editor — Viewer.

# 3\. LUỒNG SỬ DỤNG CHÍNH

Một doanh nghiệp mới phải có thể thực hiện trọn vẹn luồng:

Đăng ký → Tạo Culture Hub → Nhập thông tin doanh nghiệp → Thêm dữ liệu → AI phân tích và đề xuất cấu trúc → Con người kiểm duyệt → Tạo Story/Event/Person/Product → Hiển thị trên Culture Timeline → Tiếp tục cập nhật → Chọn một số nội dung để đưa lên Culture Atlas.

Đây là luồng quan trọng nhất của Hub và phải được ưu tiên trước các tính năng mở rộng.

# 4\. CẤU TRÚC GIAO DIỆN

Thanh điều hướng MVP đề xuất:

• Tổng quan.

• Culture Timeline.

• Stories.

• People.

• Products & Projects.

• Culture Library.

• AI Assistant.

• Pending Review.

• Culture Atlas.

• Cài đặt.

Lưu ý: Không nên đưa quá nhiều module vào MVP. Các chức năng phải phục vụ trực tiếp luồng ghi nhận → kiểm duyệt → timeline → công khai.

# 5\. KHỞI TẠO CULTURE HUB

Khi tạo Hub, doanh nghiệp nhập:

• Tên doanh nghiệp.

• Logo.

• Năm thành lập.

• Ngành nghề.

• Quy mô nhân sự.

• Website.

• Mô tả ngắn.

• Người sáng lập.

• Giá trị cốt lõi.

Sau khi hoàn thành, hệ thống hướng dẫn doanh nghiệp bắt đầu với năm nhóm dữ liệu:

• Người sáng lập và câu chuyện hình thành.

• Các cột mốc phát triển.

• Con người và những đóng góp đáng chú ý.

• Giá trị và câu chuyện văn hóa.

• Sản phẩm, dự án và thành tựu.

# 6\. DASHBOARD

Dashboard cần đơn giản, phục vụ thao tác hơn là phân tích phức tạp.

Hiển thị:

• Tổng số Stories.

• Tổng số Events.

• Tổng số People.

• Tổng số Products/Projects.

• Tổng số Media.

• Số nội dung Pending Review.

• Số nội dung đang công khai trên Atlas.

• Hoạt động gần đây.

Nút hành động chính: \+ Thêm dữ liệu.

Các lựa chọn:

• Thêm Story.

• Thêm Event.

• Thêm Person.

• Thêm Product/Project.

• Upload tài liệu.

• Upload ảnh.

• Upload video.

• Upload audio.

# 7\. CULTURE LIBRARY / CULTURE ARCHIVE

Culture Library là nơi lưu dữ liệu gốc.

MVP nên hỗ trợ:

• PDF.

• DOC/DOCX.

• JPG/PNG.

• MP4.

• MP3/WAV.

Mỗi tài sản có metadata tối thiểu:

• ID.

• Tên.

• Loại dữ liệu.

• Ngày tạo.

• Ngày xảy ra sự kiện nếu có.

• Nguồn.

• Người cung cấp.

• Tags.

• Người liên quan.

• Event liên quan.

• Quyền truy cập.

• Trạng thái xác minh.

• File URL.

MVP có thể hỗ trợ List View và Grid View cho media.

# 8\. STORIES

Các loại Story:

• Company Story.

• Founder Story.

• Culture Story.

• People Story.

• Product Story.

Một Story có:

• Tiêu đề.

• Tóm tắt.

• Nội dung đầy đủ.

• Ảnh đại diện.

• Ngày/thời gian.

• People liên quan.

• Events liên quan.

• Products/Projects liên quan.

• Culture Values.

• Tài liệu nguồn.

• Trạng thái xác minh.

• Mức độ riêng tư.

• Trạng thái xuất bản Atlas.

# 9\. EVENTS

Event là thành phần chính tạo nên Culture Timeline.

Một Event gồm:

• Tên sự kiện.

• Ngày bắt đầu.

• Ngày kết thúc nếu có.

• Nội dung.

• Loại sự kiện.

• People liên quan.

• Products/Projects liên quan.

• Stories liên quan.

• Culture Values liên quan.

• Ảnh/video.

• Tài liệu nguồn.

• Trạng thái xác minh.

• Mức độ riêng tư.

# 10\. PEOPLE

Mỗi Person gồm:

• Họ tên.

• Ảnh đại diện.

• Vai trò.

• Thời gian tham gia doanh nghiệp.

• Tiểu sử.

• Đóng góp nổi bật.

• Stories liên quan.

• Events liên quan.

• Products/Projects liên quan.

• Media liên quan.

Đối với SME, giao diện nên dùng tên “People” thay vì “People & Legacy” để dễ hiểu.

# 11\. PRODUCTS & PROJECTS

Mỗi Product/Project gồm:

• Tên.

• Loại: Product hoặc Project.

• Ngày bắt đầu/ra mắt.

• Mô tả.

• Story.

• People liên quan.

• Events liên quan.

• Media.

• Trạng thái.

# 12\. CULTURE VALUES

Mỗi doanh nghiệp có thể định nghĩa bộ giá trị văn hóa riêng. Story và Event có thể liên kết với một hoặc nhiều Culture Value.

Ví dụ trong tương lai hệ thống có thể trả lời: “Những câu chuyện nào thể hiện giá trị Sáng tạo?”

# 13\. CULTURE TIMELINE

Culture Timeline lấy dữ liệu từ Event và trình bày theo thời gian.

Ví dụ:

2023 — Thành lập doanh nghiệp

↓

2024 — Ra mắt sản phẩm đầu tiên

↓

2025 — Mở rộng đội ngũ lên 50 nhân sự

Mỗi Event trên Timeline có thể mở chi tiết và hiển thị:

• Câu chuyện.

• People.

• Product/Project.

• Images.

• Video.

• Documents.

• Sources.

# 14\. AI STORY STRUCTURING

Đây là chức năng AI trọng tâm của MVP.

Luồng xử lý:

Upload/Nhập dữ liệu → Chuyển đổi dữ liệu thành văn bản nếu cần → AI phân tích → AI đề xuất cấu trúc → Con người kiểm duyệt.

AI có thể đề xuất:

• Person.

• Event.

• Date.

• Product.

• Story.

• Culture Value.

• Tags.

• Mối quan hệ giữa các đối tượng.

Ví dụ: Founder upload một đoạn phỏng vấn. AI đề xuất Event “Ra mắt sản phẩm ABC”, thời gian 2024, Related Person, Related Product và bản nháp Story.

# 15\. TRẠNG THÁI NỘI DUNG

Trạng thái đề xuất:

DRAFT

AI\_SUGGESTED

PENDING\_REVIEW

VERIFIED

REJECTED

Nguyên tắc bắt buộc: AI\_SUGGESTED không được coi là dữ liệu lịch sử chính thức. Chỉ dữ liệu VERIFIED mới được xem là hồ sơ đã được doanh nghiệp xác nhận.

# 16\. PENDING REVIEW

Trang Pending Review tổng hợp:

• AI Suggestions.

• Nội dung do Editor gửi.

• Thay đổi cần duyệt.

Admin có ba thao tác chính:

• Approve.

• Edit.

• Reject.

# 17\. SEARCH

MVP:

• Search từ khóa.

• Filter theo loại dữ liệu.

• Filter theo Person.

• Filter theo thời gian.

• Filter theo trạng thái.

Semantic Search là P1.

# 18\. CẤU TRÚC DỮ LIỆU LÕI

Các bảng/collection chính:

organizations

users

organization\_members

stories

events

people

products\_projects

culture\_values

media\_assets

sources

relationships

ai\_suggestions

reviews

activity\_logs

Bảng relationships nên được thiết kế tổng quát để lưu quan hệ giữa các entity.

Ví dụ:

source\_type \= PERSON

source\_id \= 15

relationship\_type \= PARTICIPATED\_IN

target\_type \= EVENT

target\_id \= 28

# 19\. QUYỀN DỮ LIỆU

Mỗi record tối thiểu có visibility:

PRIVATE

INTERNAL

PUBLIC

PRIVATE: Chỉ người có quyền trong Hub được xem.

INTERNAL: Được sử dụng trong doanh nghiệp nhưng không xuất hiện trên Atlas.

PUBLIC: Doanh nghiệp cho phép nội dung tham gia quy trình đưa lên Atlas.

Lưu ý: PUBLIC chưa có nghĩa là nội dung đã xuất hiện trên Atlas.

# 20\. API HUB THAM KHẢO

POST /organizations

GET /organizations/:id

POST /stories

GET /stories

PUT /stories/:id

POST /events

GET /events

POST /people

POST /products

POST /media/upload

POST /ai/analyze

GET /ai/suggestions

POST /reviews/:id/approve

POST /reviews/:id/reject

GET /timeline

GET /search

Tên endpoint là đề xuất, đội backend có thể điều chỉnh.

# 21\. PHẠM VI MVP

**P0 — Bắt buộc:**

• Authentication.

• Organization.

• User Roles cơ bản.

• Culture Library.

• Stories.

• Events.

• People.

• Products/Projects.

• Media upload.

• AI Story Structuring cơ bản.

• Pending Review.

• Culture Timeline.

• Visibility.

• Activity Log cơ bản.

**P1 — Sau khi P0 ổn định:**

• Contributor role.

• Semantic Search.

• Culture Values nâng cao.

• Advanced filters.

• Analytics sử dụng.

**Chưa làm:**

• Mobile App.

• AI chatbot phức tạp.

• ERP/HR integration sâu.

• Blockchain.

• Social Network.

• Marketplace.

• Tự động công khai nội dung.

# 22\. ĐIỀU KIỆN HUB MVP HOÀN THÀNH

Hub MVP được xem là đủ để Pilot khi một SME có thể thực hiện trọn vẹn:

Tạo Hub → Nhập/Upload dữ liệu → AI xử lý → Con người kiểm duyệt → Tạo Story/Event → Hiển thị trên Culture Timeline.

# 23\. LƯU Ý CHO ĐỘI TECH

• Ưu tiên luồng end-to-end hoàn chỉnh hơn số lượng tính năng.

• Quyền truy cập phải được kiểm tra ở backend, không chỉ ở frontend.

• Mọi dữ liệu phải gắn organization\_id.

• AI phải luôn giữ liên kết với nguồn ban đầu để người dùng kiểm chứng.

• Không xóa dữ liệu nguồn sau khi AI đã tạo nội dung.

• Thiết kế data model ngay từ đầu để hỗ trợ Publishing Layer ở Phần 3\.

**NEXTURE MVP — PHẦN 2**

**VIETNAM ENTERPRISE CULTURE ATLAS**

*Bản mô tả website công khai và yêu cầu phát triển MVP*

# **1\. MỤC TIÊU SẢN PHẨM**

Vietnam Enterprise Culture Atlas là website công khai dùng để giới thiệu những câu chuyện, con người, cột mốc, sản phẩm và bản sắc của doanh nghiệp Việt Nam dựa trên dữ liệu đã được doanh nghiệp xác minh và cho phép công khai.

Atlas không phải hệ thống quản trị dữ liệu. Atlas là lớp công khai và lan tỏa của NexTure.

# **2\. ĐỐI TƯỢNG SỬ DỤNG**

Atlas hướng tới:

• Khách hàng.

• Người lao động.

• Ứng viên.

• Đối tác.

• Nhà nghiên cứu.

• Sinh viên.

• Cộng đồng.

• Khách quốc tế trong tương lai.

Phần lớn người dùng không cần đăng nhập.

# **3\. NGUYÊN TẮC DỮ LIỆU**

Atlas không cho doanh nghiệp tạo trực tiếp Story, Event, Person hay Product/Project.

Dữ liệu phải đi theo luồng:

Digital Culture Hub → Xác minh → Cho phép công khai → Xuất bản → Atlas.

Atlas chỉ sử dụng dữ liệu đã được Publishing Layer phê duyệt và tạo Public Snapshot.

# **4\. TRANG CHỦ ATLAS**

Hero:

Vietnam Enterprise Culture Atlas

Thông điệp tham khảo:

Khám phá những câu chuyện, con người, sản phẩm và dấu mốc tạo nên các doanh nghiệp Việt Nam.

Thành phần chính:

• Thanh Search lớn.

• Doanh nghiệp nổi bật.

• Câu chuyện nổi bật.

• Người sáng lập/nhân vật nổi bật.

• Sản phẩm/dự án nổi bật.

• Doanh nghiệp mới tham gia Atlas.

# **5\. EXPLORE ENTERPRISES**

Card doanh nghiệp hiển thị:

• Logo.

• Tên.

• Ngành.

• Năm thành lập.

• Địa phương.

• Mô tả ngắn.

Filter MVP:

• Ngành.

• Năm thành lập.

• Địa phương.

**P1:**

• Quy mô.

• Culture Value.

• Loại doanh nghiệp.

# **6\. COMPANY PUBLIC PROFILE**

URL đề xuất:

/companies/:slug

Trang gồm:

## **6.1. Hero**

• Logo.

• Tên doanh nghiệp.

• Ngành.

• Năm thành lập.

• Website.

• Địa điểm.

• Mô tả ngắn.

## **6.2. Company Story**

Câu chuyện tổng quan của doanh nghiệp đã được phê duyệt công khai.

## **6.3. Culture Timeline**

Chỉ hiển thị các Event được doanh nghiệp cho phép và đã Published.

## **6.4. Founder / People**

Hiển thị những nhân vật đã được cho phép công khai.

## **6.5. Products & Projects**

Hiển thị các sản phẩm/dự án tiêu biểu đã Published.

## **6.6. Culture Stories**

Danh sách Story công khai.

## **6.7. Gallery**

Ảnh/video được doanh nghiệp cho phép công khai.

# **7\. STORY PAGE**

URL:

/stories/:slug

Hiển thị:

• Title.

• Company.

• Publish Date.

• Story Content.

• Images.

• Related People.

• Related Events.

• Related Products/Projects.

• Public Sources nếu được doanh nghiệp cho phép.

# **8\. PEOPLE PROFILE**

URL:

/people/:slug

Hiển thị:

• Tên.

• Ảnh.

• Doanh nghiệp.

• Vai trò.

• Tiểu sử.

• Đóng góp.

• Events liên quan.

• Stories liên quan.

• Products/Projects liên quan.

# **9\. PRODUCT / PROJECT PAGE**

URL:

/products/:slug

hoặc

/projects/:slug

Hiển thị:

• Tên.

• Doanh nghiệp.

• Ngày ra mắt/khởi động.

• Story.

• People liên quan.

• Events liên quan.

• Media.

# **10\. PUBLIC CULTURE TIMELINE**

Atlas lấy các Event đã được Published.

Ví dụ Hub có 30 Events, trong đó 18 Internal và 12 Public/PUBLISHED. Atlas chỉ hiển thị 12 Events đã được công khai.

# **11\. SEARCH**

Search MVP cần hỗ trợ:

• Company.

• Story.

• Person.

• Product/Project.

• Event.

**P1:**

• Semantic Search.

• Gợi ý nội dung liên quan.

• Tìm kiếm bằng câu hỏi tự nhiên trên dữ liệu public.

# **12\. SONG NGỮ**

Cấu trúc dữ liệu nên chuẩn bị:

title\_vi

title\_en

summary\_vi

summary\_en

content\_vi

content\_en

MVP có thể chỉ triển khai tiếng Việt. Không nên trì hoãn Pilot vì chưa có phiên bản tiếng Anh.

# **13\. SEO**

Vì Atlas là website public, cần chuẩn bị từ đầu:

• SEO Title.

• SEO Description.

• Open Graph Image.

• Slug ổn định.

• Canonical URL.

• Sitemap.

• Metadata/structured data phù hợp.

# **14\. BẢN ĐỒ VIỆT NAM — P1**

Bản đồ là tính năng phù hợp với tên “Atlas”, nhưng không phải điều kiện bắt buộc của P0.

Có thể hiển thị số doanh nghiệp theo tỉnh/thành và nhấn vào địa phương để xem danh sách doanh nghiệp. Không cần hệ thống GIS phức tạp trong MVP.

# **15\. ATLAS ADMIN**

NexTure cần khu vực quản trị không public.

URL tham khảo:

/admin/publishing

Hiển thị danh sách yêu cầu:

• Doanh nghiệp.

• Nội dung.

• Loại entity.

• Người gửi.

• Thời gian gửi.

• Trạng thái.

Admin NexTure có:

• Preview.

• Approve.

• Reject.

• Request Edit.

# **16\. RELATED CONTENT**

Atlas nên tận dụng relationship đã được Publish để tự hiển thị các nội dung liên quan.

Ví dụ:

• Story hiển thị Related People và Related Events.

• Person hiển thị Related Stories và Products.

• Product hiển thị Related People và Timeline Events.

Không tạo bản sao dữ liệu riêng cho từng trang.

# **17\. API PUBLIC THAM KHẢO**

GET /public/companies

GET /public/companies/:slug

GET /public/stories/:slug

GET /public/people/:slug

GET /public/products/:slug

GET /public/projects/:slug

GET /public/events/:slug

GET /public/search

Atlas chỉ được gọi API public. Không được gọi trực tiếp API dữ liệu PRIVATE/INTERNAL của Hub.

# **18\. PHẠM VI MVP**

**P0:**

• Trang chủ.

• Explore Companies.

• Company Profile.

• Public Timeline.

• Story Page.

• People Page.

• Product/Project Page.

• Search cơ bản.

• Admin Publishing.

• Related Content cơ bản.

**P1:**

• Semantic Search.

• Bản đồ.

• Song ngữ.

• Related Content nâng cao.

• Featured Content management.

• SEO nâng cao.

**Chưa làm:**

• Like.

• Comment.

• Follow.

• Chat.

• News Feed.

• Social Network.

• Marketplace.

• User-generated content công khai trực tiếp.

# **19\. ĐIỀU KIỆN ATLAS MVP HOÀN THÀNH**

Một người ngoài hệ thống phải có thể:

Tìm doanh nghiệp → Mở Company Profile → Xem Timeline → Đọc Story → Xem People/Product liên quan.

Toàn bộ dữ liệu phải đến từ nội dung đã được doanh nghiệp cho phép công khai và đã qua Publishing Layer.

# **20\. LƯU Ý CHO ĐỘI TECH**

• Atlas là public projection, không phải nguồn dữ liệu gốc.

• Không cho phép Atlas sửa dữ liệu gốc của Hub.

• Không dùng API private của Hub cho client public.

• Cần tối ưu SEO, performance và cache vì Atlas là website công khai.

• Slug và public URL phải ổn định kể cả khi dữ liệu Hub được chỉnh sửa.

• Phải xử lý trường hợp Unpublish để trang public ngừng hiển thị đúng cách.

**NEXTURE MVP — PHẦN 3**

**KẾT NỐI DIGITAL CULTURE HUB VÀ CULTURE ATLAS**

*Publishing & Synchronization Layer*

# **1\. MỤC TIÊU**

Phần này mô tả cách Digital Culture Hub và Vietnam Enterprise Culture Atlas liên kết với nhau.

Mục tiêu là để hai website có thể có giao diện riêng nhưng vẫn là một hệ thống NexTure thống nhất:

• Hub tạo, quản trị và xác minh dữ liệu.

• Publishing Layer kiểm soát quyền công khai, duyệt và phiên bản.

• Atlas chỉ hiển thị dữ liệu đã được phép công khai.

# **2\. KIẾN TRÚC TỔNG THỂ**

Hai frontend có thể dùng hai domain riêng, ví dụ:

hub.nexture.vn

atlas.nexture.vn

Nhưng không nên xây hai nguồn dữ liệu độc lập.

Kiến trúc:

**NEXURE CORE**

↓

CULTURE DATA CORE

↓

PUBLISHING & SYNCHRONIZATION LAYER

↙                                      ↘

DIGITAL CULTURE HUB                    CULTURE ATLAS

Private / Internal                     Public

Quản trị                               Khám phá và lan tỏa

Thiết kế database và quyền truy cập của lớp kết nối phải được tính ngay từ đầu, không đợi làm xong Hub và Atlas mới bổ sung.

# **3\. HUB LÀ NGUỒN DỮ LIỆU GỐC**

Hub là Source of Truth.

Atlas không tự tạo Story, Event, Person hay Product/Project độc lập.

Một entity được tạo và xác minh trong Hub. Khi được công khai, Atlas hiển thị phiên bản public của cùng entity thay vì tạo một bản dữ liệu không liên hệ với Hub.

# **4\. HAI LỚP TRẠNG THÁI**

## **4.1. Visibility**

Mỗi record có:

PRIVATE

INTERNAL

PUBLIC

PRIVATE: Chỉ người có quyền trong Hub được xem.

INTERNAL: Dùng trong doanh nghiệp nhưng không được đưa lên Atlas.

PUBLIC: Doanh nghiệp cho phép record tham gia quy trình xuất bản.

## **4.2. Publish Status**

Mỗi publication có:

NOT\_REQUESTED

REQUESTED

UNDER\_REVIEW

APPROVED

PUBLISHED

REJECTED

UNPUBLISHED

Ví dụ:

visibility \= PUBLIC

publish\_status \= NOT\_REQUESTED

Điều này có nghĩa doanh nghiệp cho phép công khai nhưng chưa gửi nội dung lên Atlas.

# **5\. QUY TRÌNH ĐƯA NỘI DUNG TỪ HUB LÊN ATLAS**

DATA CREATED

↓

AI PROCESSING

↓

HUMAN REVIEW

↓

VERIFIED

↓

SELECT PUBLIC

↓

PUBLIC PREVIEW

↓

REQUEST PUBLISH

↓

NEXURE REVIEW

↓

APPROVED

↓

CREATE PUBLIC SNAPSHOT

↓

PUBLISHED ON ATLAS

Không được có luồng AI GENERATED → PUBLIC.

# **6\. NÚT “ĐƯA LÊN CULTURE ATLAS”**

Trong Hub, khi record đã VERIFIED, người dùng có nút:

Đưa lên Culture Atlas

Khi bấm, hệ thống mở Public Preview để doanh nghiệp kiểm tra chính xác nội dung sẽ xuất hiện bên ngoài.

# **7\. CHỌN DỮ LIỆU ĐƯỢC CÔNG KHAI**

Không phải mọi field của record đều phải public.

Ví dụ Story có:

• Title.

• Summary.

• Story Content.

• Cover Image.

• Sources.

• Internal Notes.

• Contributor Information.

• Related Events.

• Related Products.

Doanh nghiệp có thể chọn công khai:

☑ Title

☑ Summary

☑ Story Content

☑ Cover Image

☑ Related Events

Không công khai:

☐ Internal Notes

☐ Contributor Information

☐ Original Documents

MVP nên thiết kế data model đủ linh hoạt để hỗ trợ field-level publishing, dù giao diện đầu tiên có thể dùng preset thay vì cho tick từng field.

# **8\. PUBLIC SNAPSHOT**

Atlas không nên đọc trực tiếp record đang được Editor chỉnh sửa trong Hub.

Khi Publish, hệ thống tạo Public Snapshot.

Ví dụ:

Hub Story Version \= 8

Atlas Published Version \= 5

Atlas tiếp tục hiển thị Version 5 cho đến khi doanh nghiệp chủ động cập nhật phiên bản công khai.

Lợi ích:

• Tránh thay đổi ngoài ý muốn.

• Có thể kiểm tra nội dung trước khi công bố.

• Có lịch sử phiên bản.

• Có thể rollback khi cần.

# **9\. CẬP NHẬT NỘI DUNG ĐÃ CÔNG KHAI**

Nếu Hub thay đổi sau khi Publish:

Hub Version \= 8

Atlas Version \= 5

Hub hiển thị trạng thái:

CHANGED\_AFTER\_PUBLISH

Admin có thể:

• Xem thay đổi.

• Cập nhật lên Culture Atlas.

Sau khi được duyệt, hệ thống tạo Public Snapshot mới và Atlas chuyển sang phiên bản mới.

# **10\. UNPUBLISH**

Hub có nút:

Gỡ khỏi Culture Atlas

Khi Unpublish:

• Atlas ngừng hiển thị record.

• Dữ liệu vẫn tồn tại trong Hub.

• Lịch sử publication vẫn được lưu.

• Search index public phải được cập nhật.

Không được đồng nhất Unpublish với Delete.

# **11\. ARCHIVE VÀ DELETE**

Archive:

Giữ dữ liệu nhưng ẩn khỏi hoạt động thường xuyên.

Unpublish:

Chỉ gỡ phiên bản public khỏi Atlas.

Delete:

Xóa dữ liệu khỏi Hub theo quyền và quy định.

Nếu record đang PUBLISHED, hệ thống phải cảnh báo và yêu cầu Unpublish trước khi Delete.

# **12\. ĐỒNG BỘ QUAN HỆ**

Ví dụ trong Hub:

Person A → PARTICIPATED\_IN → Event B → RELATED\_TO → Product C

Nếu các entity và relationship đều được phép công khai, Atlas tự động hiển thị:

• Person A có Related Event B.

• Event B có Related Product C.

• Product C có Related People.

Không nhập lại thủ công ở Atlas.

# **13\. MỘT RECORD XUẤT HIỆN Ở NHIỀU NƠI**

Ví dụ Event “Ra mắt sản phẩm ABC” có thể xuất hiện ở:

• Company Timeline.

• Product ABC.

• Founder Profile.

• Culture Story.

Nhưng vẫn chỉ là một entity nguồn. Các trang chỉ tham chiếu đến cùng public entity/snapshot.

# **14\. DATABASE BỔ SUNG CHO PUBLISHING**

Ngoài database Hub, cần tối thiểu:

publications

publication\_versions

publications có thể gồm:

id

organization\_id

entity\_type

entity\_id

visibility

publish\_status

current\_public\_version

requested\_by

approved\_by

requested\_at

approved\_at

published\_at

unpublished\_at

atlas\_slug

publication\_versions có thể gồm:

id

publication\_id

source\_version

public\_payload

created\_at

created\_by

public\_payload chỉ chứa dữ liệu được phép công khai.

# **15\. PUBLIC PROJECTION**

Khuyến nghị bảo mật:

Hub Data

↓

Publishing Service

↓

Public Snapshot / Public Projection

↓

Public API

↓

Atlas

Atlas không query trực tiếp các bảng stories, events, people, products\_projects trong vùng dữ liệu nội bộ.

Có thể sử dụng:

• Bảng publications.

• Bảng public\_profiles.

• Bảng public\_search\_index.

Hoặc schema riêng:

public.\*

# **16\. API KẾT NỐI THAM KHẢO**

Từ Hub:

GET /entities/:id/public-preview

POST /entities/:id/request-publish

Quản trị Publishing:

POST /publishing/:id/approve

POST /publishing/:id/reject

POST /publishing/:id/publish

POST /publishing/:id/republish

POST /publishing/:id/unpublish

Atlas:

GET /public/companies/:slug

GET /public/stories/:slug

GET /public/people/:slug

GET /public/products/:slug

GET /public/events/:slug

Tên API là đề xuất, đội backend có thể điều chỉnh.

# **17\. CULTURE ATLAS CONTROL CENTER TRONG HUB**

Hub nên có riêng menu Culture Atlas.

Trang này hiển thị:

• Trạng thái Culture Atlas Profile.

• Số Stories Published.

• Số Events Published.

• Số People Published.

• Số Products Published.

• Số nội dung Pending.

• Số nội dung Needs Update.

• Last Updated.

Các tab:

• Published.

• Pending.

• Draft.

• Needs Update.

• Rejected.

Nút:

Preview as Visitor

# **18\. LUỒNG PILOT HOÀN CHỈNH**

Một doanh nghiệp Pilot đi theo:

# **1\. Tạo Culture Hub.**

# **2\. Nhập Founder Story.**

# **3\. Nhập 5–10 Events.**

# **4\. Upload tài liệu.**

# **5\. AI hỗ trợ cấu trúc.**

# **6\. Doanh nghiệp xác minh.**

# **7\. Hoàn thiện Culture Timeline.**

# **8\. Chọn 3–5 nội dung PUBLIC.**

# **9\. Preview.**

# **10\. Request Publish.**

# **11\. NexTure Review.**

# **12\. Culture Atlas Profile được tạo.**

Đầu ra Pilot:

• Một Culture Hub nội bộ.

• Một Culture Timeline.

• Một số Stories đã chuẩn hóa.

• Một Culture Atlas Profile nếu doanh nghiệp đồng ý công khai.

# **19\. BẢO MẬT BẮT BUỘC**

Backend phải đảm bảo:

• Kiểm tra organization\_id ở mọi request.

• Áp dụng Role-based Access Control ở backend.

• Không trả dữ liệu PRIVATE qua Public API.

• Không trả dữ liệu INTERNAL qua Public API.

• Atlas không có quyền truy cập toàn bộ database Hub.

• AI không được tự Publish.

• Nội dung Publish phải lưu người gửi/người duyệt.

• Publish/Unpublish phải có Activity Log.

• Thông tin cá nhân nhạy cảm không được mặc định đưa vào Public Snapshot.

• Doanh nghiệp luôn có quyền yêu cầu Unpublish.

# **20\. EVENT ĐỒNG BỘ — P1**

MVP chưa cần message broker phức tạp nhưng nên định nghĩa các event nghiệp vụ:

CONTENT\_PUBLISHED

CONTENT\_UPDATED

CONTENT\_UNPUBLISHED

COMPANY\_PUBLISHED

COMPANY\_UNPUBLISHED

Ví dụ CONTENT\_PUBLISHED có thể kích hoạt:

• Tạo/cập nhật public page.

• Cập nhật public search index.

• Cập nhật Related Content.

• Xóa cache liên quan.

Giai đoạn đầu có thể dùng background job. Chỉ dùng message queue khi quy mô thực sự yêu cầu.

# **21\. ĐIỀU KIỆN KẾT NỐI HOÀN THÀNH**

Phần kết nối được xem là hoàn thành khi chạy được toàn bộ luồng:

Verified Record trong Hub → Chọn PUBLIC → Preview → Request Publish → Approve → Tạo Public Snapshot → Atlas hiển thị → Hub sửa dữ liệu nhưng Atlas chưa đổi → Republish → Atlas cập nhật → Unpublish → Atlas gỡ nội dung.

# **22\. THỨ TỰ PHÁT TRIỂN**

Giai đoạn A — Hub:

Authentication → Organization → Data Model → Culture Library → Story/Event/People/Product → AI → Review → Timeline.

Giai đoạn B — Atlas cơ bản:

Public Layout → Company Profile → Story → People → Product → Timeline.

Giai đoạn C — Publishing Integration:

Visibility → Publish Status → Preview → Public Snapshot → Approve → Publish → Republish → Unpublish.

Lưu ý quan trọng: Dù triển khai theo ba giai đoạn, schema dữ liệu và quyền truy cập của Publishing Layer phải được thiết kế ngay từ Giai đoạn A.

# **23\. LƯU Ý QUAN TRỌNG**

• Không xây hai nguồn dữ liệu độc lập rồi đồng bộ thủ công.

• Không để Atlas đọc trực tiếp dữ liệu nội bộ.

• Không để AI tự công khai nội dung.

• Không mặc định PUBLIC toàn bộ doanh nghiệp.

• Không xóa Public Snapshot chỉ vì record Hub được chỉnh sửa.

• Versioning và Activity Log nên có ngay trong thiết kế ban đầu.

• Luồng Publish/Unpublish phải được kiểm thử như một chức năng bảo mật, không chỉ là chức năng nội dung.

