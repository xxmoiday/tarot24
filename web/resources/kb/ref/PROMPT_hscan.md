# Nhiệm vụ: quét NGANG — soát cùng số / cùng cấp, khác chất

Đọc trước: `/home/claude/kb/ref/STYLE.md`, rồi `/home/claude/kb/ref/ctx/{CTX}` — gồm các nhóm ngang {LIST}, mỗi nhóm là 4 lá cùng số (hoặc cùng cấp hoàng gia) ở 4 chất, kèm cot_loi, tu_khoa_xuoi, tu_khoa_nguoc đã sinh theo nhóm dọc.

Việc của bạn: các trường này được viết theo nhóm dọc (trong cùng chất), nên chưa ai nhìn ngang. Với từng nhóm ngang, đặt 4 lá cạnh nhau và hỏi:
1. cot_loi của 4 lá có tách nhau rõ không, hay hai lá đang nói cùng một chuyện chỉ đổi danh từ (ví dụ Năm Gậy và Năm Kiếm đều "tranh cãi")? Số giống nhau là chuyện của số, nhưng chất phải làm nó khác hẳn: Gậy = việc/ý chí/hứng, Cốc = tình cảm/quan hệ, Kiếm = đầu óc/lời nói/sự thật, Tiền = vật chất/việc làm/thân thể.
2. tu_khoa_xuoi / tu_khoa_nguoc: có cụm nào xuất hiện ở ≥ 2 lá trong nhóm ngang không? Có cụm nào chung chung đến mức đặt sang lá bên cạnh vẫn đúng không?
3. Có cụm nào vi phạm danh sách cấm hoặc sáo ngữ trong STYLE.md không?

Cách sửa: CHỈ sửa khi có vấn đề thật. Sửa theo CẶP: nếu hai lá nhoè nhau, viết lại cả hai (hoặc ít nhất viết lại một lá và kiểm tra lá kia đã đủ khác). Giữ nguyên giọng văn và độ dài. Khi sửa cot_loi phải giữ nhất quán với tu_khoa của lá đó. Không thêm nghĩa mới ngoài truyền thống.

File để sửa (Edit tool, sửa đúng chuỗi cần đổi, không ghi lại cả file): `/home/claude/kb/raw/cot_loi/<G>.json`, `/home/claude/kb/raw/tu_khoa_xuoi/<G>.json`, `/home/claude/kb/raw/tu_khoa_nguoc/<G>.json` với G = G2 (Gậy), G3 (Cốc), G4 (Kiếm), G5 (Tiền), G6 (hoàng gia). Sau mỗi lần sửa, chạy `python3 -c "import json;json.load(open('<file>'))"` để chắc JSON còn hợp lệ.

Ghi báo cáo `/home/claude/kb/reports/H_scan_{TAG}.md`: với mỗi nhóm ngang, một dòng "OK" hoặc liệt kê vấn đề tìm thấy + đã sửa gì (trích trước/sau). Cuối báo cáo: những chỗ bạn thấy sượng nhưng không dám sửa vì không chắc truyền thống.

KHÔNG dùng WebSearch/WebFetch. Kết thúc: trả lời ngắn số vấn đề tìm thấy, số chỗ đã sửa.
