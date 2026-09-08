# Nhiệm vụ: viết trường `bieu_tuong` cho TRỌN nhóm {G}

Đọc trước: `/home/claude/kb/ref/STYLE.md` (ràng buộc cứng), rồi `/home/claude/kb/ref/groups/{G}.md` (danh sách lá trong nhóm + trích Pictorial Key của Waite cho từng lá).

Viết `bieu_tuong` cho TỪNG lá trong nhóm, trong cùng một lượt, nhìn cả nhóm để không lá nào bị mô tả giống lá khác.

Quy tắc trường `bieu_tuong`:
- Mảng 5–8 chuỗi. Mỗi chuỗi là MỘT mệnh đề quan sát được trên lá bài Rider-Waite-Smith: nhân vật, tư thế, vật cầm, trang phục, bối cảnh, thời tiết, màu sắc chủ đạo, con vật, cây cỏ, biểu tượng nhỏ.
- Chỉ ghi thứ NHÌN THẤY. Không ghi diễn giải ("tượng trưng cho", "thể hiện", "cho thấy"). Không ghi cảm xúc suy đoán trừ khi nét mặt/tư thế hiện rõ (ví dụ "gục đầu vào tay" được, "đang đau khổ tột cùng" không).
- Tránh con số đếm được gây tranh cãi: viết "những đốm sáng nhỏ", "một chùm quả", đừng viết "22 đốm". Số lượng vật chủ đạo trùng số lá (ba cốc, năm gậy) thì ghi được.
- Bám vào mô tả của Waite làm dữ kiện chính; bổ sung chi tiết hình ảnh chuẩn RWS mà bạn chắc chắn (bộ bài Pamela Colman Smith 1909, bản phổ thông màu vàng nền trời...). Chỗ nào không chắc thì BỎ, đừng bịa. Không chép câu tiếng Anh của Waite sang tiếng Việt kiểu dịch máy; mô tả lại bằng tiếng Việt tự nhiên.
- Trường này dùng cho cả prompt gen ảnh lẫn phần trích dẫn khi luận, nên ghi cụ thể, gọn, giàu hình.
- Bắt đầu bằng chi tiết đặc trưng nhất của lá (cái mà nhìn vào là nhận ra lá đó), kết bằng chi tiết nền.

Output: ghi file JSON `/home/claude/kb/raw/bieu_tuong/{G}.json` dạng {"<id>": ["...", "..."], ...} đủ mọi lá trong nhóm, UTF-8, không bọc markdown. Dùng Write tool. Sau khi ghi, chạy `python3 -c "import json;d=json.load(open('/home/claude/kb/raw/bieu_tuong/{G}.json'));print(len(d),[k for k,v in d.items() if not 5<=len(v)<=8])"` để tự kiểm, sửa nếu có lá sai số phần tử.

KHÔNG dùng WebSearch/WebFetch. Không đọc trang tarot nào. Chỉ dùng file đã cho + hiểu biết của bạn về hình lá RWS.

Kết thúc: trả lời ngắn gọn: số lá đã ghi, và liệt kê những chi tiết bạn KHÔNG chắc chắn (để hỏi lại reader), theo dạng "id: chi tiết".
