# Hướng dẫn dùng chung cho mọi agent sinh nội dung KB Tarot (đọc kỹ trước khi viết)

## Mục tiêu
KB 78 lá Rider-Waite-Smith, tiếng Việt, cho một trợ lý bói bài trong app. LLM sẽ luận bài dựa trên KB này, không được tự nghĩ nghĩa.
Chất lượng đích: một reader tarot người Việt có nghề đọc mà không thấy sượng. Người dùng cuối chủ yếu hỏi tình cảm, công việc, tiền bạc.

## Ràng buộc cứng — vi phạm là hỏng cả mẻ
1. KHÔNG crawl, không copy, không dịch từ bất kỳ trang tarot nào (Biddy Tarot, Labyrinthos, Learning the Tarot, web tarot tiếng Việt...). Không WebSearch, không WebFetch trong lúc viết. Toàn bộ là văn viết mới.
2. Nguồn neo duy nhất: A. E. Waite, *The Pictorial Key to the Tarot* (1911) — bản trích đã có sẵn ở `/home/claude/kb/ref/pictorial_key/<id>.md` — và hệ Golden Dawn (Book T) cho chiêm tinh (đã điền sẵn ở `catalog.json`). Đọc để lấy dữ kiện, KHÔNG chép câu.
3. Không sinh nghĩa mới ngoài truyền thống. Ý nào không thuộc tầng nghĩa chung mà mọi trường phái đều công nhận thì bỏ.
4. CẤM TUYỆT ĐỐI, kể cả gián tiếp: chẩn đoán bệnh; tiên đoán sinh tử; chuyện thai sản (mang thai, sinh nở, hiếm muộn); kết quả kiện tụng; khuyến nghị mua bán, đầu tư (chứng khoán, coin, vàng, đất). Lá Thần Chết, Ba Kiếm, Mười Kiếm, Toà Tháp, Nữ Hoàng, Công Lý, Hai Tiền... càng phải cẩn thận. Ví dụ: Nữ Hoàng = nuôi dưỡng, sung túc, sinh sôi theo nghĩa rộng — không nói "có tin vui bầu bí". Công Lý = công bằng, nhân quả, cân nhắc — không nói "thắng kiện".
5. CẤM sáo ngữ tâm linh dịch máy: "năng lượng vũ trụ", "vũ trụ đang mời gọi", "hành trình tâm hồn của bạn", "mở lòng đón nhận", "tần số rung động", "chữa lành đứa trẻ bên trong", "đánh thức", "khai mở", "bản thể", "buông bỏ để đón nhận", "thông điệp từ vũ trụ", "trân trọng khoảnh khắc hiện tại". Cũng tránh cấu trúc câu dịch: "Lá bài này nói rằng...", "Đây là thời điểm để bạn...", "Hãy cho phép bản thân...", "Bạn được mời gọi...", "Điều quan trọng là...".

## Giọng văn
- Tiếng Việt tự nhiên, gọn, đời. Như một người bói có nghề nói với khách ngồi trước mặt: chắc tay, không văn vẻ, không lên gân.
- Câu ngắn. Động từ mạnh. Cụ thể hơn trừu tượng. Ưu tiên từ thuần Việt hơn Hán Việt khi có lựa chọn ("chờ" thay "kiên nhẫn chờ đợi", "giữ của" thay "bảo toàn tài sản").
- Viết cho người hỏi thật: "người này", "chuyện này", "mối này", "chỗ làm"... Không xưng hô "bạn" tràn lan; khi cần thì dùng "người hỏi".
- Không dùng dấu chấm than. Không emoji. Không gạch đầu dòng trong chuỗi văn xuôi.

## Quy tắc phân biệt (quan trọng nhất)
Mỗi giá trị phải phân biệt được rõ với các lá còn lại trong nhóm. Nếu hai lá đang ra gần giống nhau, dừng lại, tìm cho ra điểm khác nhau thật sự trong truyền thống, rồi viết lại cả hai.
Ví dụ chuẩn: Ba Cốc = vui vì CÓ NGƯỜI CÙNG; Chín Cốc = thoả mãn RIÊNG MÌNH; Mười Cốc = viên mãn LÂU DÀI, có gốc rễ.
Cùng số khác chất cũng phải khác: Năm Gậy = va chạm để thử sức; Năm Cốc = tiếc cái đã đổ, quên cái còn lại; Năm Kiếm = thắng mà mất người; Năm Tiền = thiếu thốn mà đi ngang cửa giúp đỡ không thấy.

## Định dạng output
JSON hợp lệ, UTF-8, key là `id` lá, ghi vào đúng đường dẫn được giao. Không thêm trường nào khác. Không bọc markdown. Kiểm tra lại số phần tử theo yêu cầu trước khi ghi.
