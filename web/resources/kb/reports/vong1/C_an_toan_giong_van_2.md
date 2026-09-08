# Agent C — Kiểm an toàn và giọng văn (đợt 2: 40 lá số bộ Gậy, Cốc, Kiếm, Tiền)

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
