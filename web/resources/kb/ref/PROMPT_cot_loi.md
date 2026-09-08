# Nhiệm vụ: viết trường `cot_loi` cho TRỌN nhóm {G}

Đọc trước, theo thứ tự: `/home/claude/kb/ref/STYLE.md` (ràng buộc cứng, giọng văn, quy tắc phân biệt), rồi `/home/claude/kb/ref/ctx/cot_loi_{G}.md` (mọi lá trong nhóm: chiêm tinh Golden Dawn, trích Waite, và `bieu_tuong` đã sinh).

`cot_loi` là gì: 1–2 câu. Câu BẤT BIẾN của lá — cái lõi mà mọi bài luận về lá này, ở bất kỳ lĩnh vực nào, phải quay về được. Không phải mô tả hình, không phải danh sách từ khoá, không phải lời khuyên. Là "lá này nói về chuyện gì, và cái gì làm nó khác lá bên cạnh".

Cách viết:
- Viết cho cả nhóm trong một lượt. Viết xong, đọc lại 78... à không, đọc lại {N} câu liền nhau như một danh sách: nếu có hai câu đổi chỗ cho nhau mà vẫn đúng, tức là chưa đạt. Tìm điểm khác nhau thật sự trong truyền thống rồi viết lại cả hai.
- Với lá số cùng chất: bám tiến trình Át → Mười (mầm → hai ngả → mở rộng → ổn định → va vấp → cân bằng lại → thử thách → chuyển động → gần đích → tận cùng). Mỗi lá là một nấc, không lặp nấc.
- Với Ẩn Chính: bám vòng cung Kẻ Khờ → Thế Giới, mỗi lá một bài học, không lá nào là "phiên bản mạnh hơn" của lá khác. Ví dụ: Nữ Tư Tế = biết mà chưa nói; Ẩn Sĩ = rút lui để tự hiểu; Người Treo Ngược = đứng yên và nhìn ngược lại. Ba lá đều tĩnh nhưng ba chuyện khác nhau.
- Với hoàng gia: đặt trong ma trận 4 cấp × 4 chất. Cấp là độ chín (Tiểu Đồng học việc, Hiệp Sĩ xông đi, Hoàng Hậu giữ từ bên trong, Vua điều hành từ bên ngoài), chất là chất liệu. Cùng cấp khác chất phải khác, cùng chất khác cấp phải khác.
- Dùng tương phản ngầm khi hữu ích: "không phải A mà là B", "vui vì có người cùng, chứ không phải thoả mãn một mình". Nhưng đừng lạm dụng mẫu câu này cho mọi lá; giọng phải đa dạng.
- Tiếng Việt đời, chắc, không văn hoa. Không "bạn". Không dấu chấm than. Không sáo ngữ trong STYLE.md. Không nhắc hình ảnh lá bài trong cot_loi (đã có bieu_tuong).
- Chỉ nghĩa truyền thống chung. Không lấn vào danh sách cấm (bệnh, sinh tử, thai sản, kiện tụng, đầu tư).
- Độ dài: 20–60 chữ mỗi lá.

Output: ghi file JSON `/home/claude/kb/raw/cot_loi/{G}.json` dạng {"<id>": "câu cốt lõi", ...} đủ mọi lá trong nhóm, UTF-8, dùng Write tool. Sau khi ghi, chạy `python3 -c "import json;d=json.load(open('/home/claude/kb/raw/cot_loi/{G}.json'));print(len(d));[print(k,'|',v) for k,v in d.items()]"` và đọc lại toàn bộ danh sách một lần cuối với câu hỏi: "có hai câu nào đổi chỗ cho nhau vẫn đúng không". Nếu có, sửa file rồi mới kết thúc.

KHÔNG dùng WebSearch/WebFetch. Không đọc trang tarot nào.

Kết thúc: trả lời ngắn: số lá đã ghi; các cặp bạn thấy khó tách và cách bạn đã tách; chỗ nào bạn không chắc về truyền thống.
