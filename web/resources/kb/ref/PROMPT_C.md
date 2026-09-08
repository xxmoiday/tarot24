# Agent C — kiểm AN TOÀN và GIỌNG VĂN (không sửa file, chỉ ghi báo cáo)

Phạm vi: các lá {SCOPE}. File: `/home/claude/kb/cards/<id>.yaml`. Đọc `/home/claude/kb/ref/STYLE.md` trước để biết danh sách cấm và sáo ngữ.

Quét từng lá, mọi trường văn bản (bieu_tuong, cot_loi, tu_khoa_*, canh_bao, lang_kinh.*, cach_noi_viet, ba_cach_doc.*):

1. AN TOÀN — cờ đỏ nếu có nội dung, kể cả gián tiếp, thuộc: chẩn đoán bệnh / sức khoẻ xấu đi; tiên đoán sinh tử, tang, tai nạn; thai sản (mang thai, sinh nở, hiếm muộn, sẩy thai); kết quả kiện tụng (thắng/thua kiện, án, toà); khuyến nghị mua bán đầu tư (nên mua/bán/giữ, đất, vàng, coin, chứng khoán, gửi tiết kiệm, vay). LƯU Ý: trường `canh_bao` được phép NHẮC các hướng này để cấm LLM ("đừng đọc thành bệnh tật") — đó không phải vi phạm. Vi phạm là khi nội dung KHẲNG ĐỊNH hoặc GỢI Ý theo hướng cấm.
2. SÁO NGỮ dịch máy — cờ đỏ cho mọi cụm trong danh sách cấm ở STYLE.md và các cụm cùng họ ("vũ trụ", "năng lượng" theo nghĩa tâm linh, "hành trình", "chữa lành", "đón nhận", "bản thể", "khai mở", "rung động", "thông điệp", "khoảnh khắc hiện tại", "buông bỏ"...). Cụm "chữa lành" xuất hiện trong canh_bao để cấm thì không tính.
3. GIỌNG VĂN — chấm riêng: chỗ nào nghe như văn dịch từ tiếng Anh (cấu trúc "Đây là thời điểm để...", "Hãy cho phép bản thân...", "Bạn được mời gọi...", lạm dụng "của bạn", danh từ hoá kiểu "sự + động từ" dày đặc, "một cách + tính từ", câu bị động lạ tai), chỗ nào dùng "bạn" như đại từ xưng hô với người hỏi, chỗ nào có dấu chấm than, chỗ nào Hán Việt trừu tượng dày đến mức sượng. Ghi mức: "sượng rõ" / "hơi sượng".
4. CHÍNH TẢ / DẤU — lỗi chính tả, dấu câu, cụm thành ngữ viết sai.

Trước khi đọc bằng mắt, chạy grep bằng code để không sót: ví dụ
python3 - <<'PY'
import glob,re,yaml
pat=re.compile(r"vũ trụ|năng lượng|hành trình|chữa lành|đón nhận|bản thể|khai mở|rung động|thông điệp|khoảnh khắc|buông bỏ|đánh thức|bạn |của bạn|!|mang thai|có thai|bầu|sinh nở|hiếm muộn|sảy thai|sẩy thai|thai|kiện|toà|tòa|án |bệnh|ốm|ung thư|chết|qua đời|tang|tai nạn|đầu tư|cổ phiếu|chứng khoán|coin|mua đất|mua vàng|tiết kiệm|vay",re.I)
for p in sorted(glob.glob('/home/claude/kb/cards/*.yaml')):
    txt=open(p).read()
    for i,l in enumerate(txt.splitlines(),1):
        if pat.search(l): print(p.split('/')[-1],i,l.strip()[:160])
PY
rồi đọc từng dòng grep ra để phân loại (vi phạm thật / nhắc để cấm / từ đồng âm vô hại như "bầu" trong "bầu không khí", "bạn bè").

Không dùng WebSearch/WebFetch. Không sửa file.

Ghi báo cáo `/home/claude/kb/reports/C_an_toan_giong_van_{TAG}.md`:
## Cờ đỏ an toàn
- <id>.<trường>: "<trích>" → <vi phạm gì>
## Cờ đỏ sáo ngữ
- ...
## Giọng văn (sượng rõ)
- <id>.<trường>: "<trích>" → <vì sao sượng, gợi ý sửa ngắn>
## Giọng văn (hơi sượng)
- ...
## Chính tả / dấu
- ...
## Nhận xét chung về giọng (5–10 dòng): tổng thể có nghe như người Việt viết không, trường nào yếu nhất
Cuối file: tổng số cờ đỏ (an toàn + sáo ngữ).
Kết thúc: trả lời ngắn số cờ đỏ và 5 chỗ sượng nhất.
