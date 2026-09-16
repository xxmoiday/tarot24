# Gợi ý kiểu trải từ câu hỏi

Một đường API duy nhất: đưa câu hỏi người dùng vừa gõ, nhận về ba kiểu trải hợp
nhất kèm lý do viết sẵn bằng tiếng Việt.

Đây chính là bộ luật mà tarot24.online dùng cho màn nhập câu hỏi, không phải bản
rút gọn. Trước đây nó chỉ chạy trong trình duyệt của web nên ứng dụng ngoài muốn
có màn gợi ý thì phải tự viết lại rồi tự giữ cho khỏi lệch; giờ hai bên gọi
chung một chỗ.

Phần còn lại của việc nối API — mã bài đọc, viết bài luận, hỏi thêm, lá làm rõ —
xem `INTEGRATION.md`.

## Nối vào đâu

| | |
|---|---|
| Gốc | `https://api.tarot24.online` |
| Đường | `POST /api/suggest-spreads` |
| Xác thực | header `x-api-key`, cùng khoá dùng cho mọi đường khác |
| Kiểu gọi | chỉ từ máy chủ sang máy chủ |

Thiếu khoá hoặc sai khoá thì trả **403**, như mọi đường khác của API này.

**Không gọi mô hình.** Toàn bộ là luật viết tay chạy trong bộ nhớ: không tốn
lượt, không tính vào trần lượt gọi mỗi ngày, không qua bộ đếm 30 lượt/giờ, trả
về trong vài mili giây. Gọi mỗi lần người dùng gõ thêm chữ cũng được.

Dùng `POST` chứ không `GET` vì câu hỏi là chuyện riêng của người ta: nhét vào
query string là nó nằm lại trong log truy cập và lịch sử trình duyệt.

**Không cần `x-client-ip` ở đường này.** Header đó để backend đếm 30 lượt/giờ
theo từng người, mà bộ đếm ấy chỉ gắn trên ba đường `/api/readings*`. Gửi kèm
cũng không sao, chỉ là thừa. Đừng lấy đoạn mẫu của `/api/readings` dùng lại ở
đây rồi tưởng là bắt buộc.

## Gọi thế nào

```json
POST /api/suggest-spreads
{ "question": "Nên nhận offer mới hay ở lại công ty cũ", "spread": "ba-la-thoi-gian" }
```

| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| `question` | không | câu hỏi nguyên văn; bỏ trống hoặc thiếu hẳn thì trả ba trải nhỏ mặc định |
| `spread` | không | slug kiểu trải người dùng **đang mở**; có thì mới tính được `better` |

Trả về cho đúng câu hỏi ở trên, chép nguyên từ một lượt gọi thật:

```json
{
  "suggestions": [
    {
      "slug": "nam-la-chon-huong",
      "ten_vi": "Năm lá chọn giữa hai hướng",
      "so_la": 5,
      "score": 6.8,
      "reason": "Câu hỏi đang cân giữa hai hướng, nên xem cả hai nhánh rồi so."
    },
    {
      "slug": "nam-la-cong-viec",
      "ten_vi": "Năm lá công việc",
      "so_la": 5,
      "score": 5.5,
      "reason": "Chuyện công việc, xem chỗ đứng và đường đi cùng lúc."
    },
    {
      "slug": "ba-la-tinh-huong",
      "ten_vi": "Ba lá tình huống, trở ngại, lời khuyên",
      "so_la": 3,
      "score": 2.6,
      "reason": "Hợp với cỡ câu hỏi bạn vừa gõ."
    }
  ],
  "vague": null,
  "topic": "work",
  "better": null
}
```

`vague` là `null` vì câu hỏi đã đủ rõ; `better` là `null` vì trải đang mở không
thua kiểu nào đủ xa để đáng mời đổi. Khi khác `null` chúng có dạng:

```json
"vague":  { "kind": "chung-chung", "label": "Câu hỏi còn chung chung", "hint": "..." }
"better": { "slug": "...", "ten_vi": "...", "so_la": 5, "score": 6.8, "reason": "..." }
```

- **`suggestions`** — luôn đúng ba cái, xếp theo độ hợp. `reason` viết sẵn để in
  thẳng dưới tên trải. Không đọc ra tín hiệu nào thì trả ba trải nhỏ mặc định
  chứ không trả mảng rỗng.
- **`vague`** — `null` khi câu hỏi đủ rõ. Khác `null` nghĩa là câu mơ hồ tới mức
  bài chỉ trả lời chung chung được; `hint` là câu nhắc viết sẵn. Đây là **lời
  nhắc chứ không phải cửa chặn** — người ta vẫn rút bài được như thường.
- **`topic`** — lĩnh vực đoán từ chính câu hỏi, dùng cho ô lĩnh vực trong mã bài
  đọc. `null` nghĩa là không đoán ra; đừng đoán bừa, cứ để mặc định của kiểu trải.
- **`better`** — chỉ khác `null` khi bạn gửi `spread` **và** có kiểu trải khác
  hợp hơn hẳn kiểu đang mở. Dùng để mời người ta đổi giữa chừng. Cách biệt chưa
  đủ xa thì trả `null`: nhắc sai chỗ còn phiền hơn không nhắc.

`score` là số thực, chỉ để xếp thứ tự — đừng đem ra so với ngưỡng nào ở phía bạn,
thang điểm có thể đổi.

## Một lượt dùng thật

```js
async function goiY(body) {
  const res = await fetch("https://api.tarot24.online/api/suggest-spreads", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.TAROT24_API_KEY,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`tarot24 ${res.status}`);
  return res.json();
}

const { suggestions, vague, topic } = await goiY({ question: cauHoiNguoiDungVuaGo });

/* Ba thẻ kiểu trải cho người ta chọn, lý do in thẳng dưới tên. */
for (const s of suggestions) {
  console.log(`${s.ten_vi} (${s.so_la} lá) — ${s.reason}`);
}

/* Câu hỏi mơ hồ thì nhắc, nhưng vẫn cho rút như thường. */
if (vague) console.log(vague.label, "—", vague.hint);

/* Lĩnh vực đoán được thì đắp thẳng vào mã bài đọc, không đoán ra thì bỏ qua. */
const linhVuc = topic ?? "general";
```

Người dùng chọn xong kiểu trải thì quay về `INTEGRATION.md` mục 3 để sinh mã bài
đọc, rồi `POST /api/readings`.

## Mời đổi trải giữa chừng

Gửi kèm `spread` là slug kiểu trải người dùng **đang mở**, rồi đọc `better`:

```js
const { better } = await goiY({ question, spread: "ba-la-thoi-gian" });
if (better) {
  // "Câu này hợp <better.ten_vi> hơn — đổi không?"
}
```

`better` là `null` khi trải đang mở đã hợp nhất, **và cũng null khi cách biệt
chưa đủ xa**. Đó là chủ ý: nhắc sai chỗ còn phiền hơn không nhắc — đừng tự hạ
ngưỡng ở phía bạn bằng cách so `score`.

## Mã lỗi

| Mã | Thân | Nghĩa |
|---|---|---|
| 201 | kết quả | thành công — **201 chứ không phải 200**, như mọi `POST` của API này |
| 400 | `Câu hỏi phải là chuỗi` | `question` gửi lên không phải chuỗi |
| 400 | `Kiểu trải phải là chuỗi` | `spread` gửi lên không phải chuỗi |
| 400 | `Không có kiểu trải "..."` | `spread` không nằm trong mười lăm slug ở `INTEGRATION.md` mục 4 |
| 403 | — | thiếu hoặc sai `x-api-key` |

Câu hỏi rỗng, thiếu hẳn `question`, hay câu chẳng đọc ra tín hiệu nào đều **không
phải lỗi**: đường này luôn trả ba gợi ý.
