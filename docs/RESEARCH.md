# VocalBee — Quy tắc nghiên cứu phiên bản đầu

## 1. Phạm vi kết luận

Ứng dụng phân ngẫu nhiên cân bằng hai nhóm **mặc định ban đầu** trong từng khối:

- A: ôn cố định.
- B: ôn thích ứng.

Học sinh có thể tự chuyển ở cả hai hướng. `assignedGroup` không đổi; `mode` là lựa chọn cho phiên tiếp theo; chế độ trong `sessions`/`attempts` phản ánh phương pháp thực tế.

Vì cho phép chuyển, so sánh theo nhóm ban đầu phản ánh tác động của **việc được gán phương pháp mặc định khi vẫn được quyền chọn**. So sánh theo chế độ tự chọn là phân tích bổ sung, có thể bị nhiễu bởi năng lực/động lực. Bản này chưa tách riêng tác động của Daily Challenge khỏi thích ứng chọn từ và chọn dạng bài.

## 2. Nội dung và phiên học

- Bốn khối, mỗi khối 24 mục từ thuộc 4 chủ đề.
- Trong nghiên cứu, thứ tự từ mới cố định theo bộ từ; lựa chọn chủ đề cá nhân không thay đổi thứ tự này.
- Mỗi ngày tối đa 5 từ mới, 8 từ ôn và 5 câu ngữ cảnh. Số mục giảm khi chưa có đủ từ; quy tắc định mức chung cho cả hai chế độ.
- Khi chưa đủ từ đến hạn, ôn bổ sung từ đã học theo chiến lược hiện tại.
- Một Daily Challenge/học sinh/ngày Việt Nam. Không có thưởng lặp lại bằng cách chuyển chế độ.
- Một phiên đang làm có thể tiếp tục ngày khác; ngày được giao của challenge giữ nguyên. Biểu đồ lượt trả lời sử dụng ngày thực tế trả lời, chuỗi hoàn thành tính theo ngày được giao.
- Không có luyện vô hạn từ sổ lỗi; nút luyện đưa về phiên hằng ngày.
- Xem từ trong thư viện không thay đổi điểm. Thời gian/việc học ngoài app không được đo.

## 3. Điểm ghi nhớ

Chỉ số nội bộ, chưa hiệu chỉnh thành xác suất nhớ:

| Sự kiện | Thay đổi |
|---|---|
| Đúng ở câu đầu của một từ mới, không gợi ý | Điểm 40, hẹn ngày sau |
| Đúng lần đầu của từ trong ngày khác, không gợi ý | +15, tối đa 100 |
| Đúng như trên và lịch thích ứng đã đến hạn | Tăng một bậc khoảng ôn |
| Sai | −20, tối thiểu 0; bậc 0; hẹn ngày sau |
| Đúng có gợi ý | Không tăng điểm/bậc; hẹn ngày sau |
| Đúng thêm cùng ngày | Không tăng điểm/bậc |

Các câu sai cùng ngày vẫn được ghi lỗi và trừ điểm. Điểm không giảm tự động chỉ do thời gian trôi qua. “Nhớ khá vững” = điểm ≥80 và ít nhất 2 ngày có câu đúng không gợi ý.

Lần kiểm tra ngay sau thẻ từ mới là một phần học có tiếp xúc nội dung, không phải phép đo ghi nhớ độc lập. Dùng bộ pre/post/retention riêng để đánh giá ghi nhớ.

## 4. Hai lịch ôn

### Cố định

Mốc tuyệt đối: ngày 1, 3, 7, 14, 30 kể từ ngày học đầu. Không đổi do điểm hoặc đáp án. Từ đến hạn xếp trước, sau đó theo mốc lịch và mã từ. Dạng bài luân phiên theo vị trí và số mốc ôn đã hoàn thành.

### Thích ứng

Khoảng cách 1, 3, 7, 14, 30 ngày kể từ ngày ôn phù hợp. Từ quá hạn/đến hạn xếp trước; thứ tự tiếp theo: ngày hẹn, điểm thấp, số lỗi nhiều, mã từ. Dạng lỗi tích lũy nổi bật được ưu tiên, xen kẽ các dạng khác để không chỉ luyện mãi một kỹ năng.

### Khi chuyển chế độ

- Tiến độ chung luôn cập nhật từ lượt học ở cả hai chế độ.
- Lịch cố định lưu mốc đã hoàn thành; lịch thích ứng lưu `stage`/`nextDay`.
- Một lần truy hồi thực tế ở bất kỳ chế độ nào đánh dấu các mốc cố định đã trôi qua là được đáp ứng, tránh bắt lặp lại nhiều mốc cũ chỉ vì đổi chế độ.
- Phiên đang làm giữ nguyên chiến lược; lựa chọn mới dùng ở phiên tiếp theo.
- Thay đổi được lưu trước/sau, thời gian và đợt nghiên cứu.

## 5. Bài kiểm tra và kiểm soát thực nghiệm

`baseline → learning → post → waiting → retention → closed`

- 12 từ mục tiêu được chọn cố định, phân bố đều bốn chủ đề; luân phiên nghĩa/chính tả/cách dùng.
- Cùng mục tiêu và dạng bài ở các giai đoạn; thứ tự lựa chọn đáp án được xáo trộn rồi lưu. Đây không phải các bộ đề tương đương đã được chuẩn hóa độc lập; việc gặp lại mục tiêu có thể tạo hiệu ứng kiểm tra.
- Không có gợi ý, đáp án hoặc phản hồi đúng/sai từng câu. Hiển thị điểm tổng khi hoàn thành.
- Không đưa toàn bộ thư viện từ xuống client ngoài giai đoạn học tập.
- Câu kiểm tra không cập nhật điểm ghi nhớ, sổ lỗi hay lịch ôn.
- Giữ riêng lượt kiểm tra trong dữ liệu bằng `kind`.
- Ít nhất 5 ngày nghỉ sau khi đóng post-test trước khi giáo viên mở retention.
- Tất cả bài kiểm tra cần hoàn thành trước khi chuyển giai đoạn; các phiên đang làm cũng cần hoàn thành. Bản đầu chưa có quy trình loại/ghi nhận rút lui giữa đợt trên giao diện.
- Tài khoản đã học bộ từ không được đưa vào một baseline mới.
- Phiên bản nội dung/thuật toán và thời gian chuyển giai đoạn được lưu ở đợt. Nếu phiên bản runtime khác, server từ chối mở/tiếp tục phiên; cần chạy lại đúng phiên bản đã khóa.

Nhà trường xác định lịch 2–4 tuần, nhóm tham gia và quy trình đồng thuận phù hợp. Chỉ dùng mã học sinh/tên hiển thị cần thiết; phân tích bằng CSV đã mã hóa danh tính.

## 6. Chỉ số

- **Độ chính xác dashboard:** đúng / tổng lượt đầu tiên của mỗi từ trong từng ngày học. Chỉ phản ánh hoạt động trong app.
- **Tăng điểm cặp:** post − pre, chỉ lấy học sinh có đủ hai điểm.
- **Retention:** điểm bài kiểm tra sau thời gian nghỉ.
- **Lỗi lặp lại:** xét từng cặp từ–dạng bài, chỉ câu đầu ở mỗi ngày. Sau một câu sai, lần gặp ở ngày khác tạo một cơ hội; nếu lần đó tiếp tục sai thì tăng tử số. Không cộng lần sửa ngay sau đáp án vào mẫu số. Không có cơ hội thì để trống, không ghi 0%.
- **Ngày có học:** ít nhất một lượt trả lời bài học.
- **Ngày hoàn thành:** số ngày được giao challenge đã làm hết.
- **Mức tiếp xúc phương pháp:** số lượt `fixed`/`adaptive` và số lần chuyển.
- **Thời gian trả lời:** thời gian tường từ lúc server mở câu đến lúc nhận đáp án; có thể bao gồm thời gian không hoạt động, không diễn giải là thời gian chú ý thuần túy.

Không gộp trực tiếp điểm các khối. Bảng so sánh là thống kê mô tả; chưa tính p-value, khoảng tin cậy hoặc điều chỉnh biến nhiễu.

## 7. CSV

### `attempts`

Một dòng/lượt trả lời. Có mã học sinh, khối, cờ demo, nhóm ban đầu, chế độ thực tế, đợt, phiên, câu, thời gian, loại phiên/bài, từ, câu trả lời, đúng/sai, gợi ý, luyện lại cùng ngày, thời gian phản hồi, điểm, lý do chọn và phiên bản.

### `switches`

Một dòng/lần chuyển, giữ mã học sinh, cờ demo, thời gian, chế độ cũ/mới, đợt.

### `summary`

Một dòng/học sinh, gồm nhóm, mức sử dụng hai chế độ, số chuyển, pre/post/retention, tăng điểm cặp, ngày học/hoàn thành, tử số/mẫu số lỗi lặp lại và mốc giai đoạn. Học sinh chỉ tham gia tối đa một đợt trên mỗi tài khoản ở bản này.

Các CSV không chứa tên đăng nhập, tên hiển thị hoặc mật khẩu. Câu trả lời do học sinh nhập vẫn là dữ liệu gốc; rà soát nếu học sinh tự nhập thông tin cá nhân. Các trường có tiền tố công thức spreadsheet được vô hiệu hóa và CSV được quote/escape.
