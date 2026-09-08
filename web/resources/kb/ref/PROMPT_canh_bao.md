# Nhiệm vụ: viết trường `canh_bao` cho TRỌN nhóm {G}

Đọc trước: `/home/claude/kb/ref/STYLE.md`, rồi `/home/claude/kb/ref/ctx/canh_bao_{G}.md` (mọi lá trong nhóm, kèm các trường đã sinh).

`canh_bao` là MỘT đoạn 2–4 câu (40–90 chữ), gồm hai phần nối liền, không đánh dấu:
1. Mặt tối của lá — cái xấu đi khi lá này xuất hiện quá đà, sai chỗ, hoặc ngược. Không lặp lại tu_khoa_nguoc dạng liệt kê; viết thành tình huống.
2. Chỉ dẫn cho NGƯỜI LUẬN (LLM) nên tránh đọc theo hướng nào: những cách hiểu sai phổ biến về lá này, những chỗ dễ đọc lố (ví dụ Thần Chết: đừng đọc thành chết chóc hay bệnh tật; Ba Cốc: đừng mặc định là ngoại tình; Mười Tiền: đừng hứa hẹn giàu có; Nữ Hoàng: đừng lái sang thai sản). Phần này viết ở giọng hướng dẫn nội bộ, có thể dùng "đừng đọc thành...", "không nên suy ra...", "tránh gắn với...".

Quy tắc:
- Phần 2 bắt buộc có ít nhất một chỉ dẫn CỤ THỂ cho lá này, không dùng chỉ dẫn chung chung kiểu "đừng quá tiêu cực".
- Với lá chạm gần danh sách cấm (bệnh, sinh tử, thai sản, kiện tụng, đầu tư), phần 2 phải nêu đích danh hướng cấm đó để LLM không lấn. Lá nào không gần thì không cần nhắc danh sách cấm.
- Nhìn cả nhóm: {N} đoạn phải khác nhau về nội dung lẫn cấu trúc câu. Không mở tất cả bằng "Khi ngược, ...". Không kết tất cả bằng "đừng đọc thành...".
- Không "bạn". Không dấu chấm than. Không sáo ngữ.

Output: JSON `/home/claude/kb/raw/canh_bao/{G}.json` dạng {"<id>": "đoạn văn", ...}, UTF-8, Write tool. Kiểm lại số lá bằng `python3 -c "import json;d=json.load(open('/home/claude/kb/raw/canh_bao/{G}.json'));print(len(d));[print(k,'|',v) for k,v in d.items()]"`, đọc liền một lượt, sửa nếu có hai đoạn nhoè nhau hoặc cùng khuôn câu.

KHÔNG dùng WebSearch/WebFetch. Kết thúc: trả lời ngắn số lá đã ghi; lá nào bạn thấy chỉ dẫn "tránh đọc" là quan trọng nhất và vì sao.
