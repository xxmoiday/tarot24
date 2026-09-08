# Báo cáo C — an toàn và giọng văn (mẻ 1: 22 lá chính + 16 lá hoàng gia)

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
