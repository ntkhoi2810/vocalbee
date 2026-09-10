# Kiến trúc VocalBee

## Runtime

```text
Browser (React, responsive CSS)
    ↓ HttpOnly session cookie + same-origin JSON requests
Next.js Route Handlers (Node runtime)
    ↓ Authentication / role / ownership checks
Service layer (sessions, research, exports)
    ↓ Review engine / content / grading
SQLite (node:sqlite, WAL, durable server disk)
```

Không dùng `localStorage` làm nguồn dữ liệu học. Hai trình duyệt đăng nhập cùng tài khoản sẽ đọc cùng tiến độ trên server. Thư viện đáp án ở `content.ts` không được import vào client bundle; nhãn chủ đề nằm riêng trong `topics.ts`.

## Các bảng

| Bảng | Dữ liệu |
|---|---|
| `users` | Username duy nhất, scrypt password hash, owner teacher, hồ sơ JSON |
| `auth_sessions` | SHA-256 của token ngẫu nhiên, user, thời hạn |
| `login_failures` | Giới hạn 10 lần sai/tài khoản trong 15 phút |
| `progress` | Unique user–word, điểm, lịch thích ứng, mốc cố định, lỗi |
| `sessions` | User, ngày, kind, scope, trạng thái, câu hỏi/lựa chọn đã lưu |
| `attempts` | Unique session–item, đáp án, thống kê nghiên cứu |
| `mode_switches` | Trước/sau/thời gian/đợt |
| `experiments` | Owner, khối, phase, phiên bản khóa, lịch sử chuyển phase |
| `schema_version` | Phiên bản schema khởi đầu |

Các trường cần index/uniqueness được đặt thành cột SQL; payload có kiểu TypeScript lưu JSON để giữ MVP gọn. Schema khởi tạo idempotent trong `db.ts`. Các lần thay schema sau cần migration và sao lưu rõ ràng.

## Giao dịch và chống ghi trùng

- `BEGIN IMMEDIATE` bao quanh tạo phiên, trả lời, đổi chế độ, phân nhóm, đổi giai đoạn, import tài khoản.
- Ghi attempt và progress/cursor trong cùng transaction.
- Unique `(session_id, item_id)` chống tính điểm hai lần khi gửi lại.
- Unique `(user_id, day, kind, scope)` chống sinh challenge trùng.
- Bài kiểm tra kiểm tra thêm scope/phase để không mở lại vào ngày khác.
- Chỉ chấm câu hiện tại của phiên được sở hữu; không nhận điểm hoặc đáp án đúng từ client.
- Gợi ý được lưu trên server. Gọi `next` trước khi trả lời không xóa cờ gợi ý.
- Phiên ghi nhận `mode` lúc tạo; chế độ của attempt luôn lấy từ phiên.

## API

| Endpoint | Mục đích |
|---|---|
| `GET /api/auth` | Cho giao diện biết demo có được bật |
| `POST /api/auth` | Đăng nhập |
| `DELETE /api/auth` | Đăng xuất, thu hồi token |
| `GET /api/app` | State phù hợp vai trò và người dùng |
| `GET /api/app?export=attempts\|switches\|summary` | CSV, chỉ giáo viên; optional `experiment` |
| `POST /api/app` | Mutation theo `action` |

Actions học sinh: `mode`, `start`, `answer`, `next`, `hint`.

Actions giáo viên: `createStudent`, `importStudents`, `resetPassword`, `createExperiment`, `assign`, `phase`.

Cookie HttpOnly, SameSite=Lax, thời hạn 7 ngày; Secure cấu hình khi dùng HTTPS. Mutation yêu cầu Origin cùng Host. Giáo viên chỉ thao tác học sinh/đợt do mình sở hữu. Database và `.env.local` bị loại khỏi Git.

## Quy mô và triển khai

Bản này dành cho một máy chủ Node và nhóm pilot/trường học nhỏ. SQLite đồng bộ phù hợp tải nhỏ; xử lý hashing nhiều tài khoản và export lớn có thể chặn event loop. Chưa có benchmark tải đồng thời hoặc kiến trúc nhiều replica.

Nếu mở rộng, có thể thay lớp persistence bằng PostgreSQL/Supabase, giữ các quy tắc giao dịch, quyền sở hữu và engine thuần ở `review.ts`. Không đặt tệp SQLite vào runtime serverless với đĩa tạm.

Google Fonts chỉ dùng để trình bày; khi không có Internet, giao diện dùng Arial/sans-serif. Việc học và chấm không gọi dịch vụ AI hay API học tập bên ngoài.
