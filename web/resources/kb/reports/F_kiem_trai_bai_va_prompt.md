# F. Kiểm độc lập 14 bài luận mẫu + system prompt

Nguồn kiểm: `ref/STYLE.md`, `prompts/system_luan_bai.md`, `build/spreads.json` (11 kiểu trải, 14 ví dụ), và `cards/<id>.yaml` của các lá xuất hiện. Không sửa file nào.

Ba bài đối chiếu KB kỹ (theo yêu cầu, một bài 1 lá, một bài 3–5 lá, bài Celtic): `mot_la_hom_nay.vi_du[0]` (Mười Kiếm), `ba_la_tinh_huong.vi_du[0]` (Át Cốc ngược, Mặt Trăng, Mười Cốc), `celtic_cross.vi_du[0]` (10 lá). Ngoài ra đã mở yaml của toàn bộ 36 lá còn lại xuất hiện trong 11 bài kia để soát phần `canh_bao` "đừng đọc thành" và chi tiết hình, vì đó là chỗ dễ sinh cờ đỏ nhất.

Cách đếm độ dài: số tiếng cách nhau bằng dấu cách (whitespace token). System prompt nói "số chữ tiếng Việt" nên đây là cách đếm hợp lý nhất, ghi rõ để đối chiếu.

---

## 1. Cờ đỏ

### 1a. An toàn (bệnh, sinh tử, thai sản, kiện tụng, mua bán đầu tư)

**0 cờ đỏ.** Soát từng bài:

- `mot_la_hom_nay[0]` Mười Kiếm: nói rõ "không phải điềm gở", "không báo chuyện dữ gì ngoài đời". Đúng canh_bao của lá.
- `mot_la_co_khong[1]` (ghi_chu, mua đất Long Thành): chuyển hướng đúng ba việc của mục 5: (1) "bài tarot ở đây không dùng để trả lời, và mình không kết luận có hay không dù lá ra sao", (2) chỉ "người có chuyên môn tài chính và người rành pháp lý đất đai", (3) đọc phần tâm thế. Không có câu nào nghiêng về nên mua hay không nên mua. Câu "Quyết trong lúc sợ thì hay quyết theo cái vỏ" là nói về tâm thế, chưa thành khuyến nghị. Đạt.
- `nam_la_tinh_cam[1]` (ghi_chu, "anh ấy có người khác không"): mở bằng "bài không nhìn được vào người vắng mặt... mình không khẳng định cũng không phủ định", Toà Tháp ở lá hai đọc thành "phía anh ấy đang khó" với "có vẻ", nói rõ "Lá không nói anh ấy giấu người". Đạt. Một chỗ cần xem ở mục Giọng (việc cuối coi chuyện "đang sụp" là có thật).
- `cong_viec_5[0]`, `hai_nguoi[0]` Thần Chết: đều đọc thành "đã hết đời của nó", "đã sang trang"; không có chữ nào về chết chóc, tang, bệnh.
- `thang_toi[0]` Nữ Hoàng: "việc, tiền, tình đều dễ chịu hơn... nhớ chăm cả mình"; không chạm thai sản.
- `celtic_cross[0]` Vua Kiếm: không đọc thành kiện tụng, dừng ở "xét mọi thứ bằng lý".
- `tien_bac_4[0]`: không có khuyến nghị mua bán giữ vay; việc cuối là tách khoản và ghi chi, đúng luat_doc.
- `quyet_dinh_ab[0]`: chọn việc, không phải chọn đầu tư; "Bài nghiêng về nhánh A" là được phép theo luat_doc của kiểu trải.
- Không bài nào có "sẽ", "chắc chắn", "nhất định", mốc ngày, hay lời hứa kết quả.

### 1b. Bám KB

**1 cờ đỏ (mức nhẹ), 1 cờ vàng.**

**Cờ đỏ 1. `tien_bac_4.vi_du[0]`, lá Cỗ Xe (major_07):**
Trích: "Tiền của lá này hay đi vào chuyển động: xe cộ, đi lại, những khoản chi để thấy mình đang tiến." và việc cuối "đi lại và xe cộ ghi riêng một cột."
`canh_bao` của Cỗ Xe ghi: "Chớ tự động gắn với mua xe, tai nạn giao thông hay một chuyến đi cụ thể nếu người hỏi không hỏi về đi lại." Câu hỏi là "lương ổn mà cuối tháng hết tiền", không hỏi về đi lại, nhưng bài tự gắn tiền vào xe cộ và còn đưa nó vào việc cụ thể. Đây đúng là kiểu đọc mà phần "đừng đọc thành" cấm. Không nguy hiểm, nhưng là đọc lá vượt KB.
Sửa: bỏ câu "Tiền của lá này hay đi vào chuyển động..." thay bằng ý có trong `lang_kinh.tien_bac`/`cot_loi` của lá (ý chí ghìm hai lực, đầu tháng thắng cuối tháng đuối), và việc cuối đổi thành "ghi từng khoản chi trong hai tuần, cuối mỗi tuần khoanh những khoản tiêu để thấy mình đang tiến chứ không vì cần".

**Cờ vàng. `celtic_cross.vi_du[0]`, câu mở "Nhìn cả bàn":**
Trích: "Cốc và Tiền chia đều, hai Át nằm ở gốc và ở xung quanh, ba lá hoàng gia, hai lá ngược."
Đếm thật: Cốc 2 (Ba Cốc, Át Cốc), Tiền 3 (Bốn Tiền, Vua Tiền, Át Tiền), Gậy 3 (Bốn Gậy, Tiểu Đồng Gậy, Bảy Gậy), Kiếm 1, Ẩn Chính 1. "Cốc và Tiền chia đều" sai; Gậy nhiều bằng Tiền và bài không nhắc. Ba hoàng gia, hai ngược, hai Át thì đúng. Không phải đọc sai lá, nhưng câu toàn cảnh (thứ system prompt bắt mở bài) đếm sai, mà LLM sẽ bắt chước kiểu câu này.
Sửa: "Nhìn cả bàn: Gậy và Tiền chiếm sáu trong mười lá, hai Át nằm ở gốc và ở xung quanh, ba lá hoàng gia, hai lá ngược."

Kết quả đối chiếu ba bài chọn:

- `mot_la_hom_nay[0]` Mười Kiếm: `cot_loi` ("tận cùng, không còn gì để mất thêm, điểm dừng hẳn") được đọc đúng; chi tiết hình "người nằm sấp dưới mười thanh kiếm, sát chân trời vẫn có một dải vàng đang ló" có trong `bieu_tuong`; "đừng ngồi than, đừng cố vớt" là phần đầu `canh_bao`; tuân thủ "không đọc thành tai nạn, tin dữ". Đạt.
- `ba_la_tinh_huong[0]`: Át Cốc ngược đọc theo hướng lật sang đối lập ("cốc đã cạn", có trong `tu_khoa_nguoc`) và bám `lang_kinh.hoc_hanh` ("mới thấy thích... hào hứng ghi danh"); Mặt Trăng bám `hoc_hanh` và `tam_ly` gần như từng ý; Mười Cốc bám `hoc_hanh` ("học có gia đình đứng sau... học để lo cho nhà"). Không bịa hình. Đạt.
- `celtic_cross[0]`: cả mười lá đều truy về được `cot_loi`; Vua Kiếm không vi phạm "đừng lấy lá làm cớ phán một mối là không có tình"; Vua Tiền ngược và Bảy Gậy ngược đọc đúng `tu_khoa_nguoc` ("cơ ngơi lung lay", "cứng nhắc, cũ kỹ"; "chùn tay", "cố thủ", "bị lấn"); Tiểu Đồng Gậy ở lá chín lấy đúng ý "hứng lên ba hôm rồi xẹp" từ `canh_bao`; chi tiết hình Ba Cốc có trong `bieu_tuong`. Đạt, trừ cờ vàng đếm sai ở trên.

Soát nhanh 11 bài còn lại: mọi chi tiết hình được nhắc (mặt trời mọc ở chân trời xa trên Thần Chết; nhân sư không dây cương; người treo mặt bình thản mắt mở; tường thành nhìn ra biển; xích rộng và lỏng; ruộng lúa chín; ba cốc đổ hai cốc sau lưng; tám cây gậy không ai cầm; cá trong cốc không nhắc) đều có trong `bieu_tuong`. Thành ngữ "ván đã đóng thuyền", "đầu voi đuôi chuột", "chân trong chân ngoài" đều có trong `cach_noi_viet` của đúng lá. Không có lá nào bị đọc thành lá khác.

---

## 2. Tuân thủ system prompt (14 bài)

Cột: **AT** an toàn; **KB** bám KB (✓ đã đối chiếu đủ / ○ chỉ soát canh_bao và hình); **XH** xưng hô bạn/mình, không "bạn thân mến"; **CC** không cụm cấm mục 1; **SE** không "sẽ/chắc chắn/nhất định"; **DD** không chấm than, tiêu đề, gạch đầu dòng, in đậm; **EN** không tên lá tiếng Anh; **TC** mở bằng câu toàn cảnh (hoặc câu mở theo luat_doc riêng); **LD** theo luat_doc của kiểu trải; **KT** đoạn cuối có trả lời thẳng + một việc cụ thể; **DL** độ dài trong khung (số tiếng / khung); **H1** tối đa một chi tiết hình mỗi lá.

| # | Bài | AT | KB | XH | CC | SE | DD | EN | TC | LD | KT | DL | H1 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | mot_la_hom_nay[0] | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗¹ | ✓ | 178/120–180 ✓ | ✗ (2) |
| 2 | mot_la_co_khong[0] | ✓ | ○ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (mở đúng cụm "Nghiêng về có") | ✓ | ✓ | 175/120–180 ✓ | ✓ |
| 3 | mot_la_co_khong[1] ghi_chu | ✓ | ○ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (mở bằng chuyển hướng, đúng luật 4) | ✓ | ✓ | 180/120–180 ✓ (chạm trần) | ✓ |
| 4 | ba_la_thoi_gian[0] | ✓ | ○ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 296/220–300 ✓ | ✗ (Bốn Tiền 2) |
| 5 | ba_la_thoi_gian[1] | ✓ | ○ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 298/220–300 ✓ | ✓ |
| 6 | ba_la_tinh_huong[0] | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 299/220–300 ✓ | ✓ |
| 7 | nam_la_tinh_cam[0] | ✓ | ○ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 379/280–380 ✓ | ✗ (Bảy Gậy 3) |
| 8 | nam_la_tinh_cam[1] ghi_chu | ✓ | ○ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (xem Giọng) | 380/280–380 ✓ (chạm trần) | ✓ |
| 9 | celtic_cross[0] | ✓ | ✓ (cờ vàng đếm) | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ (đếm sai) | ✓ (gom 4 cụm, đối chiếu 5–9 và 7–8, kết từ lá 10 + việc từ lá 5) | ✓ | 548/450–550 ✓ | ✓ |
| 10 | cong_viec_5[0] | ✓ | ○ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓² | ✓ | ✓ | 374/280–380 ✓ | ✓ |
| 11 | tien_bac_4[0] | ✓ | ✗ (cờ đỏ Cỗ Xe) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 378/280–380 ✓ | ✓ |
| 12 | hai_nguoi[0] | ✓ | ○ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (xem Giọng) | 297/220–300 ✓ | ✓ |
| 13 | quyet_dinh_ab[0] | ✓ | ○ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓³ | ✓ | 380/280–380 ✓ (chạm trần) | ✓ |
| 14 | thang_toi[0] | ✓ | ○ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (mở bằng lá năm, đúng luật) | ✓ | ✓ | 376/280–380 ✓ | ✗ (Tiết Chế 2) |

Chú thích:

¹ `mot_la_hom_nay` luat_doc 3: "Câu hỏi mở kiểu 'hôm nay thế nào' thì không bịa sự kiện... không nói chuyện gì sắp xảy ra." Bài có "Hôm nay là ngày cái biết đó rõ ra" và "Hôm nay của bạn là ngày khép một chuyện cho hẳn", tức đang gọi tên một sự kiện trong ngày. Nên đổi sang tâm thế: "Hôm nay dễ là ngày bạn thôi vờ như chưa biết" / "Hôm nay của bạn là tâm thế khép một chuyện cho hẳn".

² `cong_viec_5[0]` mở "hai lá Át cạnh nhau": theo `cach_rut`, lá hai bên trái và lá ba bên phải lá một, không cạnh nhau trên bàn. Nhỏ, nhưng câu toàn cảnh nên đúng với bàn: "hai lá Át kẹp hai bên chỗ đứng".

³ `quyet_dinh_ab` luat_doc 3 bảo so `trong_luong` và `huong` của lá ba với lá năm. Bảy Gậy nặng, Bốn Cốc vừa, nhưng bài nghiêng về nhánh có lá nặng hơn, lấy `huong` ("đứng chặn" hơn "khoanh tay ngó lơ") làm lý do. Bài giải thích được, nhưng luat_doc chưa nói khi trọng lượng và hướng vênh nhau thì ưu tiên cái nào. Xem mục 4.

Nhận xét chung bảng:
- 14/14 đạt an toàn, cụm cấm, "sẽ", định dạng, tên lá, kết có việc cụ thể, độ dài.
- 13/14 độ dài nằm ở 97–100% trần khung; 3 bài chạm đúng trần. Bài mẫu viết sát trần thì LLM bắt chước sẽ vượt trần. Xem mục 4.
- 4/14 vi phạm "tối đa một chi tiết hình mỗi lá" (mục 2 system prompt). Hoặc sửa bài, hoặc nới luật thành "một hai chi tiết".

---

## 3. Giọng

Định dạng: `spread_id.vi_du[i]`: trích → gợi ý sửa.

**Sáo / thành công thức lặp (quan trọng nhất về giọng)**

- 10/14 bài kết bằng đúng nhãn "Trả lời thẳng:" rồi "Việc tuần tới:" / "Việc cụ thể:" / "Việc trong tuần này:". Hai nhãn có dấu hai chấm đứng đầu câu thực chất là tiêu đề trá hình, và LLM sẽ chép nguyên nhãn này vào mọi bài. Gợi ý: giữ nội dung, bỏ nhãn ở ít nhất một nửa số bài mẫu, ví dụ `ba_la_tinh_huong[0]` "Trả lời thẳng: điểm không lên vì bạn đang học cạn lòng và mù đường" → "Điểm không lên vì bạn đang học cạn lòng và mù đường, không biết mình đứng đâu. Tuần tới rủ đúng một người..."
- Cụm "lá trục của bài" (`ba_la_thoi_gian[0]`, `[1]`), "lá then chốt" (`ba_la_tinh_huong[0]`, `tien_bac_4[0]`), "tuần then chốt vì cùng chiều với lá chủ đề" (`thang_toi[0]`), "Cái cắt ngang là Vua Kiếm, đọc xuôi:" (`celtic_cross[0]`), "ở vị trí cản thì lá đẹp này đang bị dùng quá tay" (`cong_viec_5[0]`): đây là ngôn ngữ luat_doc nói với LLM, lọt ra ngoài nói với khách. Người bói có nghề không bảo khách "lá này đọc xuôi". Gợi ý: `celtic_cross[0]` "Cái cắt ngang là Vua Kiếm, đọc xuôi: một cái đầu lạnh đang chen vào" → "Cắt ngang cái vui đó là Vua Kiếm, một cái đầu lạnh chen vào"; `thang_toi[0]` "tuần then chốt vì cùng chiều với lá chủ đề" → "đây là tuần đáng dồn sức nhất, vì nó cùng nhịp với cả tháng".

**Văn dịch / chữ lạ**

- `ba_la_thoi_gian[1]`: "hai người còn đang mò liều nhau" → "hai người còn đang dò liều nhau" (đoạn sau bài đã dùng "dò liều", nên chữ "mò" là lỗi).
- `nam_la_tinh_cam[0]`: "nó đang non lại theo cách khác và cần làm mới hơn là cứu" → "nó đang phải bắt đầu lại theo cách khác, cần làm mới hơn là cứu".
- `tien_bac_4[0]`: "để tiền tự treo thay vì tự tay treo nó" — chơi chữ trên tên lá, khách không đọc yaml nên không hiểu → "sai ở chỗ để tiền tự trôi thay vì tự tay cất nó".
- `mot_la_co_khong[1]`: "Quyết trong lúc sợ thì hay quyết theo cái vỏ" → "Quyết trong lúc sợ thì hay quyết theo lời người ngoài, không theo sổ nhà mình".
- `ba_la_thoi_gian[0]`: "tính chuyện xoay ghế" → "tính chuyện đổi chỗ".

**Bịa hoàn cảnh quá cụ thể (nghe như phán)**

- `hai_nguoi[0]`: "kiểu một cái mới trong đời bạn mà cô ấy nghe qua người quen chứ không phải được bạn kể" — bài dựng hẳn một kịch bản (cô ấy nghe qua người khác), rồi việc cuối "kể thẳng cái mới trong đời bạn" xây trên kịch bản đó; nếu sai thì lời khuyên lệch. `la_tinh_huong` của Tiểu Đồng Gậy chỉ nói "một tin bất ngờ, hơi lạ, thường từ người quen hay trong nhà". Gợi ý: "một tin còn thô đang đứng giữa hai người, có thể là cái mới trong đời bạn mà cô ấy mới nghe loáng thoáng, chưa nghe từ bạn"; việc cuối: "kể thẳng cái đã đổi ở bạn".
- `nam_la_tinh_cam[1]`: lá hai nói "có vẻ một chỗ đứng nào đó của anh ấy vừa sụp", nhưng việc cuối "hỏi anh ấy đúng một câu về chuyện đang sụp" đã coi chuyện sụp là thật. Gợi ý: "hỏi anh ấy đúng một câu, dạo này có chuyện gì nặng không, và không hỏi về ai khác".
- `mot_la_hom_nay[0]`: xem chú thích ¹ ở bảng.

**Doạ / tô hồng**

- Không bài nào doạ. `quyet_dinh_ab[0]` Toà Tháp ở nhánh B "nếu vỡ thì vỡ trong một cú" hơi gắt cho người đang làm ở startup, nhưng đã có "Bài không nói vỡ lúc nào" và "cái đổ là cái đã mỏng sẵn", đúng canh_bao. Giữ được.
- Không bài nào tô hồng; các lá nhẹ (Ngôi Sao, Mười Cốc, Nữ Hoàng, Thế Giới) đều kèm điều kiện.

**Việc cụ thể ở cuối**

- Tốt, đời, làm được một mình: `mot_la_co_khong[0]` (soạn tin ba dòng, xoá câu đòi hồi âm, gửi lúc đang vui), `ba_la_tinh_huong[0]` (làm một đề bốn kỹ năng có bấm giờ, ghi kỹ năng thấp nhất), `tien_bac_4[0]` (tách khoản ngay ngày lương về), `cong_viec_5[0]` (viết ba thứ cầm được, nhắn một người cũ).
- Hơi kỳ: `mot_la_hom_nay[0]` "viết một dòng thừa nhận nó đã xong, rồi để tờ giấy đó đấy, không quay lại đọc" — nghi thức hơn là việc; đổi thành "chọn đúng một thứ bạn vẫn cố vá dù biết là hỏng, hôm nay không đụng vào nó nữa, kể cả mở lên xem".
- Hơi mơ hồ: `thang_toi[0]` "chọn một thứ bạn hay làm quá, cho đi, tiêu, hay ngồi với cái mình thích, đặt cho nó một mức đều mỗi ngày" — ba lựa chọn gộp một câu, khó nắm; giữ một ví dụ: "chọn đúng một thứ bạn hay làm quá tay, ví dụ tiêu cho người khác, đặt cho nó một mức mỗi tuần và giữ mức đó suốt bốn tuần".
- Phụ thuộc người kia một phần: `nam_la_tinh_cam[0]` "rủ người ấy một chuyện hai đứa chưa từng làm" — rủ là việc một mình làm được, chấp nhận; nhưng "không hỏi câu nào về tương lai trong buổi đó" giả định buổi đó xảy ra. Nhỏ.

**Chỗ hay, nên giữ làm mẫu giọng:** "đo bằng thước thì cái gì cũng thiếu" (celtic), "Tay bận ôm nên không còn tay để nhận" (ba_la_thoi_gian[0]), "kể cả sếp mới cũng còn là một cái cốc trên mây" (cong_viec_5), "miễn không có chữ nhớ và không có chữ tại sao" (mot_la_co_khong[0]), "giấu chưa phải là dối" (hai_nguoi).

---

## 4. System prompt (`prompts/system_luan_bai.md`)

Tổng thể: gọn, đúng hướng, không lặp nhiều, các bài mẫu tuân thủ được gần hết. Các chỗ cần sửa, trích câu:

**4.1 Thiếu câu về thứ tự ưu tiên giữa mục 4 và luat_doc của kiểu trải.**
Mục 4 viết: "mở bằng một câu nói cái toàn cảnh..., rồi đi qua từng vị trí theo thứ tự trải..., rồi kết bằng một câu trả lời thẳng câu hỏi và một việc cụ thể người hỏi làm được trong tuần tới." Nhưng `celtic_cross` luat_doc bảo "Không đi qua mười lá lần lượt; gom thành ba bốn cụm", `thang_toi` bảo "Mở bài bằng lá năm", `mot_la_co_khong` bảo "Nói kết luận ngay câu đầu", `mot_la_hom_nay` bảo việc "làm được trong ngày", `thang_toi` bảo "việc nên giữ cả tháng". Hiện prompt chỉ nói "luật đọc riêng của kiểu trải đó" mà không nói nó thắng mục 4. Đề xuất thêm vào cuối đoạn đầu mục 4: "Luật đọc của kiểu trải đi kèm mỗi lượt thắng thứ tự và khung thời gian mặc định ở mục này khi hai bên khác nhau."

**4.2 Chưa nói tới `lang_kinh_uu_tien` và `goi_y_doc` của vị trí.**
Mục 2 viết "Chọn đúng một lăng kính theo câu hỏi", nhưng mỗi vị trí trong spreads.json có `lang_kinh_uu_tien` (theo_cau_hoi / tam_ly / tinh_cam / cong_viec / tien_bac) và `goi_y_doc`. Prompt không bảo LLM đọc hai trường này. Đề xuất thêm vào mục 4: "Mỗi vị trí có `goi_y_doc` và `lang_kinh_uu_tien`; theo đó trước, `theo_cau_hoi` mới về luật chọn lăng kính ở mục 2."

**4.3 Mô tả `canh_bao` không khớp dữ liệu.**
Mục 2: "`canh_bao`: hai phần. Phần đầu là mặt tối của lá... Phần sau là chỉ dẫn 'đừng đọc thành...'". Thực tế `canh_bao` là một đoạn liền không có dấu phân cách, hai ý trộn trong cùng đoạn, có lá thêm ý thứ ba (ví dụ Chín Tiền: mặt tối, rồi "không đọc thành ế", rồi "không khuyên mua nhà đất"). Đề xuất viết: "`canh_bao`: một đoạn gồm mặt tối của lá (dùng khi lá ngược hoặc vị trí là trở ngại) và những câu 'không đọc thành...', 'đừng...' là chỉ dẫn cho bạn, bắt buộc tuân theo, không nói lại với người hỏi. Không có dấu phân cách, tự tách."

**4.4 Thang `trong_luong` không được liệt kê.**
Mục 2 chỉ nói "`trong_luong` cho biết lá nặng hay nhẹ". `mot_la_co_khong` luat_doc dùng đúng năm mức "rất nhẹ / nhẹ / vừa / nặng / rất nặng" để ra kết luận; `quyet_dinh_ab` cũng so mức. Đề xuất ghi thẳng: "`trong_luong` có năm mức: rất nhẹ, nhẹ, vừa, nặng, rất nặng."

**4.5 Cấm "sẽ" tuyệt đối trong khi KB đầy "sẽ".**
Mục 5: "Không dùng 'chắc chắn', 'nhất định', 'sẽ'." Nhưng chính KB có: Bánh Xe `cot_loi` "đang lên sẽ xuống, đang xuống sẽ lên"; Vua Kiếm `la_tinh_huong` "Chuyện này sẽ được xét theo lý"; Thế Giới `cot_loi` "cái tiếp theo, nếu có, sẽ là một vòng khác"; nhiều `canh_bao` "không hứa sẽ cưới". LLM vốn hay chép cụm từ KB nên "sẽ" sẽ lọt. Hai cách: (a) giữ cấm nhưng thêm "KB có chữ 'sẽ' thì đổi sang 'đang', 'nghiêng về', 'nếu... thì' khi viết"; (b) nới thành "không dùng 'sẽ' để hứa kết quả cho người hỏi". Khuyên (a), vì kiểm tự động dễ hơn.

**4.6 Độ dài: cách đếm chưa rõ, bài mẫu sát trần.**
Mục 6: "Tính theo số chữ tiếng Việt." Chữ có thể hiểu là tiếng (âm tiết) hay từ. Đề xuất: "đếm theo tiếng, mỗi tiếng cách nhau một dấu cách". Và thêm một câu: "Nhắm vào giữa khung, không viết sát trần." Lý do: 13/14 bài mẫu nằm ở 97–100% trần, LLM học từ mẫu sẽ vượt.

**4.7 "Tối đa một chi tiết hình mỗi lá" bị chính bài mẫu vi phạm 4 lần.**
Mục 2: "tối đa một chi tiết mỗi lá, không tả tranh." `nam_la_tinh_cam[0]` Bảy Gậy có ba chi tiết trong một câu; `ba_la_thoi_gian[0]` Bốn Tiền hai; `thang_toi[0]` Tiết Chế hai; `mot_la_hom_nay[0]` Mười Kiếm hai. Chọn một: sửa bốn bài, hoặc nới thành "một hai chi tiết trong cùng một câu ngắn, không tả tranh". Khuyên nới, vì hai chi tiết đối nhau (người nằm / dải sáng) thường là chính cái làm câu sống.

**4.8 Không cấm ngôn ngữ luật đọc lọt ra bài.**
Mục 5 cấm "Không nhắc tới KB, trường dữ liệu, nguồn sách" nhưng không cấm "lá trục", "lá then chốt", "đọc xuôi", "cùng chiều với lá chủ đề", "ở vị trí cản". Bài mẫu dùng 7 lần (xem mục 3). Nếu app chấp nhận thì ghi rõ là được phép; nếu không thì thêm: "Không nói với người hỏi bằng từ của luật đọc: 'lá trục', 'lá then chốt', 'đọc xuôi', 'cùng chiều', 'ở vị trí cản'. Gọi tên vị trí bằng lời thường ('quá khứ là', 'cái đang cản là')."

**4.9 Nhãn "Trả lời thẳng:" / "Việc tuần tới:" chưa được prompt nói tới.**
Mục 7 cấm tiêu đề, nhưng bài mẫu dùng nhãn hai chấm ở 10/14 bài. Prompt nên chốt một trong hai: cho phép đúng hai nhãn này (và chỉ hai), hoặc cấm và sửa bài mẫu. Không nói gì thì LLM sẽ vừa dùng nhãn vừa bịa thêm nhãn khác ("Toàn cảnh:", "Lời khuyên:").

**4.10 "người hỏi" trong KB vs "bạn" trong bài.**
Mục 1: "Người hỏi là 'bạn'." Toàn bộ KB viết "người hỏi" (theo STYLE.md). LLM chép nguyên câu KB dễ ra "người hỏi đang sợ mất nhiều hơn muốn được" giữa bài xưng "bạn". Đề xuất thêm một câu ở mục 2: "KB viết 'người hỏi'; khi đưa vào bài luôn đổi thành 'bạn'."

**4.11 Luật so hai đích ở `quyet_dinh_ab` chưa đủ để thực thi.**
luat_doc 3: "so trong_luong và huong trong sac_thai của lá ba với lá năm". Bài mẫu chọn nhánh có lá nặng hơn vì `huong` tốt hơn, nghĩa là hướng thắng trọng lượng. Đề xuất ghi rõ trong luat_doc (thuộc spreads, không phải system prompt): "hướng đi ra ngoài, tiến tới, đứng giữ thì hơn hướng ngồi yên, ngó lơ, rơi xuống, kể cả khi lá nặng hơn; hai lá ngang cả hai mặt thì nói bài chưa nghiêng."

**4.12 Thiếu một câu cho người hỏi đang trong khủng hoảng.**
Mục 8 có "Nếu người hỏi có vẻ đang hoảng, đang buồn nặng, hạ giọng, nói ít". Chưa có gì cho trường hợp người hỏi nói tới việc muốn làm hại mình hoặc không muốn sống. App bói bài cho người trẻ hỏi tình cảm thì trường hợp này có thật. Đề xuất thêm vào mục 8: "Nếu người hỏi nói tới việc tự làm hại mình hay không muốn sống nữa, dừng luận bài, nói ngắn rằng bạn muốn họ nói chuyện này với một người thật ngay bây giờ, đưa số đường dây hỗ trợ mà ứng dụng cung cấp, không đọc tiếp lá."

**4.13 Lặp nhỏ, có thể cắt.**
- Mục 5 câu cuối "Không kể tên lá bằng tiếng Anh" lặp mục 1 "không kèm tên tiếng Anh". Cắt ở mục 5.
- Mục 9 lặp lại danh sách của mục 1 và 5 dưới dạng câu hỏi. Đây là lặp có chủ ý (checklist), giữ được, nhưng thiếu hai ý: "có câu nào phán về người vắng mặt như sự thật không" và "có mốc ngày không". Thêm hai câu này vào mục 9.

**4.14 Luật LLM khó thực thi, cần biết trước:**
- Đếm chữ chính xác trong khung hẹp (120–180 là khung 60 tiếng). LLM đếm kém; nên có kiểm ngoài (app đếm và yêu cầu viết lại) thay vì trông vào mục 9.
- "Nhìn cả bàn ... nhiều lá cùng một chất" đòi đếm đúng; bài mẫu Celtic đã đếm sai. Nên thêm "đếm trước khi nói, không chắc thì bỏ câu này" (mục 4 đã có "còn không thì bỏ", giữ).
- "Chọn đúng một lăng kính" với câu hỏi chung: bài mẫu Celtic và thang_toi chạm ba lĩnh vực ("việc, tiền, tình đều dễ chịu hơn"). Prompt đã cho phép "chạm nhẹ lĩnh vực người hỏi nhắc tới", đủ.

---

## 5. Tổng kết

- **Cờ đỏ an toàn: 0 / 14.** Hai bài có ghi_chu chuyển hướng đúng mục 5, không kết luận.
- **Cờ đỏ bám KB: 1** (`tien_bac_4.vi_du[0]`, Cỗ Xe gắn xe cộ/đi lại trái `canh_bao`), mức nhẹ, sửa hai câu là xong.
- **Cờ vàng: 1** (`celtic_cross.vi_du[0]`, câu toàn cảnh đếm sai chất).
- **Tuân thủ:** 14/14 đạt an toàn, cụm cấm, "sẽ", định dạng, độ dài; 4 bài vượt "một chi tiết hình"; 1 bài (`mot_la_hom_nay`) gọi tên sự kiện trong ngày trái luat_doc riêng.
- **Giọng:** cần sửa nhất là nhãn "Trả lời thẳng:" lặp 10/14 và ngôn ngữ luật đọc lọt ra bài (7 chỗ); 5 chữ lạ/văn dịch; 2 chỗ bịa kịch bản quá cụ thể.
- **System prompt:** 12 đề xuất ở mục 4, ưu tiên 4.1 (luat_doc thắng mục 4), 4.2 (đọc `goi_y_doc`/`lang_kinh_uu_tien`), 4.5 (chữ "sẽ" trong KB), 4.6 (cách đếm + nhắm giữa khung), 4.8–4.9 (chốt chuyện nhãn và từ luật đọc), 4.12 (khủng hoảng).
