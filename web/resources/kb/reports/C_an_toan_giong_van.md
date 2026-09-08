# Báo cáo C — kiểm an toàn và giọng văn

> Vòng 1: 3 cờ đỏ an toàn, 0 sáo ngữ, ~40 chỗ sượng. Tất cả đã vá (cot_loi viết lại 21 lá theo nhóm chất; cột ba_cach_doc.la_nang_luong viết lại cả 16; các dòng khác vá theo cặp). Vòng 2 trên cả 78 lá: 0 cờ đỏ, 6 chỗ sót đã vá tiếp.

# VÒNG 2 (sau sửa)

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

# VÒNG 1 — phần 1 (Ẩn Chính + Hoàng gia)

Phạm vi: major_00–major_21, wand/cup/sword/coin × page/knight/queen/king (38 lá). Đã grep bằng code toàn bộ trường văn bản theo danh sách từ khoá an toàn + sáo ngữ + "bạn"/"của bạn"/"!" rồi đọc từng lá bằng mắt. Không sửa file.

Kết quả grep: không có dấu chấm than; không có "bạn" dùng làm đại từ xưng hô (chỉ gặp "bạn bè", "bạn đời", "cô bạn", "anh bạn", "bạn chung"); không có "của bạn"; không có cụm nào trong danh sách cấm của STYLE.md ("năng lượng vũ trụ", "hành trình", "chữa lành", "khai mở", "bản thể", "buông bỏ", "thông điệp", "khoảnh khắc hiện tại", "đánh thức"...). Các hit còn lại của grep đều là (a) canh_bao nhắc để cấm, hoặc (b) từ đồng âm vô hại ("bầu dục", "toà tháp", "án binh bất động", "vay có trả", "thương vay khóc mướn", "cây ngay không sợ chết đứng", "mật ngọt chết ruồi", "đấm chết voi", "chán nản").

## Cờ đỏ an toàn

- sword_knight.canh_bao: "Waite có nhắc chữ chết, nhưng chỉ khi đứng cạnh các lá định mệnh khác, nên không bao giờ đọc thành tai nạn, sinh tử hay bệnh nặng." → Sinh tử, gián tiếp. Mệnh đề "chỉ khi đứng cạnh các lá định mệnh khác" để hé cửa: LLM có thể hiểu là *khi có lá khác đi kèm thì được đọc thành chết*. Câu cấm phải tuyệt đối, không kèm điều kiện. Gợi ý: bỏ hẳn vế "chỉ khi…", giữ "Waite có nhắc chữ chết, nhưng lá này không bao giờ đọc thành tai nạn, sinh tử hay bệnh nặng, dù đứng cạnh lá nào."
- wand_king.tien_bac: "có thể có tin về phần được chia từ phía gia đình" và wand_king.ba_cach_doc.la_tinh_huong: "tin từ phía gia đình, họ hàng về một việc lớn, một phần được chia" → Thừa kế nói tránh. "Phần được chia từ gia đình" với người Việt gần như đồng nghĩa chia của sau tang; canh_bao đã cấm tang sự nhưng hai trường này vẫn gieo ý để LLM nói ra với khách. Gợi ý: bỏ "phần được chia", nếu giữ ý Waite thì chỉ nói "có tin liên quan tới của cải trong nhà" hoặc bỏ hẳn.

### Ranh giới (không tính cờ đỏ, nên cân nhắc)
- cup_knight.tien_bac: "Có người đề nghị góp vốn, cho vay, chung tiền với lời lẽ ngọt; xem lời hứa có gì chắc trước khi rút ví" → Sát mép "khuyến nghị góp vốn/cho vay". Đây là dặn soi kỹ chứ không nói nên/không nên, tạm chấp nhận; nhưng "trước khi rút ví" là lời khuyên hành động. Có thể đổi thành mô tả: "lời hứa nghe hay hơn phần chắc".
- major_11.cong_viec: "người hỏi thắng nếu đúng lý" → Chữ "thắng" trên lá Công Lý, đứng cạnh "hợp đồng, thoả thuận" — LLM dễ kéo sang tranh chấp/kiện. Đổi "thắng" thành "được xét đúng".
- major_20.tien_bac: "một khoản tưởng mất có thể được xét trả lại" → Ngầm đoán kết quả khiếu nại/đòi tiền. Nên bỏ vế này.
- major_13.tinh_cam: "quan hệ cũ chết đi" và major_13.tam_ly: "Con người cũ đang chết đi" → Ẩn dụ, không vi phạm, nhưng đúng lá Thần Chết mà chính KB dùng chữ "chết" hai lần thì LLM sẽ lặp chữ đó với khách. Nên thay "hết đời", "không còn nữa".
- major_15.tu_khoa_nguoc: "sắp tái nghiện", "cai chưa dứt" → Từ vựng nghiện/cai (sức khoẻ) trong khi canh_bao cùng lá dặn "chưa vội dán nhãn… nghiện ngập". Tự mâu thuẫn; nên đổi thành "sắp dính lại", "bỏ chưa dứt".
- sword_king.ba_cach_doc.la_nguoi: "Phụ nữ ngồi ở ghế phán quyết cũng thế" → "ghế phán quyết" gợi toà; đổi "ngồi ghế quyết".

## Cờ đỏ sáo ngữ

Không có cụm nào thuộc danh sách cấm hay cùng họ dùng theo nghĩa tâm linh. Các hit grep đã phân loại:
- cup_page: "rung động" xuất hiện 5 lần (tu_khoa_xuoi, tinh_cam, canh_bao, la_nang_luong, la_tinh_huong) → nghĩa tình cảm đời thường ("rung động đầu đời"), không phải "tần số rung động". Không vi phạm, nhưng lặp dày; nên thay 2–3 chỗ bằng "xao xuyến", "để ý", "có cảm tình".
- major_19.tinh_cam: "gia đình hai bên đón nhận" → nghĩa thường (nhà chấp nhận), không vi phạm.
- major_17: "lành dần", "đang lành", "lành lại" → thuần Việt, tự nhiên, không phải "chữa lành". Không vi phạm.
- cup_knight.la_nang_luong: "để cảm xúc dẫn đường" → không thuộc danh sách cấm nhưng là cliché dịch ("let your feelings guide you"); xếp vào giọng văn bên dưới.

## Giọng văn (sượng rõ)

Nhóm 1 — khuôn "Đem/Mang/Đi vào/Bước vào/Đón chuyện này bằng X" ở trường ba_cach_doc.la_nang_luong. Đây là dịch thẳng "bring X to this / approach this with X", lặp ở 6/16 lá hoàng gia, thành mẫu câu nhận ra ngay:
- wand_page.la_nang_luong: "Đem vào chuyện này sự háo hức của người mới: dám hỏi, dám sai, chưa sợ mất gì." → Gợi ý: "Làm chuyện này bằng cái háo hức của người mới: dám hỏi, dám sai, chưa có gì để mất."
- sword_knight.la_nang_luong: "Mang vào chuyện này lý lẽ sắc và ý chí không quay đầu" → "Vào việc này thì lý phải sắc, đã quyết là không quay đầu".
- sword_queen.la_nang_luong: "Đi vào chuyện này bằng khoảng cách và điều kiện rõ ràng: cái gì được, cái gì không, nói trước cho xong." → "Với chuyện này, giữ khoảng cách và nói điều kiện trước: cái gì được, cái gì không, nói cho xong."
- cup_page.la_nang_luong: "Đón chuyện này bằng sự tò mò dễ thương: ghi nhận từng rung động nhỏ, không vội gọi tên, không vội đòi kết quả." → Sượng nhất mẻ: "sự tò mò dễ thương" + "ghi nhận" (giọng biên bản). Gợi ý: "Gặp chuyện này cứ tò mò mà nhìn: lòng có gì lạ thì để ý, chưa vội gọi tên, chưa vội đòi kết quả."
- cup_knight.la_nang_luong: "để cảm xúc dẫn đường nhưng không xông. Chủ động mời, chủ động bày tỏ, làm đẹp cách mình đến với người kia hay với việc." → "làm đẹp cách mình đến với" là dịch từng chữ. Gợi ý: "đi theo cái lòng mình thích nhưng không xông. Chủ động ngỏ lời, tỏ ý cho đẹp, với người cũng như với việc."
- wand_knight.la_nang_luong: "Bước vào chuyện này bằng sức nóng chứ không bằng sức bền" → cặp "sức nóng/sức bền" hay, chỉ cần bỏ khuôn: "Chuyện này làm bằng sức nóng chứ không bằng sức bền".

Nhóm 2 — câu dịch cấu trúc / danh từ hoá:
- wand_queen.la_nang_luong: "Cách làm là tin mình đáng được, nói rõ mình muốn gì, không giấu mình đi cho vừa lòng ai." → "tin mình đáng được" là "believe you deserve it" bị cụt. Gợi ý: "Cứ tin mình xứng đáng, nói rõ mình muốn gì, không tự thu mình lại cho vừa lòng ai."
- major_10.tam_ly: "bài học lúc này là chấp nhận cái ngoài tầm tay thay vì đổ tại số hoặc cưỡng lại nó" → "the lesson here is to accept…" và "nó" thay cho "it" lơ lửng. Gợi ý: "lúc này chỉ có cách chịu cái ngoài tầm tay, không đổ tại số mà cũng không cố cưỡng."
- major_20.cot_loi: "chấp nhận phán quyết về mình, rồi trả lời; cái mới không đến từ kết thúc mà từ việc tỉnh ra và nhận lời gọi ấy" → "cái mới không đến từ… mà từ việc…" là văn dịch; "phán quyết" còn kéo về toà. Gợi ý: "nhìn thẳng cái mình đã làm rồi đáp lại; cái mới không phải vì chuyện cũ hết, mà vì mình tỉnh ra và dám đứng dậy."
- cup_queen.la_nang_luong: "Cần một mức chừng mực để thương người mà không tan hết vào người." → "a measure of moderation". Gợi ý: "Thương thì thương, nhưng phải có chừng, kẻo tan hết vào người ta."
- major_06.tien_bac: "lúc này phải thống nhất giá trị chứ không chỉ chia con số" → "align values". Gợi ý: "phải hợp nhau ở cách nhìn tiền, chứ không chỉ chia con số."
- major_09.tien_bac: "keo với chính mình vì sợ thì lại quá" → cụt, đọc hai lần mới hiểu. Gợi ý: "nhưng keo với cả chính mình chỉ vì sợ thì lại quá đà."
- major_17.tinh_cam: "mối cũ lành lại bằng thành thật và cho đi nhẹ nhõm" → "cho đi nhẹ nhõm" không phải tiếng Việt nói. Gợi ý: "mối cũ lành lại nhờ thật lòng và không tiếc gì với nhau."

## Giọng văn (hơi sượng)

- major_02.cot_loi: "không phải sự mơ hồ, càng không phải chuyện chưa có" → "sự mơ hồ" danh từ hoá; bỏ "sự".
- major_11.cot_loi: "nên đây là nhân quả và sự tỉnh táo, không phải may rủi" → bỏ "sự": "là nhân quả, là tỉnh táo".
- major_13.cot_loi: "sự thay đổi này lớn, tất yếu, đến chậm mà chắc, là chuyển hoá chứ không phải tai hoạ" → Hán Việt dồn ("tất yếu", "chuyển hoá"). Gợi ý: "đổi thay này lớn, đằng nào cũng đến, chậm mà chắc, là lột xác chứ không phải tai hoạ."
- major_15.cot_loi: "Bị trói bởi cái mình không chịu buông." và major_15.cong_viec: "bị dụ bởi món hời mờ ám" → bị động "bởi" kiểu "by". Gợi ý: "Bị cái mình không chịu buông trói lại." / "bị món hời mờ ám dụ".
- major_14.tam_ly: "kiên nhẫn với nhịp của chính mình" → "patient with your own rhythm". Gợi ý: "không sốt ruột với nhịp của mình".
- major_17.cot_loi: "lành dần bằng cho đi và mở ra" → "mở ra" (open up) lửng. Gợi ý: "lành dần nhờ không giữ, không phòng thủ".
- major_21.tam_ly: "Thấy mọi mảnh trong mình khớp lại, tròn, không còn thiếu" → "pieces fit together". Gợi ý: "Thấy mình đâu vào đấy, tròn, không thiếu gì."
- major_04.hoc_hanh: "ép bản thân đến khô" → "ép mình đến khô".
- cup_queen.hoc_hanh: "các môn cần hiểu người, thấu cảm" → "thấu cảm" là thuật ngữ; "hiểu người, biết thương người".
- coin_queen.la_nang_luong: "tạo chỗ dựa, cho người ta cảm giác an toàn thay vì lời hứa" → "tạo chỗ dựa", "cảm giác an toàn" hơi dịch; "làm chỗ dựa, cho người ta yên tâm bằng cái thật chứ không bằng lời hứa".
- coin_knight.la_nang_luong: "trách nhiệm dẫn đường thay cho hứng" → "làm vì trách nhiệm hơn vì hứng".
- wand_king.la_nang_luong: "Nhận vai người chịu trách nhiệm cuối" → "take the role"; "Là người chịu trách nhiệm cuối cùng".
- sword_knight.tinh_cam: "làm đối phương tổn thương" → "tổn thương" + "đối phương" cùng câu nghe như biên bản; "làm người kia đau".
- cup_page.tu_khoa_xuoi: "mơ mộng học trò" → cụm không tự nhiên; "mơ mộng tuổi học trò" hoặc "mơ mộng".
- major_08.tu_khoa_xuoi: "can đảm lặng" → cụt; "gan mà lặng".
- major_01.tu_khoa_xuoi: "ý thành việc" → khó hiểu khi đứng một mình; "nghĩ được là làm được".
- Toàn mẻ: "đối phương" dùng nhiều (major_02, 06, 18, cup_queen, sword_knight…) — chấp nhận được trong giọng tarot Việt nhưng nghe như đối thủ; nên xen "người kia", "bên kia".

## Chính tả / dấu

- cup_queen.canh_bao: "ngược nữa thì ngoài dịu trong tính" → thiếu chữ, câu cụt (tu_khoa cùng lá ghi "ngoài dịu trong khác"). Có lẽ là "trong tính toán".
- wand_knight.tu_khoa_nguoc: "chia bè xé lẻ" → thành ngữ không có; chuẩn là "chia bè kéo cánh" hoặc "chia năm xẻ bảy" (xẻ, không phải xé).
- major_05.tu_khoa_nguoc + canh_bao: "thầy dởm" → chính tả từ điển là "rởm"; "dởm" là biến thể nói. Nên thống nhất "rởm".
- coin_knight.cach_noi_viet: "làm cho có" → không phải thành ngữ, lặp lại tu_khoa_nguoc; nên thay bằng thành ngữ thật ("năm này qua năm khác", "một nắng hai sương").
- coin_knight.cach_noi_viet: "đều như vắt tranh" → bản gốc được cho là "vắt tranh", nhưng người đọc phổ thông biết "vắt chanh"; không tính lỗi, chỉ lưu ý dễ bị tưởng sai.
- wand_queen.tu_khoa_nguoc: "kín tiếng, chịu khó" và wand_king.tu_khoa_nguoc: "nghiêm mà không hẹp" → không phải lỗi chính tả nhưng là nghĩa tích cực nằm trong cột NGƯỢC (theo Waite), đọc lẻ sẽ tưởng nhầm; nếu giữ thì nên gắn chú "ngược nhẹ".
- Nhất quán nội bộ (không phải chính tả): major_19.hoc_hanh "Đỗ, điểm cao, kết quả rõ" trong khi canh_bao cùng lá cấm "thi chắc đỗ"; nên đổi thành "đang có kết quả rõ, được ghi nhận".
- Các thành ngữ còn lại đã soát đúng: "sét đánh ngang tai", "thả con săn sắt, bắt con cá rô", "chân mình thì lấm bê bê…", "ăn cho đều, kêu cho sòng", "cá cắn câu biết đâu mà gỡ", "học không hay, cày không biết", "tống cựu nghinh tân", "hỏi cho ra nhẽ".

## Nhận xét chung về giọng

Tổng thể nghe như người Việt viết, và là người có nghề: câu ngắn, nhiều động từ, ví dụ đời ("lướt trang cá nhân người ấy", "chị chủ tiệm", "anh chồng nhắn mỗi sáng", "xem đi xem lại sao kê"). Không có "bạn", không dấu chấm than, không dính sáo ngữ tâm linh — kỷ luật ở mức tốt. Các trường mạnh nhất: tu_khoa_xuoi/nguoc, cach_noi_viet, canh_bao (giọng dặn dò rất chắc tay) và ba_cach_doc.la_nguoi (cụ thể, có hình người).

Trường yếu nhất là ba_cach_doc.la_nang_luong: 6/16 lá dùng đúng một khuôn "Đem/Mang/Đi vào/Bước vào/Đón chuyện này bằng X", cộng thêm "để cảm xúc dẫn đường", "tin mình đáng được", "một mức chừng mực" — đây là chỗ văn dịch lộ rõ nhất, cần viết lại cả nhóm chứ không sửa lẻ. Trường yếu thứ hai là cot_loi của một số lá chính (02, 11, 13, 20): dồn danh từ Hán Việt và cấu trúc "không phải X mà là Y", đọc trang trọng hơn giọng người bói đang nói. Trường tam_ly thỉnh thoảng trượt sang giọng self-help dịch ("bài học lúc này là", "kiên nhẫn với nhịp của chính mình"). Nhìn chung độ sượng là "hơi", chỉ khoảng 12 chỗ sượng rõ, tập trung ở một trường; phần còn lại có thể giữ nguyên.

Về an toàn: canh_bao của các lá nhạy (03, 08, 09, 13, 16, 17, 18, 19, 20, 11, cup_queen, sword_queen, coin_queen, coin_king) đều có câu cấm rõ, đúng hướng. Hai chỗ cần sửa là sword_knight (câu cấm có điều kiện) và wand_king (thừa kế nói tránh).

---
Tổng số cờ đỏ: 2 (an toàn 2, sáo ngữ 0). Ranh giới cần cân nhắc: 6.

# VÒNG 1 — phần 2 (lá số)

Phạm vi: wand_01–10, cup_01–10, sword_01–10, coin_01–10. Đã grep bằng code (mẫu trong prompts_C2 + thêm "Đây là thời điểm", "cho phép bản thân", "mời gọi", "một cách ", "sự ", kiểm dấu thanh kiểu cũ/mới, từ lặp) rồi đọc tay toàn bộ 40 file, mọi trường văn bản.

Kết quả grep sơ bộ: mọi lần "toà/tòa" đều là "toà lâu đài / toà tháp / toà nhà"; "bầu" đều là "bầu trời"; "bạn" đều là "bạn bè / bạn hàng / bạn học / bạn xưa / bạn nối khố", không có "bạn" xưng hô; không có dấu chấm than; không có "của bạn"; "kiện / bệnh / thai / sẩy thai / chết / tang / đầu tư / vàng / đất / coin / vay" chỉ xuất hiện trong `canh_bao` với vai trò cấm LLM, trừ các chỗ ghi dưới đây.

## Cờ đỏ an toàn

- coin_07.lang_kinh.tien_bac: "cho mượn lúc này thì khó đòi" → đọc như lời khuyên về thời điểm cho vay ("đừng cho mượn lúc này"), chạm nhóm cấm khuyến nghị vay/cho vay. Gốc Waite chỉ là "lo về một khoản cho vay"; nên đổi sang tả trạng thái: "khoản đã cho mượn đang khó đòi". (Cùng ý ở tu_khoa_nguoc "cho mượn khó đòi" thì ổn vì là tả, không phải khuyên.)

Biên giới, KHÔNG tính cờ đỏ nhưng nên biết:
- cup_05.tu_khoa_xuoi "của để lại không như mong", tu_khoa_nguoc "họ hàng có tin"; cup_06.tien_bac "của ông bà để lại"; coin_10.tu_khoa_xuoi "thừa kế", cong_viec "được thừa hưởng vị trí hay mối làm ăn đời trước để lại" → "thừa kế / của để lại" ngầm kéo theo chuyện người thân mất. Cả ba lá đều có canh_bao chặn rõ, và đây là nghĩa truyền thống, nên để; chỉ lưu ý LLM khi luận không được nối "của để lại" với "sắp có tang".
- wand_07.tien_bac "chưa phải lúc mở thêm khoản chi"; cup_09.tien_bac "coi chừng tiêu cho thoả mà quên để dành"; sword_04.tien_bac "Tạm ngưng sắm sửa, tiêu dè lại" → là chuyện chi tiêu đời thường, không phải đầu tư, chấp nhận được.
- sword_10.tien_bac "Mất trắng một khoản, vỡ nợ hay tiêu cạn đến đồng cuối" → không thuộc nhóm cấm nhưng nặng tay; canh_bao lá đã hướng "kết thúc hẳn", để được.
- coin_05.tu_khoa_xuoi "mất việc", cong_viec "Mất việc" → không thuộc nhóm cấm.

## Cờ đỏ sáo ngữ

- Không có. Không lá nào dùng "vũ trụ", "năng lượng", "hành trình", "đón nhận", "bản thể", "khai mở", "thông điệp", "buông bỏ", "đánh thức", "chữa lành" (cup_03.canh_bao nhắc "chữ chữa lành" để cấm, không tính). Không có "Đây là thời điểm để", "Bạn được mời gọi", "Điều quan trọng là", "một cách + tính từ".

Biên giới, KHÔNG tính:
- cup_01.tu_khoa_xuoi "rung động đầu tiên" → nghĩa đời (tim đập vì người), không phải "tần số rung động"; nhưng bộ lọc máy sẽ bắt, nếu muốn sạch tuyệt đối thì đổi "xao xuyến đầu tiên".
- coin_07.canh_bao "chỉ chụp khoảnh khắc đang cân" → "khoảnh khắc" dùng nghĩa thường (lát cắt), không phải "trân trọng khoảnh khắc hiện tại". Có thể đổi "chỉ chụp đúng lúc đang cân".
- cup_08.tu_khoa_xuoi "đi tìm ý nghĩa" → hơi trừu tượng kiểu self-help; gợi ý "đi tìm cái sâu hơn" (đã có "bỏ đi tìm cái sâu" ngay trên, nên có thể bỏ hẳn từ khoá này).

## Giọng văn (sượng rõ)

- sword_03.cot_loi: "và cái làm nó khác những nỗi buồn khác là nó có nguyên do rõ ràng, không thể tự dối mình rằng chuyện chưa xảy ra" → cấu trúc "what makes it different is that it has..." dịch thẳng, chủ ngữ "nó" lặp ba lần. Gợi ý: "Khác các nỗi buồn khác ở chỗ lý do rành rành, không tự dối được là chưa có gì."
- sword_09.cot_loi: "Không ai làm hại ngoài chính suy nghĩ" → thiếu tân ngữ, đọc như câu tiếng Anh "no one hurts but your own thoughts". Gợi ý: "Chẳng ai hại mình ngoài chính cái đầu mình."
- sword_05.cot_loi: "cái giá của việc phải đúng bằng mọi giá là quan hệ và thể diện, của cả hai bên" → danh từ hoá "cái giá của việc phải đúng", "giá" lặp hai lần, dấu phẩy cuối treo. Gợi ý: "Cố đúng cho bằng được thì trả bằng tình và bằng mặt mũi, cả hai bên cùng mất."
- coin_06.cot_loi: "Cho và nhận đang xảy ra, chỉ cần nhìn rõ mình đứng ở phía nào" → "giving and receiving is happening". Gợi ý: "Đang có kẻ cho người nhận; việc của người hỏi là biết mình đứng phía nào, và món này kèm điều kiện gì."
- sword_08.cot_loi: "giam hãm ở đây là tạm thời và do đầu óc, không do hoàn cảnh" → "giam hãm" làm chủ ngữ trần, "là tạm thời và do..." là cấu trúc dịch. Gợi ý: "Cái kẹt này chỉ tạm, kẹt trong đầu chứ không kẹt ngoài đời."
- sword_04.canh_bao: "kiệt sức vì không cho phép mình nằm yên" → dính họ "hãy cho phép bản thân". Gợi ý: "kiệt sức vì không chịu nằm yên".

## Giọng văn (hơi sượng)

- cup_01.cot_loi: "Lá này là cái mầm của mọi yêu thương và niềm vui trong bộ Cốc, còn nguyên, chưa có hình hài." → nói về bộ bài (meta) thay vì nói với khách; "mọi yêu thương và niềm vui" hơi văn. Gợi ý: "Mầm của mọi chuyện vui, chuyện thương sau này, còn nguyên, chưa có hình hài."
- cup_10.cot_loi: "Đích đến của bộ Cốc là hạnh phúc chung của nhiều người, có gốc rễ, kéo dài qua năm tháng" → cùng lỗi meta "bộ Cốc", "hạnh phúc chung của nhiều người" nặng Hán Việt. Gợi ý: "Vui ở đây là vui cả nhà, có gốc, giữ được qua năm tháng."
- cup_06.cot_loi: "Niềm vui rót từ quá khứ sang hiện tại, dịu và thơ" → "dịu và thơ" hơi văn vẻ so với tông chung. Gợi ý: "dịu, dễ chịu".
- sword_06.cot_loi: "Đây là chuyển tiếp chứ chưa phải đích" → "chuyển tiếp" là từ kỹ thuật, dịch "transition". Gợi ý: "Đây mới là đoạn giữa đường, chưa phải nơi đến."
- coin_10.cot_loi: "Sự ổn định ở đây lớn hơn một người" → "sự + tính từ". Gợi ý: "Cái vững ở đây không của riêng một người."
- wand_06.cot_loi: "trọng tâm không phải là làm xong, mà là được nhìn nhận trước mặt mọi người" → "trọng tâm" cứng. Gợi ý: "cái chính không phải làm xong, mà là được người ta thấy."
- coin_08.cot_loi: "Tiến bộ đến từ việc làm đi làm lại cho thạo tay, không phải từ ý tưởng hay may mắn." → "progress comes from doing". Gợi ý: "Giỏi lên là nhờ làm đi làm lại cho quen tay, không nhờ ý hay hay gặp may."
- sword_01.canh_bao: "lá này chỉ là sự rõ ràng trong đầu" → "sự rõ ràng". Gợi ý: "lá này chỉ nói đầu óc đang sáng ra."
- sword_02.cot_loi: "giữ thế cân bằng bằng cách trì hoãn" → "cân bằng bằng cách" vấp âm. Gợi ý: "giữ thăng bằng bằng cách khất" hoặc "giữ thế cân bằng nhờ khất lần".
- sword_02.canh_bao: "hiểu sự cân bằng thành bình yên hay hoà hợp" → "sự cân bằng". Gợi ý: "hiểu cái thế cân này thành yên ổn, hoà thuận".
- sword_07.cot_loi: "khôn khi cần, nhưng luôn kèm nguy cơ bị lộ, và kiểu lấy này không bao giờ lấy được trọn" → "luôn kèm nguy cơ" hơi báo chí. Gợi ý: "khôn lúc cần, nhưng lúc nào cũng có thể lộ".
- wand_09.cot_loi: "đây là kiên cường của người mệt, không phải của người mới" → "kiên cường" đứng trần làm danh từ, hơi lạ tai; gợi ý "đây là cái lì của người đã mệt, không phải sức của người mới".
- cup_02.tam_ly: "thấy được hiểu, được đón" → "được đón" cụt. Gợi ý: "thấy có người hiểu, có người đỡ lời".
- cup_01.canh_bao: "người hỏi dễ thương lung tung" → "dễ thương" bị đọc thành "cute". Gợi ý: "dễ đem lòng thương lung tung".
- cup_03.canh_bao: "chỉ chạm hướng đó khi câu hỏi hỏi thẳng" → "câu hỏi hỏi" vấp. Gợi ý: "khi khách hỏi thẳng".
- cup_08.tu_khoa_xuoi: "rời bỏ chủ động" → trật tự từ ngược, người Việt nói "chủ động rời đi"; "đi tìm ý nghĩa" (xem mục sáo ngữ biên).
- coin_02.tu_khoa_xuoi: "tin nhắn thư từ" → từ khoá lạc tông giữa các từ khoá xoay xở (gốc Waite "news and messages in writing"); cân nhắc bỏ hoặc đổi "giấy tờ qua lại".
- sword_06.tu_khoa_nguoc: "thú thật" → từ Waite "confession", đứng một mình khó hiểu là gì; nên bỏ hoặc viết "nói ra chuyện giấu".
- cup_09.tu_khoa_nguoc: "lòng thật lộ ra", "sơ suất nhỏ" → dịch sát Waite ("truth", "mistakes"), không rõ nghĩa với người đọc; nên bỏ hoặc ghép vào một từ khoá tự nhiên hơn.
- cup_05.tu_khoa_xuoi: "của để lại không như mong" → cụt và khó hiểu (xem thêm mục an toàn biên).
- wand_08.cong_viec, sword_09.cong_viec: "deadline", "email" → tiếng Anh xen; giọng dân văn phòng thật vẫn nói vậy nên chấp nhận được, chỉ ghi để thống nhất có dùng hay không toàn KB.
- coin_07.bieu_tuong: "áo tunic" → từ mượn không cần, dùng "áo dài quá gối" hoặc "áo choàng ngắn".

## Chính tả / dấu

- coin_04.bieu_tuong dòng 9: "hai tay hai cánh tay ôm chặt một đồng tiền" → lặp từ, sửa "hai cánh tay ôm chặt".
- sword_01: dòng 34 viết "loé", dòng 44 viết "lóe" → cùng file hai kiểu đặt dấu. Toàn bộ 40 lá còn lại dùng kiểu cũ (hoà, thoả, toà, Hoả, Thuỷ), nên sửa "lóe" thành "loé".
- sword_02.cot_loi: "cân bằng bằng cách" → không sai chính tả nhưng vấp, đã ghi ở mục giọng.
- cup_03.canh_bao: "câu hỏi hỏi thẳng" → vấp, đã ghi ở mục giọng.
- cup_10 viết "thuận vợ thuận chồng, tát biển Đông cũng cạn" (có phẩy), coin_03 viết "thuận vợ thuận chồng tát biển Đông cũng cạn" (không phẩy) → thống nhất một kiểu.
- sword_05.cot_loi: "...là quan hệ và thể diện, của cả hai bên." → dấu phẩy trước "của" thừa.
- Thành ngữ đã soát, viết đúng: "ôm rơm rặm bụng", "chê ỏng chê eo", "khất lần khất lữa", "lúng túng như gà mắc tóc", "khư khư như ông từ giữ oản", "chờ được vạ thì má đã sưng", "lá rách ít đùm lá rách nhiều" (biến thể chấp nhận được của "lá lành đùm lá rách"), "tránh vỏ dưa gặp vỏ dừa", "trượt vỏ dưa thấy vỏ dừa cũng sợ", "bát đũa còn có khi xô".

## Nhận xét chung về giọng

Tổng thể 40 lá này nghe như người Việt viết, và viết khá chắc tay: câu ngắn, động từ mạnh, nhiều hình ảnh đời ("ngồi lì", "khoanh tay ngó lơ", "đứng tựa cuốc", "tiền chưa ấm túi"). Không có "bạn" xưng hô, không dấu chấm than, không sáo ngữ tâm linh; đây là điểm mạnh rõ nhất so với văn tarot dịch máy thường gặp.

Trường yếu nhất là `cot_loi`, đặc biệt ở bộ Kiếm (sword_03, 05, 08, 09) và một vài lá Cốc/Tiền (cup_01, cup_10, coin_06, coin_08, coin_10): khi phải tóm ý trong hai câu, người viết trượt về cấu trúc định nghĩa kiểu Anh ("X là Y và do Z", "cái làm nó khác là...", "sự + tính từ", chủ ngữ trần như "giam hãm", "kiên cường"). Cốc còn thêm tật nói meta về "bộ Cốc" thay vì nói với khách.

`canh_bao` là trường tốt nhất: giọng người có nghề dặn người luận, cụ thể, chặn đúng chỗ, và là lý do chính khiến số cờ đỏ an toàn gần bằng không dù nhiều lá gốc Waite có chữ bệnh, chết, thai, kiện. `lang_kinh.*` tự nhiên, sát đời sống Việt (ăn hỏi, giỗ, tân gia, trả góp, thi lại, học bổng). `cach_noi_viet` phong phú, đúng thành ngữ. `tu_khoa_*` nhìn chung tốt, chỉ lác đác vài từ khoá dịch sát Waite mà đứng một mình không ai hiểu ("thú thật", "lòng thật lộ ra", "sơ suất nhỏ", "tin nhắn thư từ", "của để lại không như mong").

Việc cần làm trước khi khoá bản: sửa 1 cờ đỏ (coin_07.tien_bac), viết lại 6 chỗ sượng rõ (chủ yếu cot_loi bộ Kiếm), dọn 2 lỗi chính tả (coin_04 lặp từ, sword_01 "lóe"), và quyết một lần về mấy từ khoá dịch sát Waite kể trên.

---
Tổng số cờ đỏ: 1 (an toàn: 1, sáo ngữ: 0). Biên giới không tính: an toàn 5 cụm, sáo ngữ 3 cụm.
