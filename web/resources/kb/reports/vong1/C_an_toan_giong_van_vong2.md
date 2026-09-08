# Agent C — vòng hai: xác nhận AN TOÀN + GIỌNG VĂN trên 78 lá sau khi sửa

Phạm vi: 78 file `/home/claude/kb/cards/*.yaml`, mọi trường văn bản. Cách làm: (1) grep bằng code với đúng mẫu vòng một, cộng thêm mẫu phụ (luật|pháp lý|xử|sức khoẻ|khỏi|có con|con cái|em bé|lãi|góp vốn|hãy|cho phép|thời điểm|một cách|sự + tính từ|bởi|mời gọi|trân trọng|hiện tại|tích cực|tâm hồn...), kiểm dấu thanh kiểu cũ/mới, dấu câu lỗi, chữ Latin xen; (2) đọc tay toàn bộ 78 `cot_loi`, 48 ô `ba_cach_doc`, 390 ô `lang_kinh`, 78 `canh_bao`, 78 bộ `cach_noi_viet`, toàn bộ `tu_khoa_xuoi/nguoc`.

Kết quả grep sơ bộ (341 hit mẫu chính): không có dấu chấm than; không có "của bạn" (chỉ "của bạn bè"); mọi "bạn " đều là bạn bè / bạn học / bạn hàng / bạn đời / bạn xưa / bạn chung; mọi "toà/tòa" ngoài canh_bao đều là toà lâu đài / toà tháp / toà nhà / "toàn"/"an toàn"; mọi "bầu" là bầu trời / bầu dục; "án " hầu hết là dự án / dán mắt / chán / tính toán; "thắng" ngoài canh_bao là thắng cãi, thắng lợi, thắng thầu, thắng lý (không có thắng kiện); "kiện" ngoài canh_bao là điều kiện / sự kiện. Các từ nhóm cấm (mang thai, sinh nở, hiếm muộn, sẩy thai, thai sản, bệnh, chết, tang, tai nạn, đầu tư, cổ phiếu, coin, mua đất, mua vàng, phán quyết của toà, thừa kế) xuất hiện gần như chỉ trong `canh_bao` với vai trò cấm LLM. Ba cờ đỏ vòng một (coin_07.tien_bac "cho mượn lúc này thì khó đòi", và các chỗ ở cot_loi/la_nang_luong) đã được sửa đúng.

## Cờ đỏ an toàn

Không có. Không tìm thấy chỗ nào ngoài `canh_bao` KHẲNG ĐỊNH hay GỢI Ý theo hướng cấm (bệnh, sinh tử, thai sản, kết quả kiện tụng, mua bán đầu tư).

Biên giới, KHÔNG tính cờ đỏ, ghi để cân nhắc vá cho sạch bộ lọc máy:
- major_20.tu_khoa_xuoi[4] "nhận phán quyết" và major_20.lang_kinh.tam_ly "chấp nhận phán quyết rồi đứng dậy" → "phán quyết" là từ của toà, đứng trong lá Phán Xét mà canh_bao đang cấm đoán toà; ý thật là chấp nhận kết cục tự xét. Gợi ý: "nhận kết cục" / "chấp nhận kết cục rồi đứng dậy".
- sword_queen.lang_kinh.tien_bac "chi tiêu tỉnh, không cho vay vì cả nể" → tả tính người, không phải khuyên thời điểm cho vay như coin_07 vòng một; chấp nhận được. Nếu muốn tuyệt đối: "không vì cả nể mà đưa tiền cho ai".
- coin_06.lang_kinh.tien_bac "vay được, được cho; ngược thì ... cho vay rồi kể công"; cup_knight.lang_kinh.tien_bac "Có người đề nghị góp vốn, cho vay, chung tiền với lời lẽ ngọt"; sword_03.tien_bac "người thân quen vay không trả"; wand_07.tien_bac "người vay chưa trả lại xin thêm" → đều là tả tình huống, không khuyên vay hay cho vay, canh_bao coin_06 chặn rõ. Để.
- coin_10.cot_loi "nhận từ đời trước và để lại cho đời sau", coin_10.tu_khoa_xuoi "thừa kế", coin_10.cong_viec "mối làm ăn đời trước để lại", cup_06.tien_bac "của ông bà để lại" → như vòng một: nghĩa truyền thống, canh_bao coin_10/cup_06/coin_04/wand_king đều chặn "người thân sắp mất". Để.
- wand_06.lang_kinh.cong_viec "dự án thắng thầu" → tả tình huống thắng công khai, không phải kiện; canh_bao đã cấm hứa thắng thầu/thắng kiện. Để.
- major_02.tien_bac "chưa nắm chắc thì chưa ký gì cả"; major_11.tien_bac "ký giấy đọc kỹ từng dòng"; cup_knight.cong_viec "đọc kỹ điều khoản trước khi gật" → dặn đọc kỹ giấy tờ, không phải khuyên mua bán. Để.

## Cờ đỏ sáo ngữ

Không có. Không lá nào dùng "vũ trụ", "năng lượng", "hành trình", "bản thể", "khai mở", "thông điệp", "buông bỏ", "đánh thức", "mời gọi", "Đây là thời điểm", "cho phép bản thân", "Điều quan trọng là", "một cách + tính từ", "hiện tại" theo nghĩa self-help. "chữa lành" chỉ có ở cup_03.canh_bao để cấm. "buông" (không "bỏ") ở major_13 là động từ đời thường.

Biên giới, KHÔNG tính:
- cup_page.tu_khoa_xuoi[1] "rung động đầu" → nghĩa đời (tim đập vì người); cup_01 vòng một đã đổi thành "xao xuyến đầu tiên" nhưng cup_page chưa. Nếu muốn sạch bộ lọc: "xao xuyến đầu".
- coin_07.canh_bao "chỉ chụp khoảnh khắc đang cân" → vòng một đã gợi ý, vẫn chưa đổi; nghĩa thường, trong canh_bao. Gợi ý: "chỉ chụp đúng lúc đang cân".
- major_19.lang_kinh.tinh_cam "gia đình hai bên đón nhận" → nghĩa thường (chấp nhận), không phải "mở lòng đón nhận". Nếu muốn sạch bộ lọc: "gia đình hai bên đều ưng".
- wand_queen.ba_cach_doc.la_nang_luong "Cứ tin mình xứng đáng, nói rõ mình muốn gì" → "tin mình xứng đáng" hơi hơi self-help ("believe you deserve"); gợi ý "Cứ tự tin, nói rõ mình muốn gì".
- cup_knight.ba_cach_doc.la_nguoi "làm người khác thấy mình được trân trọng" → nghĩa thường, để.

## Sượng rõ còn sót

Toàn bộ cot_loi 21 lá viết lại và 16 ô la_nang_luong viết lại đọc trơn, đúng tông "người bói nói với khách". Các chỗ vòng một nêu (sword_03, sword_09, sword_05, coin_06, sword_08, sword_04.canh_bao, cup_01, cup_10, cup_06, sword_06, coin_10, wand_06, coin_08, sword_01, sword_02, sword_07, wand_09, cup_02.tam_ly, cup_01.canh_bao, cup_03.canh_bao, cup_08, coin_02, sword_06.tu_khoa_nguoc, cup_09.tu_khoa_nguoc, cup_05.tu_khoa_xuoi) đều đã vá. Còn sót ba chỗ sượng rõ:

- wand_queen.ba_cach_doc.la_tinh_huong: "chỗ buôn bán đông khách quen, việc có người vừa lo được nhà vừa kéo được người đứng sau" → vế "việc có người vừa lo được nhà vừa kéo được người đứng sau" không rõ chủ ngữ, đọc hai ba lần vẫn không hiểu "kéo được người đứng sau" là gì. Gợi ý: "chỗ buôn bán đông khách quen, trong việc có người vừa lo được nhà vừa kéo được người theo mình".
- major_19.cot_loi: "sức sống và sự thật thà như trẻ con" → "sự + tính từ", lại dễ đọc nhầm thành "sự thật" + "thà". Gợi ý: "sức sống và cái thật thà như trẻ con".
- coin_knight.ba_cach_doc.la_nang_luong: "Coi chừng khư khư lối cũ, và cày đến đuối rồi buông đúng lúc gần xong." → "buông đúng lúc" đọc ngược nghĩa (nghe như khen buông đúng lúc). Gợi ý: "Coi chừng khư khư lối cũ, và cày đến đuối rồi bỏ dở ngay lúc gần xong."

Hơi sượng (không tính, tuỳ ý):
- cup_02.cot_loi "chưa cần ai thứ ba chứng kiến" → "chưa cần người thứ ba chứng kiến".
- major_07.cot_loi "chuyển động và chinh phục, chứ chưa phải hoà giải" → cụm danh từ kiểu Waite; "là đi tới và chiếm lấy, chưa phải làm hoà".
- cup_08.lang_kinh.tinh_cam "người kia thường không hiểu vì sao, bởi bên ngoài mọi thứ vẫn êm" → "bởi" đứng đầu vế hơi văn; "vì bên ngoài mọi thứ vẫn êm".
- coin_king.canh_bao "chỉ nói về sự vững đã có"; coin_knight.canh_bao "Sự chậm của lá"; sword_queen.canh_bao "Không lấy sự sắc sảo của lá" → "sự + tính từ" trong canh_bao (lời dặn LLM, ít lộ ra ngoài). Gợi ý: "chỉ nói cái vững đã có", "Cái chậm của lá", "Không lấy cái sắc của lá".

## Chính tả / dấu / định dạng

- sword_01.lang_kinh.cong_viec "vừa lóe ra" → cả KB dùng dấu kiểu cũ (loé ×4, hoà, toà, khoẻ, thoả, tuỳ...), đây là chỗ duy nhất kiểu mới. Sửa "loé".
- wand_king.tu_khoa_nguoc[7] "nghiêm mà không hẹp (ngược nhẹ)" và wand_queen.tu_khoa_nguoc[7] "kín tiếng, chịu khó (ngược nhẹ)" → chú thích trong ngoặc lọt vào từ khoá; LLM sẽ đọc nguyên văn. Bỏ "(ngược nhẹ)" hoặc bỏ hẳn hai từ khoá này.
- major_17.tu_khoa_nguoc[2] "trời không sao" → dễ đọc thành "không sao cả". Gợi ý "trời tắt sao".
- cup_05.tu_khoa_nguoc[2] "qua cầu", [4] "họ hàng có tin" → cụt, không rõ nghĩa đứng một mình (Waite: "news, alliances, affinity, consanguinity"). Gợi ý bỏ "qua cầu" (đã có "về với người thân"), đổi "họ hàng có tin" thành "người thân tìm về".
- wand_08.cach_noi_viet[3] "phóng lao phải theo lao" → dạng chuẩn là "đâm lao phải theo lao" (coin_07, major_15, sword_knight đều dùng "đâm lao"). Thống nhất.
- sword_09.lang_kinh.cong_viec "Deadline", wand_08.lang_kinh.cong_viec "deadline, email" → tiếng Anh xen (đã ghi vòng một), chỉ nhắc để quyết thống nhất giữ hay đổi "hạn chót", "thư".
- Không có dấu chấm than, không có dấu cách thừa trước dấu câu, không có chuỗi kết thúc bằng dấu phẩy/chấm phẩy, không có "..". Thành ngữ trong cach_noi_viet kiểm 78 bộ: đúng dạng (kể cả "chân mình thì lấm bê bê, lại cầm bó đuốc đi rê chân người", "tẩm ngẩm tầm ngầm mà đấm chết voi", "khư khư như ông từ giữ oản", "thả con săn sắt, bắt con cá rô").

## Kết luận

ĐẠT về an toàn và sáo ngữ: 0 cờ đỏ an toàn, 0 cờ đỏ sáo ngữ trên 78 lá. Giọng văn đạt mức "reader có nghề đọc không thấy sượng" trừ 3 chỗ sượng rõ còn sót và 1 lỗi dấu thanh, 2 từ khoá dính chú thích; vá xong 6 chỗ này là sạch.

Tổng cờ đỏ: 0 (an toàn 0, sáo ngữ 0). Chỗ cần vá bằng code: 6 (3 sượng rõ + 3 chính tả/định dạng), cộng 4 chỗ biên giới tuỳ chọn.
