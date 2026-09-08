# Kiểm độc lập: 14 bài luận mẫu + system prompt (không sửa file, chỉ báo cáo)

Đọc: `/home/claude/kb/ref/STYLE.md`, rồi `/home/claude/kb/prompts/system_luan_bai.md`, rồi `/home/claude/kb/build/spreads.json` (11 kiểu trải, 14 ví dụ).

Kiểm bài luận mẫu, từng bài:
1. AN TOÀN: có câu nào khẳng định/gợi ý về bệnh, sinh tử, thai sản, kết quả kiện tụng, khuyến nghị mua/bán/đầu tư/vay không. Hai bài có ghi_chu (mua đất; có người khác không) phải chuyển hướng đúng mục 5 và không kết luận. Cờ đỏ nếu vi phạm.
2. BÁM KB: với 3 bài bạn chọn ngẫu nhiên (một bài 1 lá, một bài 3–5 lá, bài Celtic), mở `/home/claude/kb/cards/<id>.yaml` của các lá và đối chiếu: bài có đọc lá đúng `cot_loi` không, có bịa chi tiết hình không có trong `bieu_tuong` không, có vi phạm phần "đừng đọc thành" trong `canh_bao` không, lá ngược có đọc theo một trong ba hướng không. Cờ đỏ nếu đọc sai lá.
3. TUÂN THỦ SYSTEM PROMPT: giọng (xưng "bạn"/"mình", không "bạn thân mến"), không cụm cấm, không "sẽ"/"chắc chắn"/"nhất định", không chấm than, không tiêu đề/gạch đầu dòng, không tên lá tiếng Anh, đoạn cuối có câu trả lời thẳng + một việc cụ thể, độ dài trong khung, có mở bằng toàn cảnh, có theo luat_doc của kiểu trải (ví dụ có/không phải mở bằng đúng một trong ba cụm; Celtic phải gom cụm).
4. GIỌNG: chỗ nào nghe như văn dịch, chỗ nào sáo, chỗ nào doạ hoặc tô hồng, chỗ nào "việc cụ thể" ở cuối quá mơ hồ hoặc quá kỳ quặc.

Kiểm system prompt: có chỗ nào mâu thuẫn nội bộ, thiếu, hay quá dài/lặp không; có luật nào LLM khó thực thi không; có chỗ nào chính bài mẫu vi phạm mà prompt không nói tới không.

Không dùng WebSearch/WebFetch. Không sửa file.
Ghi `/home/claude/kb/reports/F_kiem_trai_bai_va_prompt.md`: mục Cờ đỏ (an toàn / bám KB), mục Tuân thủ (bảng 14 bài × các tiêu chí, ✓/✗), mục Giọng (id ví dụ: trích → gợi ý sửa), mục System prompt (nhận xét + đề xuất sửa cụ thể, trích câu). Cuối: tổng cờ đỏ.
Kết thúc: trả lời ngắn tổng cờ đỏ và các chỗ cần sửa cụ thể (spread_id.vi_du[i]: trích → sửa).
