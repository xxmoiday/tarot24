# Nối ứng dụng khác vào Tarot24 API

Tài liệu cho một ứng dụng bên ngoài gọi sang backend Tarot24 để bói bài. Người
vận hành chính backend thì đọc `README.md` và `DEPLOY.md`.

## 1. Nối vào đâu

| | |
|---|---|
| Gốc | `https://api.tarot24.online` |
| Tiền tố | mọi đường dẫn bắt đầu bằng `/api` |
| Xác thực | header `x-api-key`, khoá riêng cấp cho ứng dụng của bạn |
| Kiểu gọi | chỉ từ máy chủ sang máy chủ |

Không có đường nào ở đây mở toang, kể cả `/api/health`. Thiếu khoá hoặc sai khoá
thì mọi đường đều trả **403**.

Khoá của bạn khác khoá của web, nên hai bên tách nhau: thu hồi hay đổi khoá bên
này không đụng gì bên kia.

Kèm theo khoá là **trần lượt gọi mô hình mỗi ngày của riêng bạn**, thoả thuận
lúc cấp khoá. Hết trần riêng thì mọi đường sinh bài trả **429** kèm
`reason: "over-budget"`, còn `GET` lấy bài cũ vẫn chạy bình thường. Trần này
không phải để chia phần mà là cái nắp: app của bạn có retry loạn hay lộ khoá thì
web tarot24.online vẫn sống.

Trên trần riêng còn một trần tổng cho cả hệ thống, mặc định 1000 lượt mỗi ngày,
cũng trả `over-budget` khi chạm. Cả hai mốc reset lúc nửa đêm giờ Việt Nam. Xem
tổng đã dùng ở `/api/health` → `luot: { dem, tran }`.

Một "lượt" là một lần gọi mô hình, không phải một bài: lượt gọi lại để sửa bài
hỏng cũng tính. Thực tế cứ 100 bài thì mất khoảng 105 lượt.

Khoá tiêu thẳng vào tiền mô hình, nên nó không được ra khỏi máy chủ: không nhúng vào bản dựng app điện thoại, không để lọt xuống
trình duyệt, không đi kèm mã nguồn phía client. CORS của backend chỉ mở cho
`tarot24.online`, nên gọi thẳng từ trình duyệt cũng không qua được — đó là chủ ý
chứ không phải thiếu sót.

## 2. Một lượt bói đi thế nào

Backend **không rút bài**. Ứng dụng của bạn tự xào, tự rút, rồi gói lựa chọn vào
một chuỗi gọi là **mã bài đọc** (`id`). Backend giải chuỗi đó ra rồi mới dựng
bài luận.

1. Người dùng chọn kiểu trải, nhập câu hỏi, chọn lĩnh vực
2. App rút đủ số lá của kiểu trải đó
3. App sinh `id` (mục 3)
4. `POST /api/readings` với `{ id }` → bài luận, mất 8–15 giây
5. Xem lại sau: `GET /api/readings/:id`, không tốn lượt mô hình
6. Hỏi thêm tối đa 3 câu, rút lá làm rõ tối đa 2 lá

`id` cũng chính là khoá lưu trữ. Gọi `POST /api/readings` hai lần cùng một `id`
thì lần sau trả nguyên bài cũ kèm `cached: true` và không tốn lượt mô hình. Nên
lưu `id` vào database của bạn thay vì chép cả bài luận về.

## 3. Mã bài đọc

`id` là base64url của một mảng JSON năm phần tử, không dấu `=` ở đuôi:

```
[ kiểu_trải, câu_hỏi, lĩnh_vực, "slug,slug!,slug", thời_điểm ]
```

| Vị trí | Kiểu | Ghi chú |
|---|---|---|
| 0 | chuỗi | slug kiểu trải, bảng ở mục 4 |
| 1 | chuỗi | câu hỏi nguyên văn, để `""` nếu người dùng không hỏi gì |
| 2 | chuỗi | một trong sáu mã lĩnh vực ở mục 5 |
| 3 | chuỗi | các lá nối bằng dấu phẩy, **đúng thứ tự vị trí**; thêm `!` sau slug là lá ngược |
| 4 | số | mốc thời gian rút, `Date.now()` |

Thiếu phần tử nào cũng thành mã hỏng và bị trả 400. Hàm sinh mã:

```js
function encodeReadingId({ spread, question, topic, cards, at = Date.now() }) {
  const packed = [
    spread,
    question,
    topic,
    cards.map((c) => `${c.slug}${c.reversed ? "!" : ""}`).join(","),
    at,
  ];
  return Buffer.from(JSON.stringify(packed), "utf8").toString("base64url");
}
```

Ví dụ đã chạy qua bộ giải mã của backend:

```js
encodeReadingId({
  spread: "ba-la-thoi-gian",
  question: "Chuyện đi làm của mình mấy tháng tới ra sao",
  topic: "work",
  cards: [
    { slug: "at-gay", reversed: false },
    { slug: "nguoi-treo-nguoc", reversed: true },
    { slug: "sau-tien", reversed: false },
  ],
  at: 1757462400000,
});
// WyJiYS1sYS10aG9pLWdpYW4iLCJDaHV54buHbiDEkWkgbMOgbSBj4bunYSBtw6xuaCBt4bqleSB0
// aMOhbmcgdOG7m2kgcmEgc2FvIiwid29yayIsImF0LWdheSxuZ3VvaS10cmVvLW5ndW9jISxzYXUt
// dGllbiIsMTc1NzQ2MjQwMDAwMF0
```

Mã này **không phải mã hoá**: ai cầm được `id` đều bung ra đọc được câu hỏi, và
đều gọi `GET` lấy được bài. Câu hỏi riêng tư thì đừng để `id` ra chỗ công khai.

## 4. Mười lăm kiểu trải

Bảng dưới in ra cho tiện tra; bản luôn đúng thì gọi `GET /api/spreads` (mục 6),
ở đó mỗi kiểu trải còn có mô tả, cách rút, câu hỏi hợp và không hợp, ý nghĩa
từng vị trí, luật đọc và bài mẫu.

Số lá phải khớp cột `Số lá`, và thứ tự lá trong `id` phải theo đúng thứ tự vị trí
liệt kê ở cột cuối.

| Slug | Số lá | Lĩnh vực mặc định | Vị trí, theo thứ tự |
|---|---|---|---|
| `mot-la-hom-nay` | 1 | general | Lá hôm nay |
| `co-hay-khong` | 1 | general | Lá trả lời |
| `ba-la-thoi-gian` | 3 | general | Quá khứ / Hiện tại / Tương lai gần |
| `ba-la-tinh-huong` | 3 | general | Tình huống / Trở ngại / Lời khuyên |
| `ba-la-giua-hai-nguoi` | 3 | love | Bạn / Người kia / Giữa hai người |
| `ba-la-nhin-lai-minh` | 3 | mind | Bạn lúc này / Cái bạn đang tránh nhìn / Cái nên nuôi |
| `bon-la-tien-bac` | 4 | money | Tình hình hiện tại / Nguyên nhân hoặc thói quen / Cái nên giữ hoặc bỏ / Hướng đi |
| `nam-la-tinh-cam` | 5 | love | Bạn trong chuyện này / Người kia trong chuyện này / Cái đang nối hai người / Cái đang cản / Hướng đi |
| `nam-la-cong-viec` | 5 | work | Chỗ đứng hiện tại / Điểm mạnh đang có / Cái đang cản / Người hoặc yếu tố bên ngoài / Hướng đi |
| `nam-la-chon-huong` | 5 | general | Gốc của phân vân / Hướng A / Hướng A dẫn tới đâu / Hướng B / Hướng B dẫn tới đâu |
| `nam-la-thang-toi` | 5 | general | Tuần đầu / Tuần hai / Tuần ba / Tuần cuối / Chủ đề của tháng |
| `bay-la-mong-ngua` | 7 | general | Quá khứ / Hiện tại / Cái còn khuất / Cái đang cản / Người và hoàn cảnh xung quanh / Việc nên làm / Kết cục nếu giữ đà |
| `bay-la-tuan-nay` | 7 | general | Ngày đầu → Ngày cuối |
| `thap-tu-celtic` | 10 | general | Hoàn cảnh / Cái cắt ngang / Gốc rễ / Quá khứ gần / Trên đầu / Tương lai gần / Bản thân người hỏi / Xung quanh / Hy vọng và nỗi sợ / Kết cục nếu giữ đà |
| `muoi-hai-la-nam-toi` | 12 | general | Tháng thứ nhất → Tháng thứ mười hai |

`co-hay-khong` là kiểu trải duy nhất trả lời có/không. `thap-tu-celtic` có một
luật riêng, xem bẫy số 4 ở mục 8.

## 5. Lĩnh vực và bộ bài

Sáu mã lĩnh vực, dùng nguyên văn: `love`, `work`, `money`, `mind`, `study`,
`general`. Mã này quyết định lăng kính đọc lá, sai một chữ là bài mất lăng kính
mà không có lỗi nào báo.

Slug lá là tên tiếng Việt không dấu, **không phải** mã kiểu `major_00`. Cần cả
nội dung lá — nghĩa, từ khoá, ảnh — thì gọi `GET /api/cards` (mục 6). Chỉ cần
đúng danh sách slug để rút bài thì sinh bằng công thức, khỏi gọi mạng:

```js
const MAJORS = [
  "ke-kho", "phap-su", "nu-tu-te", "nu-hoang", "hoang-de", "giao-hoang",
  "tinh-nhan", "co-xe", "suc-manh", "an-si", "banh-xe-so-phan", "cong-ly",
  "nguoi-treo-nguoc", "than-chet", "tiet-che", "ac-quy", "toa-thap",
  "ngoi-sao", "mat-trang", "mat-troi", "phan-xet", "the-gioi",
];
const RANKS = [
  "at", "hai", "ba", "bon", "nam", "sau", "bay", "tam", "chin", "muoi",
  "tieu-dong", "hiep-si", "hoang-hau", "vua",
];
const SUITS = ["gay", "coc", "kiem", "tien"];

const DECK = [
  ...MAJORS,
  ...SUITS.flatMap((suit) => RANKS.map((rank) => `${rank}-${suit}`)),
]; // đúng 78 lá
```

Bảng tra tên, nếu app của bạn cần hiển thị:

| Mã | Slug | Tên |
|---|---|---|
| major_00 | `ke-kho` | Kẻ Khờ |
| major_01 | `phap-su` | Pháp Sư |
| major_02 | `nu-tu-te` | Nữ Tư Tế |
| major_03 | `nu-hoang` | Nữ Hoàng |
| major_04 | `hoang-de` | Hoàng Đế |
| major_05 | `giao-hoang` | Giáo Hoàng |
| major_06 | `tinh-nhan` | Tình Nhân |
| major_07 | `co-xe` | Cỗ Xe |
| major_08 | `suc-manh` | Sức Mạnh |
| major_09 | `an-si` | Ẩn Sĩ |
| major_10 | `banh-xe-so-phan` | Bánh Xe Số Phận |
| major_11 | `cong-ly` | Công Lý |
| major_12 | `nguoi-treo-nguoc` | Người Treo Ngược |
| major_13 | `than-chet` | Thần Chết |
| major_14 | `tiet-che` | Tiết Chế |
| major_15 | `ac-quy` | Ác Quỷ |
| major_16 | `toa-thap` | Toà Tháp |
| major_17 | `ngoi-sao` | Ngôi Sao |
| major_18 | `mat-trang` | Mặt Trăng |
| major_19 | `mat-troi` | Mặt Trời |
| major_20 | `phan-xet` | Phán Xét |
| major_21 | `the-gioi` | Thế Giới |

| Bậc | Gậy | Cốc | Kiếm | Tiền |
|---|---|---|---|---|
| Át | `at-gay` | `at-coc` | `at-kiem` | `at-tien` |
| 2 | `hai-gay` | `hai-coc` | `hai-kiem` | `hai-tien` |
| 3 | `ba-gay` | `ba-coc` | `ba-kiem` | `ba-tien` |
| 4 | `bon-gay` | `bon-coc` | `bon-kiem` | `bon-tien` |
| 5 | `nam-gay` | `nam-coc` | `nam-kiem` | `nam-tien` |
| 6 | `sau-gay` | `sau-coc` | `sau-kiem` | `sau-tien` |
| 7 | `bay-gay` | `bay-coc` | `bay-kiem` | `bay-tien` |
| 8 | `tam-gay` | `tam-coc` | `tam-kiem` | `tam-tien` |
| 9 | `chin-gay` | `chin-coc` | `chin-kiem` | `chin-tien` |
| 10 | `muoi-gay` | `muoi-coc` | `muoi-kiem` | `muoi-tien` |
| Tiểu đồng | `tieu-dong-gay` | `tieu-dong-coc` | `tieu-dong-kiem` | `tieu-dong-tien` |
| Hiệp sĩ | `hiep-si-gay` | `hiep-si-coc` | `hiep-si-kiem` | `hiep-si-tien` |
| Hoàng hậu | `hoang-hau-gay` | `hoang-hau-coc` | `hoang-hau-kiem` | `hoang-hau-tien` |
| Vua | `vua-gay` | `vua-coc` | `vua-kiem` | `vua-tien` |

## 6. Endpoint

Mọi request đều cần `x-api-key`. Đường `POST` cần thêm
`content-type: application/json`, và nên có `x-client-ip` (mục 7).

Bốn đường đầu là bói bài. Bốn đường cuối chỉ trả dữ liệu, không đụng mô hình.

### POST /api/readings — viết bài luận

```json
{ "id": "WyJiYS1sYS10aG9pLWdpYW4iLC..." }
```

200:

```json
{
  "essay": "Bàn bài này đang nói về ...",
  "parts": {
    "toanCanh": "...",
    "theoViTri": [{ "stt": 1, "doan": "..." }],
    "ket": "..."
  },
  "followUps": [],
  "clarifiers": [],
  "cached": false
}
```

`essay` là bài liền mạch, `parts` là chính bài đó tách theo vị trí để app xếp
từng đoạn dưới từng lá. `parts` có thể là `null`, xem bẫy số 3.

Lượt gọi lại cùng `id` trả y hệt nhưng `cached: true`, không tốn lượt mô hình.

### GET /api/readings/:id — lấy bài đã lưu

Không sinh bài mới, không tốn lượt mô hình. Chưa có bài thì **404**.

```json
{
  "essay": "...",
  "parts": { "toanCanh": "...", "theoViTri": [], "ket": "..." },
  "followUps": [{ "question": "...", "answer": "..." }],
  "clarifiers": [{ "stt": 2, "slug": "sau-coc", "reversed": false, "answer": "..." }],
  "createdAt": "2026-09-10T04:12:33.201Z"
}
```

### POST /api/readings/:id/follow-ups — hỏi thêm

```json
{ "question": "Vậy mình nên nói trước hay đợi bên kia nói" }
```

Câu hỏi bị cắt còn 200 ký tự. Tối đa **3 câu** cho mỗi bài; câu thứ tư trả 429
kèm `reason: "limit"`. Bài phải tồn tại trước, chưa `POST /api/readings` thì 404.

```json
{ "answer": "...", "followUps": [{ "question": "...", "answer": "..." }] }
```

### POST /api/readings/:id/clarifiers — rút lá làm rõ

Lá làm rõ do app bạn rút từ phần cỗ còn lại, backend chỉ đọc chứ không tự bốc.

```json
{ "stt": 2, "slug": "sau-coc", "reversed": false }
```

`stt` là số thứ tự vị trí trên bàn, đếm từ 1. Tối đa **2 lá** mỗi bài và mỗi vị
trí chỉ được một lá. Trả 400 nếu `stt` không có trong kiểu trải, slug không có
thật, hoặc lá đó **đã nằm trên bàn** — lá đã rút thì không phải lá làm rõ.

```json
{ "clarifiers": [{ "stt": 2, "slug": "sau-coc", "reversed": false, "answer": "..." }] }
```

### GET /api/spreads — mười lăm kiểu trải

Trả nguyên phần kiểu trải của KB, thêm `slug` là cái dùng trong mã bài đọc:

```json
{
  "spreads": [
    {
      "id": "ba_la_thoi_gian",
      "slug": "ba-la-thoi-gian",
      "ten_vi": "Ba lá quá khứ, hiện tại, tương lai gần",
      "ten_en": "Past Present Future",
      "nhom": "co_ban",
      "so_la": 3,
      "mo_ta": "...",
      "hop_voi": ["..."],
      "khong_hop_voi": ["..."],
      "cach_rut": "...",
      "vi_tri": [{ "stt": 1, "ten": "Quá khứ", "cau_hoi": "...", "goi_y_doc": "...", "lang_kinh_uu_tien": "..." }],
      "luat_doc": ["..."],
      "do_dai": { "min": 220, "max": 300 },
      "vi_du": [{ "cau_hoi": "...", "bai_luan": "..." }]
    }
  ]
}
```

`GET /api/spreads/:slug` trả đúng một kiểu trải, 404 nếu không có.

### GET /api/cards — bộ 78 lá

Trả nguyên phần lá của KB, thêm `slug` và `anh`:

```json
{
  "cards": [
    {
      "id": "cup_03",
      "slug": "ba-coc",
      "anh": "https://www.tarot24.online/cards/cup_03.webp",
      "ten_vi": "Ba Cốc",
      "ten_en": "Three of Cups",
      "arcana": "phu",
      "so": 3,
      "chat": "cup",
      "hoang_gia": false,
      "bieu_tuong": ["..."],
      "cot_loi": "...",
      "tu_khoa_xuoi": ["..."],
      "tu_khoa_nguoc": ["..."],
      "canh_bao": "...",
      "nguyen_to": "thuy",
      "chiem_tinh_gd": "Sao Thuỷ ở Cự Giải",
      "chiem_tinh_hd": null,
      "sac_thai": { "trong_luong": "rất nhẹ", "dong_tinh": "động vừa", "huong": "nâng lên cùng nhau" },
      "lang_kinh": { "tinh_cam": "...", "cong_viec": "...", "tien_bac": "...", "tam_ly": "...", "hoc_hanh": "..." },
      "cach_noi_viet": ["vui như Tết", "..."]
    }
  ]
}
```

`GET /api/cards/:slug` trả đúng một lá, 404 nếu không có.

Ảnh đặt tên theo `id` chứ không theo `slug`, và nằm trên web chứ không trên
backend — cứ dùng nguyên chuỗi trong trường `anh`.

**Về kích thước và cache.** `/api/cards` khoảng 270KB, `/api/spreads` khoảng
120KB. Cả hai gắn `cache-control: public, max-age=3600` và ETag, nên nhớ ETag
rồi gửi lại kèm `if-none-match` thì lần sau chỉ tốn một **304** không thân. Đừng
gọi mỗi lượt bói: nạp một lần lúc khởi động rồi giữ trong bộ nhớ, hoặc đồng bộ
theo giờ. Hai đường này không đụng mô hình nên không tính vào trần lượt gọi và
không qua bộ đếm 30 lượt/giờ.

## 7. Giới hạn, thời gian chờ, mã lỗi

**`x-client-ip` gần như bắt buộc.** Backend đếm 30 lượt mỗi giờ theo IP. App của
bạn gọi từ máy chủ nên backend chỉ thấy đúng một IP; không khai IP người dùng
cuối thì 30 lượt/giờ đó là trần của **cả ứng dụng bạn**, không phải của mỗi
người. Gửi kèm:

```
x-client-ip: 113.22.x.x
```

Backend tin header này không hỏi lại, vì nó tin bên cầm khoá. Nên đừng để người
dùng cuối tự đặt được giá trị đó — lấy IP ở tầng ngoài cùng của bạn rồi mới
chuyển tiếp.

**Thời gian.** Một bài luận mất 8–15 giây, có lúc lâu hơn khi nhà mô hình chậm.
Đặt timeout phía bạn khoảng 90 giây; nginx trước backend cắt ở 120 giây. Hỏi
thêm và lá làm rõ nhanh hơn, cỡ 3–6 giây.

| Mã | Thân | Nghĩa |
|---|---|---|
| 400 | `Thiếu mã bài đọc` / `Mã bài đọc không hợp lệ` | `id` rỗng, không giải mã được, hoặc kiểu trải không có thật |
| 400 | `Thiếu câu hỏi` / `Vị trí hoặc lá làm rõ không hợp lệ` | thân request sai |
| 403 | — | thiếu hoặc sai `x-api-key` |
| 404 | `Chưa có bài đọc cho mã này` | chưa từng `POST /api/readings` với `id` đó |
| 429 | `{ message, retryAfter }` | quá 30 lượt/giờ cho IP đó, `retryAfter` tính bằng giây |
| 429 | `{ reason: "limit", max }` | quá 3 câu hỏi thêm hoặc quá 2 lá làm rõ |
| 429 | `{ reason: "over-budget" }` | hết trần riêng của khoá bạn, hoặc hết trần tổng của cả hệ thống trong ngày |
| 502 | `{ reason: "error" }` | nhà mô hình lỗi hoặc quá hạn chờ |
| 200 | `{ essay: null, reason: "no-provider" }` | backend chưa cấu hình mô hình. Là 200 chứ không phải lỗi |

Hai trường hợp cuối nên có đường lui ở phía bạn: giữ bàn bài đã rút và nói bài
luận đang không viết được, thay vì báo hỏng cả lượt bói.

## 8. Bảy chỗ hay dính

1. **Slug lá sai không báo lỗi.** Lá không tra được bị loại im lặng, bài viết
   thiếu hẳn vị trí đó mà request vẫn 200. Đối chiếu với `DECK` ở mục 5 trước khi
   sinh `id`.
2. **Số lá phải khớp.** Thừa thì backend cắt bớt theo số vị trí, thiếu thì bài
   hụt vị trí. Cả hai đều không có lỗi nào báo.
3. **`parts` có thể `null`** với bài cũ hoặc khi mô hình trả sai khuôn. Luôn có
   nhánh dựng giao diện từ `essay` thuần.
4. **Thập tự Celtic, lá thứ hai nằm ngang.** Lá ở vị trí 2 không có chiều, rút ra
   ngược vẫn đọc xuôi — đặt `reversed: false` cho nó. Backend không sửa hộ.
5. **Chủ đề chuyển hướng.** Câu hỏi chạm bệnh tật, sinh tử, thai sản, kiện tụng,
   hay chuyện xuống tiền đầu tư thì bài tự đổi giọng: không phán, không kết luận,
   chỉ nói về tâm thế người hỏi. Đó là đúng thiết kế, đừng bắt lỗi.
6. **Không có tầng người dùng.** Backend không biết ai là ai, `id` là tất cả.
   Ghép `id` với tài khoản người dùng ở phía bạn.
7. **Lá ngược sinh ở đâu là việc của bạn.** Backend nhận sao dùng vậy. Tarot24
   để khoảng 32% lá ngược khi xào máy; bạn tự chọn tỉ lệ của mình.

## 9. Một lượt gọi đầy đủ

```js
const BASE = "https://api.tarot24.online";
const KEY = process.env.TAROT24_API_KEY;

/** Rút n lá khác nhau từ cỗ 78, kèm chiều. */
function rutBai(n, uprightOnly = []) {
  const con = [...DECK];
  const ra = [];
  for (let i = 0; i < n; i++) {
    const k = Math.floor(Math.random() * con.length);
    const [slug] = con.splice(k, 1);
    ra.push({ slug, reversed: !uprightOnly.includes(i) && Math.random() < 0.32 });
  }
  return ra;
}

async function goi(path, body, clientIp) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": KEY,
      "x-client-ip": clientIp,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(90_000),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw Object.assign(new Error(`tarot24 ${res.status}`), { status: res.status, data });
  return data;
}

/* Một lượt bói: ba lá thời gian, chuyện công việc. */
const cards = rutBai(3);
const id = encodeReadingId({
  spread: "ba-la-thoi-gian",
  question: "Chuyện đi làm của mình mấy tháng tới ra sao",
  topic: "work",
  cards,
});

const bai = await goi("/api/readings", { id }, "113.22.1.1");
console.log(bai.essay);

/* Hỏi thêm, tối đa ba lần. */
const them = await goi(`/api/readings/${id}/follow-ups`, { question: "Mình nên nói trước hay đợi" }, "113.22.1.1");
console.log(them.answer);

/* Lá làm rõ cho vị trí 3, rút từ phần cỗ chưa dùng. */
const conLai = DECK.filter((s) => !cards.some((c) => c.slug === s));
const them2 = conLai[Math.floor(Math.random() * conLai.length)];
await goi(`/api/readings/${id}/clarifiers`, { stt: 3, slug: them2, reversed: false }, "113.22.1.1");
```

Lưu `id` lại. Lần sau người dùng mở lại bài đó thì `GET /api/readings/${id}` là
đủ, không tốn lượt mô hình của ai cả.

## 10. Kiểm nhanh trước khi nối

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://api.tarot24.online/api/health
# 403 — cả health cũng đòi khoá; nhận được 403 tức là đường đi tới backend đã thông

curl -s -H "x-api-key: $TAROT24_API_KEY" https://api.tarot24.online/api/health
# {"ok":true,"database":true,"llm":true,"spread":true,"luot":{"ngay":"...","dem":13,"tran":1000}}

curl -s -X POST https://api.tarot24.online/api/readings \
  -H 'content-type: application/json' -H "x-api-key: $TAROT24_API_KEY" \
  -H 'x-client-ip: 113.22.1.1' \
  -d '{"id":"x"}'
# {"message":"Mã bài đọc không hợp lệ",...} — khoá đúng, mã sai, tức là đã thông
```

`llm: false` ở health nghĩa là backend chưa cấu hình mô hình, mọi lượt luận bài
sẽ trả `reason: "no-provider"`. `dem` sát `tran` nghĩa là hôm nay sắp hết lượt
chung.
