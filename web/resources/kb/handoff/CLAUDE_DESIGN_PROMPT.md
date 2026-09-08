# Prompt cho Claude Design — Tarot24

Dán toàn bộ phần dưới đường kẻ vào Claude Design. Mock data bên dưới là dữ liệu thật lấy từ KB, giữ nguyên chữ, không tự viết lại.

---

Thiết kế web bói tarot tiếng Việt tên **Tarot24**, mobile-first, có bản desktop. Dựng thành một canvas nhiều artboard: 8 màn mobile (390×844) và 4 màn desktop (1440×900), kèm một artboard design system. Dùng đúng mock data ở cuối prompt, không đổi chữ, không thêm emoji, không dấu chấm than trong bất kỳ copy nào.

## Mood và hệ thống

Tối, huyền bí nhưng sạch. Không hoạ tiết chiêm tinh rối, không glow tím hồng kiểu app bói rẻ tiền. Cảm giác như một phòng đọc bài đêm khuya có đèn vàng: nền xanh đen thẫm, ánh vàng đồng điểm xuyết, nhiều khoảng thở. Ảnh lá bài là nhân vật chính; UI lùi lại để tôn ảnh.

Màu: nền `#0B0F1A`, nền nổi `#131A2A`, viền mờ `#26304A`, chữ chính `#EDE6D6` (kem ấm, không trắng tinh), chữ phụ `#9AA3B8`, vàng đồng `#C9A961` cho tiêu đề nhấn, viền lá và CTA, vàng sáng `#E8C97A` cho hover, đỏ trầm `#B5544D` chỉ dùng cho nhãn "lá ngược" và cảnh báo, xanh rêu nhạt `#7FA38A` cho nhãn "nghiêng về có". Gradient duy nhất được phép: hào quang vàng rất mờ (opacity 8–12%) sau cụm lá ở hero.

Chữ: tiêu đề serif có chân, nét thanh đậm rõ (Playfair Display hoặc Cormorant Garamond), chữ thân sans dễ đọc tiếng Việt có dấu (Be Vietnam Pro hoặc Inter). Bài luận dùng serif cỡ 17–18px, line-height 1.7, đo dòng 60–68 ký tự, vì đây là thứ người ta đọc lâu nhất. Kiểm tra dấu tiếng Việt không bị cắt ở mọi cỡ chữ.

Lá bài: tỉ lệ 2:3, bo góc 10px, viền 1px vàng đồng 40%, đổ bóng sâu mềm; mặt sau là hoạ tiết hình học tối màu với một ngôi sao tám cánh vàng đồng ở giữa. Lá ngược xoay 180° và có nhãn nhỏ "ngược" màu đỏ trầm góc dưới. Placeholder ảnh: dùng khối màu `#1C2436` với tên lá ở giữa (ảnh thật sẽ thay sau, đường dẫn `/cards/<id>.webp`).

Xưng hô trong mọi copy: người dùng là "bạn". Giọng ngắn, đời, chắc; không "khám phá", không "hành trình", không "năng lượng", không "vũ trụ".

## Artboard cần dựng

**A. Design system**: bảng màu, thang chữ (H1 40/32, H2 28/24, H3 20, body 17, small 14, label 12 caps tracking), nút (primary vàng đồng chữ tối; secondary viền vàng chữ kem; ghost), chip từ khoá (hai biến thể: xuôi viền vàng, ngược viền đỏ trầm), thẻ kiểu trải, lá bài úp/ngửa/ngược ba trạng thái, drawer, ô nhập câu hỏi, nhãn "nghiêng về có / nghiêng về không / chưa ngã ngũ", footer với dòng miễn trừ.

**M1. Trang chủ (mobile)**: logo chữ "Tarot24" serif, tagline "Rút bài, đọc rõ, làm được". Hero: ba lá bài xoè hình quạt (Ngôi Sao ngửa ở giữa, hai lá úp hai bên), CTA "Rút bài ngay". Khối "Lá hôm nay": lá Ngôi Sao ngửa, tên, dòng "hy vọng lặng · lành dần · còn tin", câu "Nhẹ, trong, không còn phòng thủ; hy vọng không ồn nhưng vững, đang lành và dám nhìn về xa." và link "Xem lá này". Danh sách kiểu trải (dùng mock data mục 1), nhóm "Cơ bản" trước, "Chuyên đề" sau, mỗi thẻ có tên, số lá dạng "3 lá", một câu mô tả. Cuối: lối vào "Thư viện 78 lá", liên kết "Xem thêm bói Lenormand tại lenormand24.online", footer.

**M2. Đặt câu hỏi**: tiêu đề "Ba lá quá khứ, hiện tại, tương lai gần", mô tả, ba chip gợi ý câu hỏi (mục 2), ô nhập nhiều dòng với placeholder "Bạn đang vướng chuyện gì", bộ chọn lĩnh vực dạng chip: Tình cảm · Công việc · Tiền bạc · Tâm lý · Học hành · Chung (đang chọn Công việc), dòng "Xào bài, rút ba lá và đặt thành hàng ngang từ trái sang phải theo thứ tự quá khứ, hiện tại, tương lai gần.", nút "Xào bài".

**M3. Rút bài**: bộ bài úp xoè ngang cuộn được, hướng dẫn "Chạm chọn 3 lá", ba ô trống phía trên có nhãn "Quá khứ · Hiện tại · Tương lai gần", trạng thái đã chọn 2/3 (hai lá đã lật: Chín Tiền, Bốn Tiền), lá thứ ba đang bay vào.

**M4. Kết quả (bài luận)**: ba lá xếp ngang có nhãn vị trí, lá Mặt Trăng ở "Tương lai gần"; câu hỏi in nghiêng nhỏ phía trên; bài luận (mục 3) dạng văn xuôi serif, đoạn cuối được tách nhẹ bằng khoảng trắng lớn hơn, không tiêu đề; dưới bài: hàng nút "Hỏi thêm" (primary), "Chia sẻ", "Rút lại"; ô "Hỏi thêm" mở ra với placeholder "Hỏi thêm về bài này, tối đa 3 câu"; dòng miễn trừ nhỏ.

**M5. Drawer lá bài**: khi chạm lá Bốn Tiền trong kết quả: ảnh, "Bốn Tiền · Four of Pentacles", câu cốt lõi "Giữ chặt cái đang có. Của cải an toàn, chắc chắn, nhưng tay đã bận ôm nên không còn nhận thêm được gì. Ổn định đổi bằng cứng nhắc, sợ mất nhiều hơn muốn được.", ba chip "giữ của · ôm chặt túi · giữ ghế", khối "Trong công việc": "Giữ ghế, giữ việc quen, không dám đổi chỗ dù đã chán; an toàn thật nhưng cơ hội mới cũng bị chặn ngoài cửa.", link "Xem trang lá".

**M6. Có hay không**: kiểu trải một lá, câu hỏi "Có nên nhắn cho người yêu cũ trước không", lá Ba Cốc lớn ở giữa, nhãn "Nghiêng về có" màu xanh rêu ngay dưới lá, bài luận (mục 4).

**M7. Trang lá bài `/la-bai/ba-coc`** (trang SEO, cuộn dài): ảnh lớn, "Ba Cốc", "Three of Cups · Bộ Cốc · Số 3 · Nguyên tố Thuỷ", dòng phụ "Golden Dawn: Sao Thuỷ ở Cự Giải"; câu cốt lõi in to serif; hai cột chip "Xuôi" / "Ngược" (mục 5); năm khối "Tình cảm, Công việc, Tiền bạc, Tâm lý, Học hành" mỗi khối một câu; mục "Trên lá bài" là danh sách 5 dòng; mục "Người Việt hay nói" là các cụm thành ngữ dạng chip mềm; mục "Khi lá lệch" một đoạn ngắn; CTA "Rút bài với lá này"; điều hướng "← Hai Cốc · Bốn Cốc →".

**M8. Thập tự Celtic**: bố cục 10 lá đúng cổ điển thu gọn cho mobile (cụm chữ thập bên trái: lá 1 giữa, lá 2 xoay ngang đè lên, lá 3 dưới, lá 4 trái, lá 5 trên, lá 6 phải; cột 4 lá bên phải từ dưới lên 7, 8, 9, 10), mỗi lá có số nhỏ và tên vị trí (mục 6), pinch-zoom hint, phần bài luận bên dưới thu gọn còn hai đoạn đầu và nút "Đọc tiếp".

**D1. Trang chủ desktop**: hero hai cột, trái là chữ và CTA, phải là cụm 5 lá xoè; kiểu trải dạng lưới 3 cột; "Lá hôm nay" thành dải ngang.
**D2. Kết quả desktop**: hai cột, trái là sơ đồ lá (sticky), phải là bài luận đo dòng 64 ký tự và khối hỏi thêm.
**D3. Trang lá bài desktop**: ảnh trái sticky, nội dung phải, mục lục nhỏ bên lề.
**D4. Trang chia sẻ `/doc/abc123`**: giống kết quả nhưng chỉ đọc, thêm dải trên cùng "Bài đọc này được chia sẻ từ Tarot24" và CTA "Rút bài của bạn"; dựng luôn OG image 1200×630: nền tối, 3 lá xếp nghiêng, chữ "Ba lá quá khứ, hiện tại, tương lai gần · Tarot24".

## Mock data (dữ liệu thật, giữ nguyên)

### 1. Kiểu trải
Cơ bản:
- Một lá cho hôm nay · 1 lá · Rút một lá cho ngày hôm nay hoặc cho một chuyện đang vướng trong đầu. Nhanh, gọn, đủ để biết mình đang đứng ở đâu.
- Một lá có hay không · 1 lá · Một câu hỏi có hoặc không, một lá trả lời. Bài chỉ nói đang nghiêng về phía nào và vì sao, không hứa chắc.
- Ba lá quá khứ, hiện tại, tương lai gần · 3 lá · Ba lá xếp theo dòng thời gian của một chuyện, để thấy nó từ đâu tới, đang ở đâu và nếu giữ đà thì đi về đâu.
- Ba lá tình huống, trở ngại, lời khuyên · 3 lá · Cho một chuyện đang kẹt và muốn biết kẹt ở đâu.
- Năm lá chuyện tình cảm · 5 lá · Cho một mối đang có hoặc đang tìm hiểu. Năm lá nhìn phía mình, phía người kia, cái đang nối, cái đang cản và hướng mối này đang đi.
- Thập tự Celtic · 10 lá · Trải mười lá cổ điển cho một chuyện lớn, muốn nhìn từ gốc tới ngọn, từ trong ra ngoài.
Chuyên đề:
- Năm lá công việc · 5 lá · Cho chuyện đi làm và đường sự nghiệp.
- Bốn lá tiền bạc · 4 lá · Cho chuyện tiền nong hằng ngày, thu, chi, giữ.
- Ba lá giữa hai người · 3 lá · Khi đang vướng một người và muốn biết giữa hai bên đang có gì.
- Năm lá chọn giữa hai hướng · 5 lá · Khi đang phân vân giữa hai hướng.
- Năm lá tháng tới · 5 lá · Nhìn trước tháng tới theo bốn tuần, cộng một lá chủ đề bao trùm cả tháng.

### 2. Gợi ý câu hỏi (màn M2, kiểu trải ba lá thời gian)
- Chuyện giữa mình và người đó đang đi về đâu
- Việc ở công ty này rồi sẽ ra sao
- Mấy tháng nay mình lận đận, có sáng hơn không

### 3. Bài luận mẫu (màn M4, D2) — câu hỏi "Mình có nên đổi việc trong năm nay không", lĩnh vực Công việc, lá: Quá khứ = Chín Tiền, Hiện tại = Bốn Tiền, Tương lai gần = Mặt Trăng

Ba lá này khá tĩnh, hai lá Tiền đứng yên và một Ẩn Chính mờ sương ở cuối. Chuyện đổi việc đang không chuyển, và cái giữ nó lại nằm trong bạn nhiều hơn ngoài chỗ làm.

Quá khứ là Chín Tiền. Cái bạn có ở chỗ làm này là do tự tay gây dựng, không nhờ ai; kỷ luật đã thành nếp, và bạn từng ung dung đứng giữa thành quả đó. Đây là vốn thật, không phải vết. Nhưng nó dẫn thẳng tới hiện tại là Bốn Tiền, người trong hình ngồi ôm chặt một đồng tiền vào ngực. Bạn đang giữ ghế, giữ việc quen, biết là chán mà không dám đổi, vì sợ mất cái đã gây dựng nhiều hơn là muốn một cái mới. Tay bận ôm nên không còn tay để nhận. Cái chi phối bạn lúc này là nỗi sợ, không phải chỗ làm.

Tương lai gần là Mặt Trăng. Nếu giữ đà này thì vài tuần tới chuyện vẫn đi trong sương, chỗ làm mập mờ, tin đồn, và trong đầu bạn cái lo lớn hơn cái thật. Lúc mờ thế này quyết kiểu nào cũng dễ sai, dù là sợ ở lại hay sợ đi.

Bài không bảo bạn đổi việc năm nay, cũng không bảo ở; nó bảo bạn chưa nhìn rõ để quyết, và cái mờ nằm ở chính bạn. Tuần tới viết ra đúng cái bạn sợ mất nếu đi, từng khoản một, rồi hỏi thẳng một người đang làm ở chỗ bạn muốn tới xem bên đó thật ra sao. Sương tan bớt rồi hãy tính chuyện đổi chỗ.

### 4. Bài luận có/không (màn M6) — "Có nên nhắn cho người yêu cũ trước không", lá Ba Cốc ngửa

Nghiêng về có, nhưng kèm điều kiện. Ba Cốc là lá rất nhẹ, nói về niềm vui có người cùng chia, vui rộng hơn một đôi. Nó không nói hai người quay lại; nó nói giữa bạn và người cũ vẫn còn chỗ nói chuyện tử tế, kiểu chung vui chứ không kiểu đòi lại.

Vậy nếu nhắn, nhắn với tâm thế của ba cô gái trong hình nâng cốc chạm nhau, không ai đứng riêng cầu xin ai. Một câu hỏi thăm, một câu chúc, một tin về đám bạn chung, miễn không có chữ nhớ và không có chữ tại sao. Nhắn để ấm lại như người quen cũ thì thuận; nhắn để thăm dò xem người ta còn gì với mình không thì lá này không đỡ nổi.

Vậy nhắn trước được. Soạn một tin ba dòng, xoá mọi câu đòi hồi âm, rồi gửi lúc bạn đang vui sẵn, không gửi lúc đêm khuya một mình.

### 5. Trang lá Ba Cốc (màn M7, D3)
- Tên: Ba Cốc · Three of Cups · Bộ Cốc · Số 3 · Nguyên tố Thuỷ · Golden Dawn: Sao Thuỷ ở Cự Giải
- Cốt lõi: Vui vì có người cùng chia, việc đến hồi kết đẹp và mọi người tụ lại ăn mừng. Niềm vui ở đây là của nhóm, lấy sức từ bạn bè và người thân, rộng hơn một đôi.
- Xuôi: tiệc mừng · bạn bè tụ họp · chung vui · ăn mừng việc xong · tình chị em · được nâng đỡ · vui hội nhóm · kết đẹp
- Ngược: ăn chơi quá đà · say sưa · rã đám · bạn bè rạn nứt · bị bỏ ngoài cuộc · nói xấu sau lưng · xong việc chóng vánh · người thứ ba
- Tình cảm: Chuyện tình được bạn bè và gia đình hai bên chúc mừng, ra mắt, đám hỏi, đám cưới; ngược thì coi chừng bạn bè xen vào hoặc người thứ ba.
- Công việc: Dự án xong, cả đội kéo nhau liên hoan; sếp và đồng nghiệp ghi nhận công chung, người hỏi được lòng tập thể hơn là nổi trội một mình.
- Tiền bạc: Tiền đi theo tiệc tùng: được mừng, được góp, cùng nhau chi; khoản chi cho cưới hỏi, liên hoan, bạn bè tăng lên nhưng tiêu mà vui.
- Tâm lý: Đầu óc thoáng vì có người cùng chia, không phải gánh một mình; tâm trạng lên hẳn khi ngồi giữa đám đông quen mặt.
- Học hành: Học nhóm chạy tốt, thi xong cả bọn rủ nhau ăn mừng; kết quả ổn và được người quanh mình mừng cho thật lòng.
- Trên lá bài: Ba cô gái đứng thành vòng tròn, cùng giơ cao ba chiếc cốc vàng chạm vào nhau trên đầu, chân dang bước như đang nhảy múa / Ba người mặc ba màu khác nhau: trắng, đỏ cam, vàng; váy dài, tay áo rộng, tóc cài vòng hoa lá / Một trong ba cô quay lưng về phía người xem, tay đưa ra nắm lấy tay bạn / Mặt đất quanh chân họ là vườn thu hoạch: bí ngô, chùm nho, hoa quả nằm rải trên cỏ / Nền trời vàng, không có công trình hay núi phía sau
- Người Việt hay nói: vui như Tết · chén chú chén anh · ba cây chụm lại nên hòn núi cao · chị ngã em nâng · vui đâu chầu đấy · ăn chơi nhảy múa
- Khi lá lệch: Vui quá hoá say, tiệc kéo dài thành ăn chơi bỏ việc, bạn bè xúm vào chuyện riêng rồi nói ra nói vào, hoặc cả nhóm vui mà một người bị để ngoài cuộc.

### 6. Vị trí Thập tự Celtic (màn M8)
1 Hoàn cảnh · 2 Cái cắt ngang · 3 Gốc rễ · 4 Quá khứ gần · 5 Trên đầu · 6 Tương lai gần · 7 Bản thân người hỏi · 8 Xung quanh · 9 Hy vọng và nỗi sợ · 10 Kết cục nếu giữ đà
Lá mẫu theo thứ tự: Ba Cốc, Vua Kiếm, Át Cốc, Bánh Xe Số Phận, Bốn Tiền, Vua Tiền (ngược), Bốn Gậy, Át Tiền, Tiểu Đồng Gậy, Bảy Gậy (ngược). Câu hỏi: "Công việc chán, tình cảm lửng lơ, năm tới mình nên dồn sức vào đâu".

### 7. Copy cố định
- Tagline: Rút bài, đọc rõ, làm được
- CTA chính: Rút bài ngay · Xào bài · Hỏi thêm · Chia sẻ · Rút lại · Xem trang lá · Rút bài với lá này
- Placeholder ô câu hỏi: Bạn đang vướng chuyện gì
- Nhãn kết luận có/không: Nghiêng về có · Nghiêng về không · Chưa ngã ngũ
- Nhãn lá: ngược
- Miễn trừ (footer mọi trang): Bài đọc chỉ để tham khảo, không thay lời khuyên y tế, pháp lý, tài chính.
- Thông báo lỗi LLM: Bài chưa đọc được, lá của bạn vẫn còn đây. Thử lại sau vài giây.
- Liên kết chéo: Xem thêm bói Lenormand tại lenormand24.online
