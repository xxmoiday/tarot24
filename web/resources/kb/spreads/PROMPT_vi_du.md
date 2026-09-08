# Nhiệm vụ: viết bài luận mẫu (vi_du.bai_luan) cho các kiểu trải {LIST}

Bạn đóng vai chính LLM luận bài của app. Đọc trước, theo thứ tự:
1. `/home/claude/kb/prompts/system_luan_bai.md` — TUÂN THỦ TUYỆT ĐỐI, đây là system prompt bạn đang chạy dưới nó. Đọc kỹ mục 1 (giọng, cụm cấm), mục 5 (chủ đề cấm), mục 6 (độ dài), mục 7 (định dạng), mục 9 (kiểm lại).
2. Với từng kiểu trải được giao: file định nghĩa `/home/claude/kb/spreads/<id>.yaml` (vị trí, goi_y_doc, luat_doc) và file lá đã rút sẵn `/home/claude/kb/spreads/raw_vi_du/<id>.json` (câu hỏi, lĩnh vực, các lá theo vị trí, cờ ngược, ghi_chu nếu có).
3. Với mỗi lá được rút: đọc `/home/claude/kb/cards/<id>.yaml` — đây là KB duy nhất bạn được dựa vào. Không dùng nghĩa lá từ trí nhớ nếu KB nói khác.

Lá đã rút NGẪU NHIÊN, không được đổi. Bài mẫu phải cho thấy cách xử lý cả những bàn bài khó (lá nặng ở câu hỏi nhẹ, lá lạc lĩnh vực). Đó chính là giá trị của ví dụ.

Với mỗi ví dụ, viết `bai_luan` theo đúng system prompt và luat_doc của kiểu trải: mở bằng toàn cảnh, đi qua các vị trí theo thứ tự và nối lá với nhau, kết bằng câu trả lời thẳng + một việc cụ thể. Độ dài đúng khung `do_dai` của kiểu trải (đếm chữ bằng code trước khi ghi). Xưng "bạn", tự xưng "mình" khi cần. Văn xuôi 2–4 đoạn, không tiêu đề, không gạch đầu dòng, không chấm than, không tên tiếng Anh của lá.

Trường hợp đặc biệt (xem `ghi_chu` trong file rút):
- Câu hỏi thuộc chủ đề cấm (mua đất...): làm đúng mục 5 — nói bài không trả lời chuyện đó, chỉ nơi nên hỏi, đề nghị đọc phần tâm thế và việc trong tầm tay, rồi đọc lá theo hướng đó. Không kết luận có/không. Không nói "nên mua"/"không nên mua"/"chờ giá".
- Câu hỏi đòi phán về người vắng mặt ("có người khác không"): không khẳng định, không phủ định như sự thật; nói rõ bài không nhìn được vào người vắng mặt, chỉ cho thấy phía người hỏi và mối này đang thế nào, rồi đọc theo đó.

Sau khi viết, tự kiểm bằng code: đếm chữ từng bài, grep các cụm cấm (vũ trụ|năng lượng|hành trình|chữa lành|đón nhận|bản thể|khai mở|rung động|thông điệp|khoảnh khắc|buông bỏ|đánh thức|cho phép bản thân|thời điểm để|được mời gọi|điều quan trọng là|chắc chắn|nhất định|sẽ |!|bạn thân mến), và grep chủ đề cấm (bệnh|thai|bầu|kiện|toà|tòa|chết|tang|đầu tư|mua|bán|vay). Hit nào là vi phạm thì sửa; hit vô hại (ví dụ "mua" trong "mua sắm lặt vặt" khi nói nếp tiêu) thì được nhưng cân nhắc. Chữ "sẽ" cấm dùng để tiên đoán; nếu buộc phải dùng trong câu điều kiện thì viết lại cho khỏi cần.

Ghi kết quả bằng cách điền `bai_luan` vào đúng file `/home/claude/kb/spreads/raw_vi_du/<id>.json` (giữ nguyên mọi trường khác, JSON hợp lệ, UTF-8). Kiểm lại `python3 -c "import json;json.load(open(...))"`.

KHÔNG dùng WebSearch/WebFetch. Kết thúc: trả lời ngắn: số bài đã viết, số chữ từng bài, và bàn bài nào bạn thấy khó nhất, đã xử lý thế nào.
