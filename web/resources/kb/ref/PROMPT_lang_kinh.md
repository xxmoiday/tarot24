# Nhiệm vụ: viết trường `lang_kinh` cho TRỌN nhóm {G}

Đọc trước: `/home/claude/kb/ref/STYLE.md`, rồi `/home/claude/kb/ref/ctx/lang_kinh_{G}.md` (mọi lá trong nhóm, kèm bieu_tuong, cot_loi, tu_khoa_xuoi, tu_khoa_nguoc đã sinh).

`lang_kinh` là object 5 khoá, mỗi khoá đúng MỘT câu: `tinh_cam`, `cong_viec`, `tien_bac`, `tam_ly`, `hoc_hanh`. Đây là câu mà LLM sẽ dựa vào khi khách hỏi đúng lĩnh vực đó — nên nó phải là cách lá này "hạ xuống" lĩnh vực ấy, không phải nhắc lại cot_loi.

Quy tắc:
- Mỗi câu 15–35 chữ. Nói được tình huống điển hình trong lĩnh vực đó khi lá xuất hiện xuôi; có thể kèm nửa vế "nếu ngược thì..." khi thật cần, nhưng đừng máy móc câu nào cũng có.
- Cụ thể hoá bằng tình huống đời người Việt: tinh_cam (đang tìm hiểu, đang yêu, đã cưới, chia tay, người cũ, gia đình hai bên); cong_viec (xin việc, sếp, đồng nghiệp, dự án, làm riêng, đổi việc); tien_bac (lương, nợ, để dành, chi tiêu, lộc, mất tiền — KHÔNG khuyên mua/bán/đầu tư cái gì); tam_ly (trạng thái trong đầu, cách người hỏi đang nhìn chính mình); hoc_hanh (thi cử, học nghề, học thêm, luận văn, tập trung).
- Không "bạn". Dùng "người hỏi", "người này", "hai người", "chuyện này", hoặc câu không chủ ngữ.
- Không dấu chấm than. Không sáo ngữ trong STYLE.md. Không câu mở kiểu "Trong tình cảm, lá này...", "Về công việc,...": vào thẳng tình huống.
- Nhìn cả nhóm theo TỪNG khoá: đọc {N} câu tinh_cam liền nhau như một cột — nếu hai câu đổi chỗ cho nhau vẫn đúng thì viết lại. Làm vậy cho cả 5 cột. Không dùng một mẫu câu lặp cho cả cột ("... nhưng ...", "không phải ... mà ...").
- Danh sách cấm áp dụng gắt ở đây: không bệnh, không sinh tử, không thai sản, không kiện tụng, không khuyến nghị đầu tư (kể cả "nên gửi tiết kiệm", "đừng mua đất lúc này").

Output: ghi JSON `/home/claude/kb/raw/lang_kinh/{G}.json` dạng {"<id>": {"tinh_cam": "...", "cong_viec": "...", "tien_bac": "...", "tam_ly": "...", "hoc_hanh": "..."}, ...} đủ mọi lá, UTF-8, Write tool. Sau khi ghi, chạy:
python3 -c "import json;d=json.load(open('/home/claude/kb/raw/lang_kinh/{G}.json'));print(len(d));[print(k, [x for x in ['tinh_cam','cong_viec','tien_bac','tam_ly','hoc_hanh'] if x not in v]) for k,v in d.items()]"
rồi in từng cột ra đọc lại (ví dụ `python3 -c "import json;d=json.load(open('...'));[print(k,'|',v['tinh_cam']) for k,v in d.items()]"`) và sửa nếu có hai câu đổi chỗ được.

KHÔNG dùng WebSearch/WebFetch. Kết thúc: trả lời ngắn số lá đã ghi; cột nào khó tách nhất và bạn đã tách thế nào.
