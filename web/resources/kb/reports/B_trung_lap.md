# Báo cáo B — kiểm trùng lặp (code)

Backend embedding: `TF-IDF (pyvi word 1-2gram + char 3-5gram) — fallback, sandbox không tải được model HF`

## 1. cot_loi — cặp cosine > 0.85 (cờ đỏ)

Không có.

## 2. Bảng 20 cặp cot_loi giống nhau nhất (reader người thật đọc lần cuối)

| # | Lá A | Lá B | cosine | cot_loi A | cot_loi B |
|---|---|---|---|---|---|
| 1 | major_15 (Ác Quỷ) | sword_08 (Tám Kiếm) | 0.260 | Bị cái mình không chịu buông trói lại. Ham muốn, thói quen, vật chất, nỗi sợ; dây trói này lỏng hơn người ta tưởng, lối ra vẫn có, nhưng người trong cuộc không bước, vì còn thích hoặc tin là không có đường. | Tự trói bằng chính suy nghĩ của mình. Lối ra vẫn mở nhưng người trong cuộc không thấy, vì đã tin chắc là mình kẹt; cái kẹt này chỉ tạm, kẹt trong đầu chứ không kẹt ngoài đời. |
| 2 | coin_10 (Mười Tiền) | cup_10 (Mười Cốc) | 0.215 | Của cải thành nền nhà, thành thứ truyền được qua nhiều đời. Cái vững ở đây không của riêng một người: gia đình, dòng họ, tài sản lâu dài, nhận từ đời trước và để lại cho đời sau. | Tình cảm đã thành mái nhà, thành gia đình, đầy đủ và bền lâu. Vui ở đây là vui cả nhà, có gốc, giữ được qua năm tháng, không phải một lần vui rồi tan. |
| 3 | sword_08 (Tám Kiếm) | sword_09 (Chín Kiếm) | 0.205 | Tự trói bằng chính suy nghĩ của mình. Lối ra vẫn mở nhưng người trong cuộc không thấy, vì đã tin chắc là mình kẹt; cái kẹt này chỉ tạm, kẹt trong đầu chứ không kẹt ngoài đời. | Lo âu tự nhân lên trong đêm, dằn vặt vì điều đã qua hoặc chưa tới. Chẳng ai hại mình ngoài chính cái đầu mình, và nỗi sợ trong đầu thường nặng hơn chuyện thật ngoài đời rất nhiều. |
| 4 | cup_03 (Ba Cốc) | wand_04 (Bốn Gậy) | 0.200 | Vui vì có người cùng chia, việc đến hồi kết đẹp và mọi người tụ lại ăn mừng. Niềm vui ở đây là của nhóm, lấy sức từ bạn bè và người thân, rộng hơn một đôi. | Chặng đầu đã dựng xong nền, đủ để dừng lại mừng cùng nhà cửa, người thân. Niềm vui ở đây là có chỗ để về và cái đã xây đứng vững, chứ chưa phải đích cuối. |
| 5 | coin_03 (Ba Tiền) | wand_06 (Sáu Gậy) | 0.197 | Tay nghề được người khác nhìn thấy và cần đến. Làm việc trong một công trình chung, mỗi người một phần, giá trị của mình nằm ở chỗ được giao việc và được ghi nhận. | Thắng và được người khác thấy mình thắng. Công sức đã thành tin tốt đưa về, được đám đông công nhận; cái chính không phải làm xong, mà là được người ta nhìn nhận ngay trước mặt đông người. |
| 6 | cup_04 (Bốn Cốc) | cup_08 (Tám Cốc) | 0.194 | Có sẵn trước mặt mà thấy nhạt, ngồi lì giữa cái đang có và không buồn ngó thứ mới đưa tới. Không mất gì, không thiếu gì, chỉ chán và khép lại nên bỏ lỡ. | Rời bỏ cái đang có, dù nó không hỏng, vì lòng đã biết nó không còn đủ. Là bước đi có chủ ý để tìm thứ sâu hơn, khác với chán mà ngồi lì, khác với mất mà tiếc. |
| 7 | major_00 (Kẻ Khờ) | major_02 (Nữ Tư Tế) | 0.193 | Bước vào cái chưa biết mà không có kế hoạch, không có kinh nghiệm để dựa, chỉ có lòng tin. Chuyện chưa thành hình, mọi cửa còn mở; cái đáng nói không phải đích đến mà là dám đi khi chưa biết gì. | Biết mà chưa nói. Sự thật có đó nhưng còn giấu, chỉ nghe được khi im lặng và chờ; đây là trực giác, là bí mật đang giữ kín, không phải mơ hồ, càng không phải chuyện chưa có. |
| 8 | wand_06 (Sáu Gậy) | wand_10 (Mười Gậy) | 0.192 | Thắng và được người khác thấy mình thắng. Công sức đã thành tin tốt đưa về, được đám đông công nhận; cái chính không phải làm xong, mà là được người ta nhìn nhận ngay trước mặt đông người. | Thành quả đã gặt về nhưng gom hết vào một mình thành gánh. Cái nặng ở đây do chính thắng lợi sinh ra; đích ở ngay trước mặt mà sức đã cạn, chỉ vì không chịu đặt bớt xuống hay chia cho ai. |
| 9 | major_00 (Kẻ Khờ) | wand_01 (Át Gậy) | 0.186 | Bước vào cái chưa biết mà không có kế hoạch, không có kinh nghiệm để dựa, chỉ có lòng tin. Chuyện chưa thành hình, mọi cửa còn mở; cái đáng nói không phải đích đến mà là dám đi khi chưa biết gì. | Lửa ban đầu: một ý muốn làm bật lên, còn thô, chưa có kế hoạch, chưa có người đi cùng. Cái mới chỉ là mầm và sức bật, chưa phải việc; mọi chuyện về sau đều khởi từ cái hứng này. |
| 10 | cup_01 (Át Cốc) | wand_01 (Át Gậy) | 0.186 | Tình cảm vừa khơi nguồn, đầy đến tràn mà chưa hướng về ai, chưa thành chuyện gì. Mầm của mọi chuyện thương, chuyện vui về sau, còn nguyên, chưa có hình hài. | Lửa ban đầu: một ý muốn làm bật lên, còn thô, chưa có kế hoạch, chưa có người đi cùng. Cái mới chỉ là mầm và sức bật, chưa phải việc; mọi chuyện về sau đều khởi từ cái hứng này. |
| 11 | cup_02 (Hai Cốc) | major_06 (Tình Nhân) | 0.184 | Hai người nhận ra nhau và tình cảm chảy đều hai chiều, người này đưa thì người kia đón. Chuyện của đúng hai bên hợp ý, vừa mới kết lại, chưa cần ai thứ ba chứng kiến. | Hai bên đứng trước nhau, thấy nhau thật, và chọn nhau. Gắn kết bằng lựa chọn tự nguyện; chọn thứ này là bỏ thứ kia, nên đây vừa là tình cảm vừa là một quyết định lớn không thể nhờ ai chọn hộ. |
| 12 | sword_09 (Chín Kiếm) | wand_02 (Hai Gậy) | 0.175 | Lo âu tự nhân lên trong đêm, dằn vặt vì điều đã qua hoặc chưa tới. Chẳng ai hại mình ngoài chính cái đầu mình, và nỗi sợ trong đầu thường nặng hơn chuyện thật ngoài đời rất nhiều. | Đã có một chỗ đứng chắc, và chính cái chắc đó thành chật. Đứng giữa cái đang cầm trong tay và cái lớn hơn ở ngoài kia, tính đường đi xa mà chưa nhấc chân; quyền chọn còn nguyên trong tay mình. |
| 13 | coin_01 (Át Tiền) | coin_page (Tiểu Đồng Tiền) | 0.174 | Một cơ hội vật chất có thật, cầm được, đo đếm được, vừa đến tay. Mới là hạt giống chứ chưa là mùa, nhưng nền đã chắc, có chỗ để bắt đầu gây dựng bằng việc làm cụ thể. | Chăm chú học một thứ cụ thể đến mức quên cả xung quanh. Cơ hội đến ở dạng thực: một việc, một chỗ, một khoản nhỏ. Còn đang học chứ chưa kiếm được, nhưng học cho chắc. |
| 14 | coin_06 (Sáu Tiền) | major_10 (Bánh Xe Số Phận) | 0.173 | Của cải chảy từ người có sang người thiếu, nhưng theo ý người cho. Đang có kẻ cho người nhận; việc của người hỏi là biết mình đứng phía nào, và món này kèm điều kiện gì. | Vòng quay đổi chiều mà không ai bấm nút. Vận, chu kỳ, bước ngoặt đến từ bên ngoài; đang lên sẽ xuống, đang xuống sẽ lên, việc của người hỏi là biết mình đang ở đâu trên vòng, không phải cưỡng lại nó. |
| 15 | cup_05 (Năm Cốc) | sword_08 (Tám Kiếm) | 0.173 | Mất một phần và mắt chỉ dán vào phần đã đổ, trong khi phần còn lại vẫn nguyên. Tiếc là thật, nhưng cái kẹt của lá này là quay lưng với cái còn giữ được. | Tự trói bằng chính suy nghĩ của mình. Lối ra vẫn mở nhưng người trong cuộc không thấy, vì đã tin chắc là mình kẹt; cái kẹt này chỉ tạm, kẹt trong đầu chứ không kẹt ngoài đời. |
| 16 | coin_05 (Năm Tiền) | cup_04 (Bốn Cốc) | 0.172 | Thiếu thốn, mất chỗ dựa, thấy mình bị bỏ ngoài. Cái khó không chỉ là túng, mà là đang đi ngang chỗ có thể giúp mình mà mải nhìn cái thiếu nên không thấy. | Có sẵn trước mặt mà thấy nhạt, ngồi lì giữa cái đang có và không buồn ngó thứ mới đưa tới. Không mất gì, không thiếu gì, chỉ chán và khép lại nên bỏ lỡ. |
| 17 | cup_queen (Hoàng Hậu Cốc) | wand_king (Vua Gậy) | 0.166 | Hiểu người khác bằng cảm nhận trước khi họ nói ra, và giữ cái cảm nhận đó kín, không phô. Thương mà không bỏ việc; cái nhìn nuôi cái làm, chứ không thay cái làm. | Cầm trịch một việc lớn và kéo người khác cùng làm bằng tầm nhìn và tính thẳng. Không tự xông ra mà đặt hướng rồi giao. Có uy vì nói là làm, nhưng nóng khi việc chậm. |
| 18 | sword_08 (Tám Kiếm) | wand_02 (Hai Gậy) | 0.163 | Tự trói bằng chính suy nghĩ của mình. Lối ra vẫn mở nhưng người trong cuộc không thấy, vì đã tin chắc là mình kẹt; cái kẹt này chỉ tạm, kẹt trong đầu chứ không kẹt ngoài đời. | Đã có một chỗ đứng chắc, và chính cái chắc đó thành chật. Đứng giữa cái đang cầm trong tay và cái lớn hơn ở ngoài kia, tính đường đi xa mà chưa nhấc chân; quyền chọn còn nguyên trong tay mình. |
| 19 | cup_01 (Át Cốc) | major_00 (Kẻ Khờ) | 0.163 | Tình cảm vừa khơi nguồn, đầy đến tràn mà chưa hướng về ai, chưa thành chuyện gì. Mầm của mọi chuyện thương, chuyện vui về sau, còn nguyên, chưa có hình hài. | Bước vào cái chưa biết mà không có kế hoạch, không có kinh nghiệm để dựa, chỉ có lòng tin. Chuyện chưa thành hình, mọi cửa còn mở; cái đáng nói không phải đích đến mà là dám đi khi chưa biết gì. |
| 20 | coin_01 (Át Tiền) | wand_page (Tiểu Đồng Gậy) | 0.156 | Một cơ hội vật chất có thật, cầm được, đo đếm được, vừa đến tay. Mới là hạt giống chứ chưa là mùa, nhưng nền đã chắc, có chỗ để bắt đầu gây dựng bằng việc làm cụ thể. | Người mới toanh vừa bắt được một ý, một tin, một hứng và muốn bắt đầu ngay. Sức nằm ở chỗ háo hức, chưa nằm ở chỗ làm được gì; tin đến thường lạ và chưa rõ dẫn đi đâu. |

## 3. Từ khoá lặp trên tu_khoa_xuoi + tu_khoa_nguoc (cụm ở > 6 lá = cờ đỏ)

Không có.

Top 15 cụm xuất hiện nhiều nhất (tham khảo):

- «hai lòng» ×3: major_06, sword_02, wand_queen
- «chuyến đi hoãn» ×3: major_07, sword_06, wand_08
- «chuyển chỗ ở» ×3: sword_06, wand_04, wand_knight
- «quá tải» ×2: coin_02, wand_10
- «cười gượng» ×2: coin_02, major_19
- «giữ của» ×2: coin_04, coin_king
- «tiêu hoang» ×2: coin_04, coin_page
- «gượng dậy» ×2: coin_05, sword_10
- «cân lệch» ×2: coin_06, major_11
- «làm cho có» ×2: coin_08, coin_knight
- «bao bọc quá tay» ×2: coin_queen, major_03
- «một bên nguội» ×2: cup_02, major_06
- «tiệc mừng» ×2: cup_03, wand_04
- «tỉnh ra» ×2: cup_04, major_20
- «nguôi dần» ×2: cup_05, sword_03

## 4. lang_kinh — từng trường

### lang_kinh.tinh_cam

Cặp cosine > ngưỡng: không có.
Top 5 cặp giống nhất:
- coin_10 (Mười Tiền) ~ cup_10 (Mười Cốc): 0.268
- wand_08 (Tám Gậy) ~ wand_queen (Hoàng Hậu Gậy): 0.236
- major_13 (Thần Chết) ~ sword_10 (Mười Kiếm): 0.231
- major_02 (Nữ Tư Tế) ~ sword_07 (Bảy Kiếm): 0.225
- cup_01 (Át Cốc) ~ cup_page (Tiểu Đồng Cốc): 0.221

### lang_kinh.cong_viec

Cặp cosine > ngưỡng: không có.
Top 5 cặp giống nhất:
- coin_10 (Mười Tiền) ~ cup_10 (Mười Cốc): 0.215
- cup_01 (Át Cốc) ~ cup_04 (Bốn Cốc): 0.203
- major_06 (Tình Nhân) ~ sword_02 (Hai Kiếm): 0.202
- coin_03 (Ba Tiền) ~ coin_knight (Hiệp Sĩ Tiền): 0.198
- cup_06 (Sáu Cốc) ~ cup_10 (Mười Cốc): 0.191

### lang_kinh.tien_bac

Cặp cosine > ngưỡng: không có.
Top 5 cặp giống nhất:
- coin_knight (Hiệp Sĩ Tiền) ~ major_14 (Tiết Chế): 0.312
- major_19 (Mặt Trời) ~ wand_06 (Sáu Gậy): 0.226
- cup_06 (Sáu Cốc) ~ sword_03 (Ba Kiếm): 0.220
- cup_01 (Át Cốc) ~ cup_page (Tiểu Đồng Cốc): 0.214
- coin_08 (Tám Tiền) ~ cup_01 (Át Cốc): 0.211

### lang_kinh.tam_ly

Cặp cosine > ngưỡng: không có.
Top 5 cặp giống nhất:
- major_11 (Công Lý) ~ sword_king (Vua Kiếm): 0.225
- coin_10 (Mười Tiền) ~ cup_10 (Mười Cốc): 0.215
- major_01 (Pháp Sư) ~ sword_01 (Át Kiếm): 0.212
- major_04 (Hoàng Đế) ~ wand_king (Vua Gậy): 0.201
- coin_07 (Bảy Tiền) ~ wand_03 (Ba Gậy): 0.196

### lang_kinh.hoc_hanh

Cặp cosine > ngưỡng: không có.
Top 5 cặp giống nhất:
- coin_01 (Át Tiền) ~ cup_09 (Chín Cốc): 0.234
- sword_06 (Sáu Kiếm) ~ wand_knight (Hiệp Sĩ Gậy): 0.218
- cup_02 (Hai Cốc) ~ sword_queen (Hoàng Hậu Kiếm): 0.208
- wand_01 (Át Gậy) ~ wand_page (Tiểu Đồng Gậy): 0.206
- major_00 (Kẻ Khờ) ~ wand_page (Tiểu Đồng Gậy): 0.198


## Tổng cờ đỏ: 0
