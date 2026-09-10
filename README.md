# VocalBee 🐝

Web app học từ vựng tiếng Anh cho **lớp 6, 7, 8, 9**, có hai chế độ ôn học sinh tự chuyển và công cụ thực nghiệm ngay trong bản đầu.

**Next.js 16 · React 19 · TypeScript · SQLite phía server**

## Chạy ngay trên máy

Yêu cầu **Node.js 22.14 trở lên** và npm. Khuyến nghị Node.js 22 LTS.

```bash
npm install
npm run dev
```

Mở **http://localhost:3000**. Database tự khởi tạo tại `data/vocalbee.sqlite` khi ứng dụng nhận yêu cầu đầu tiên. Chế độ development mặc định bật tài khoản demo.

| Vai trò | Tài khoản | Mật khẩu demo |
|---|---|---|
| Học sinh lớp 6 | `student6` | `VocalBee2026!` |
| Học sinh lớp 7 | `student7` | `VocalBee2026!` |
| Học sinh lớp 8 | `student8` | `VocalBee2026!` |
| Học sinh lớp 9 | `student9` | `VocalBee2026!` |
| Giáo viên | `teacher` | `VocalBee2026!` |

Trang đăng nhập có nút vào nhanh từng tài khoản demo. Tài khoản demo được đánh dấu trong CSV; bảng so sánh mặc định loại dữ liệu demo.

## Những gì đã có

### Không gian học sinh

- Dashboard tiếng Việt, responsive cho điện thoại và máy tính.
- **96 từ mẫu**: 24 từ/khối, 4 chủ đề/khối, nghĩa Việt, phiên âm, ví dụ và bản dịch.
- Tìm kiếm từ, xem thẻ từ, học theo chủ đề.
- Ba dạng bài được tạo từ nội dung: chọn nghĩa, gõ chính tả, điền từ trong câu.
- Chấm đáp án phía server, phản hồi giải thích và gợi ý.
- Daily Challenge: tối đa 5 từ mới + 8 từ ôn + 5 câu vận dụng; phiên đầu ngắn hơn vì chưa có từ ôn.
- Sổ lỗi theo nghĩa/chính tả/cách dùng; lọc, tìm kiếm và trạng thái cải thiện.
- Điểm ghi nhớ, lịch đến hạn, chuỗi ngày hoàn thành và hoạt động 7 ngày.
- Tự động lưu sau từng câu; đóng trình duyệt và tiếp tục phiên đang làm.
- **Tự chuyển Ôn cố định ↔ Ôn thích ứng**, giữ nguyên tiến độ và lịch sử.

### Không gian giáo viên

- Cấp tài khoản học sinh theo khối; không yêu cầu email/ngày sinh.
- Nhập danh sách CSV theo giao dịch: một dòng lỗi thì cả lần nhập không được lưu.
- Đặt lại mật khẩu học sinh, kết thúc các phiên đăng nhập cũ.
- Tạo đợt thực nghiệm theo khối, phân nhóm A/B ngẫu nhiên cân bằng.
- Điều khiển pre-test → học tập → post-test → chờ → retention test → kết thúc.
- Bài kiểm tra 12 câu cùng mục tiêu từ/dạng bài ở các đợt đo; không gợi ý hoặc phản hồi đúng/sai từng câu.
- Khóa nội dung học ngoài giai đoạn học tập; retention mở sớm nhất 5 ngày sau khi đóng post-test.
- Bảng kết quả theo học sinh và thống kê mô tả theo nhóm ban đầu.
- Ba loại CSV: lượt trả lời, lịch sử chuyển chế độ, tổng hợp kết quả.
- Mã học sinh thay cho tên/tài khoản trong các báo cáo nghiên cứu.

## Hai chế độ hoạt động thế nào?

| | Ôn cố định | Ôn thích ứng |
|---|---|---|
| Mốc ôn | Ngày 1, 3, 7, 14, 30 tính từ ngày học đầu | Khoảng 1, 3, 7, 14, 30 ngày kể từ lần ôn phù hợp |
| Ảnh hưởng của đáp án | Không thay đổi các mốc | Đúng giãn lịch, sai hẹn ôn sớm |
| Chọn từ | Đến hạn và thứ tự định trước | Đến hạn, điểm thấp, lỗi |
| Chọn dạng bài | Luân phiên có quy tắc | Ưu tiên dạng lỗi, xen kẽ các dạng còn lại |
| Dữ liệu học | Dùng chung | Dùng chung |

**Lựa chọn mới có hiệu lực từ phiên tiếp theo.** Phiên đang làm giữ chế độ đã chốt khi bắt đầu. Chuyển qua lại không tạo thêm thử thách trong cùng ngày. Mỗi lượt trả lời lưu chế độ thực tế của phiên, không lấy tùy ý từ trình duyệt.

Điểm ghi nhớ là **chỉ số quy ước 0–100, không phải xác suất nhớ đúng**. Một câu đúng sau khi dùng gợi ý hoặc luyện lại cùng ngày không làm tăng điểm/bậc ôn.

Chi tiết: [Thiết kế nghiên cứu và thuật toán](docs/RESEARCH.md).

## Tổ chức thực nghiệm đầu tiên

1. Đăng nhập giáo viên, mở **Quản lý thực nghiệm**.
2. Cấp tài khoản nghiên cứu mới hoặc nhập CSV. Dùng tài khoản chưa học bộ từ để có baseline sạch.
3. Tạo đợt theo khối, ví dụ “Lớp 7 · Học kỳ I”.
4. Chọn **Học sinh & dữ liệu**, chọn học sinh cùng khối rồi **Phân nhóm A/B**.
5. Học sinh đăng nhập làm pre-test. Khi tất cả hoàn thành, giáo viên mở giai đoạn Học tập.
6. Cho học 2–4 tuần. Học sinh có thể tự đổi chế độ; ứng dụng ghi nhận tất cả thay đổi.
7. Khi các phiên đang làm đã hoàn thành, giáo viên mở post-test.
8. Khi tất cả hoàn thành post-test, chuyển sang Chờ đo ghi nhớ. Sau ít nhất 5 ngày mở retention test.
9. Hoàn tất bài đo, kết thúc đợt và xuất CSV.

Ứng dụng không tự chuyển giai đoạn. Các mốc chuyển được ghi thời gian để đối chiếu nghiên cứu. Không thể nhảy giai đoạn, đóng khi còn phiên đang làm, hoặc chuyển khỏi giai đoạn kiểm tra khi vẫn còn bài chưa hoàn thành.

### CSV danh sách học sinh

Tải mẫu ngay trong trang giáo viên hoặc tại `/students-template.csv`:

```csv
username,name,grade,password
lop7_hs01,Học sinh 01,7,MatKhauRieng123!
lop7_hs02,Học sinh 02,7,MatKhauRieng456!
```

Tên đăng nhập: 3–32 ký tự không dấu, chữ/số/`_`/`-`. Mật khẩu: 8–128 ký tự. CSV UTF-8 hỗ trợ dấu phẩy trong trường được đặt trong ngoặc kép. Tối đa 200 học sinh và 18.000 ký tự/lần nhập.

## Chạy production / mạng trường học

SQLite được chọn để app chạy độc lập, không cần Supabase hoặc AI API. Cần **máy chủ Node có ổ đĩa bền vững**, dùng chung cho các học sinh; không triển khai database này lên filesystem tạm của Vercel/serverless.

Tạo `.env.local` dựa trên `.env.example`. Với đợt dùng thật, chọn thư mục dữ liệu mới, tách khỏi bản demo:

```dotenv
VOCALBEE_DEMO=false
VOCALBEE_ADMIN_PASSWORD=your-own-long-password
VOCALBEE_DATA_DIR=./data/production
VOCALBEE_SECURE_COOKIE=false
```

Thay mật khẩu trên bằng mật khẩu riêng tối thiểu 12 ký tự. Tài khoản quản trị `teacher` được tạo ở lần khởi tạo database đầu tiên; thay biến môi trường không đổi mật khẩu một tài khoản đã tồn tại.

```bash
npm run build
npm start
```

Server lắng nghe `0.0.0.0:3000`. Trong cùng mạng, học sinh truy cập `http://<IP-máy-chủ>:3000` nếu cổng được mở. Khi đặt sau reverse proxy HTTPS, giữ đúng header `Host` và đặt `VOCALBEE_SECURE_COOKIE=true`.

Muốn xem **production build ở chế độ demo**, đặt `VOCALBEE_DEMO=true` trong `.env.local` trước khi chạy `npm start`.

### Docker

```bash
docker build -t vocalbee .
docker run --name vocalbee -p 3000:3000 -v vocalbee-data:/app/data -e VOCALBEE_DEMO=false -e VOCALBEE_ADMIN_PASSWORD=your-own-long-password vocalbee
```

Container sử dụng named volume để giữ database qua lần triển khai. Dockerfile được cung cấp để tự triển khai; các kiểm thử của phiên bản này được chạy trực tiếp bằng Node, chưa chạy container.

### Sao lưu

Dừng server rồi sao lưu toàn bộ thư mục chỉ định bởi `VOCALBEE_DATA_DIR` (gồm cả tệp WAL/SHM nếu còn). Khôi phục vào đúng đường dẫn và chạy lại cùng phiên bản mã nguồn. CSV phục vụ phân tích, không thay thế bản sao lưu database.

## Kiểm thử

```bash
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm audit
```

- Unit/integration: hai lịch ôn, giới hạn điểm, gợi ý, ngày Việt Nam, dữ liệu bốn khối, lỗi lặp lại, CSV, nhập nguyên tử, quyền truy cập, chống gửi trùng và vòng đời thực nghiệm.
- Playwright: học hết phiên, lưu qua reload, đổi chế độ giữa hành trình, giao diện 390px, giáo viên tạo đợt/phân nhóm/xuất dữ liệu, xác thực và cùng nguồn.
- E2E tự khởi động production server cổng 3100, tạo database riêng dưới `data/e2e-*`. Không dùng dữ liệu demo/chính thức đang chạy. Screenshot nằm trong `test-results/`.

## Cấu trúc

```text
src/app/                    Next.js, CSS và API
src/components/             Giao diện học sinh, giáo viên, phiên học
src/lib/content.ts          96 từ khởi đầu, chỉ dùng phía server
src/lib/topics.ts           Nhãn/chủ đề công khai, không chứa đáp án
src/lib/review.ts           Điểm và hai chiến lược ôn
src/lib/service.ts          Phiên học, thực nghiệm, phân quyền nghiệp vụ
src/lib/db.ts               SQLite, schema, tài khoản, mật khẩu
src/lib/analytics.ts        Mẫu số và tử số lỗi lặp lại
src/lib/csv.ts              Bộ đọc CSV danh sách
tests/                     Unit, integration, trình duyệt
docs/                      Nghiên cứu và kiến trúc
```

## Phạm vi nội dung của bản đầu

Đây là **MVP hoạt động cho pilot**, với 96 từ tự biên soạn theo chủ đề, chưa phải bộ từ trọn chương trình hoặc một bộ sách cụ thể. Bài vận dụng dùng dạng điền từ có nghĩa mục tiêu để tránh nhiều đáp án ngữ cảnh hợp lý; chưa có bài kéo thả sắp xếp câu.

Nội dung được quản lý trong `src/lib/content.ts`; hiện chưa có trình biên tập/import nội dung từ giao diện. Giáo viên cần rà soát bộ từ, câu hỏi và đề đo trước đợt thực nghiệm chính thức. Tăng `CONTENT_VERSION`/`ALGORITHM_VERSION` khi thay nội dung/thuật toán và dùng đợt mới; không sửa nội dung giữa một đợt đang đo.

Không dùng AI API, microphone hoặc dịch vụ chấm nói. Chi phí vận hành chủ yếu là máy chủ.
