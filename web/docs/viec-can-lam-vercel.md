# Việc cần làm: thêm biến môi trường cho Vercel

Ghi ngày 09/09/2026. Backend đã đứng sau `https://api.tarot24.online` và chạy
tốt. Web đã lên Vercel ở `www.tarot24.online`. **Chưa đặt biến môi trường nào
bên Vercel** — đó là toàn bộ việc còn lại của lần chuyển tên miền này.

## Hiện đang hỏng cái gì

Chưa có biến thì site vẫn lên trang, nhưng:

| Triệu chứng | Nguyên nhân |
|---|---|
| Rút bài xong **không ra bài luận** | `API_BASE_URL` và `API_KEY` trống → `hasBackend()` trả false → `/api/reading` trả `{"essay":null,"reason":"no-backend"}`. Đây là hỏng nặng nhất, tính năng chính của site coi như chết |
| Hỏi thêm không trả lời | cùng lý do, `/api/reading/hoi-them` trả `reason:"no-backend"` |
| Canonical, `og:url`, sitemap đều ghi **`tarrot24.online`** | `NEXT_PUBLIC_SITE_URL` trống → rơi về mặc định cứng trong `src/lib/site.ts`. Google đang thấy tên miền mới trỏ ngược về tên miền gõ nhầm |
| `/soat` trả 404 | `REVIEW_USER`/`REVIEW_PASS` trống. Cái này **đúng ý đồ**, không phải lỗi — chỉ đặt khi cần soát nội dung |

## Cách làm

Vercel → Project → **Settings → Environment Variables** → môi trường
**Production** (tick thêm Preview nếu muốn bản preview cũng gọi được backend):

| Biến | Giá trị | Bắt buộc |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://www.tarot24.online` | ✅ |
| `API_BASE_URL` | `https://api.tarot24.online` | ✅ |
| `API_KEY` | lấy trong `web/.env.local` ở Mac Mini, phải khớp `API_KEY` trong `/var/www/tarot24-backend/.env` trên VPS | ✅ |
| `API_TIMEOUT_MS` | `180000` — một lượt luận bài mất 15–60 giây, trải mười lá có thể gấp đôi nếu bộ soát đòi viết lại | ✅ |
| `RATE_READINGS_PER_HOUR` | `24` | tuỳ |
| `RATE_FOLLOWUPS_PER_HOUR` | `30` | tuỳ |
| `REVIEW_USER` / `REVIEW_PASS` | lấy trong `web/.env.local` | chỉ khi muốn mở `/soat` |
| `NEXT_PUBLIC_GA_ID` | `G-LZLMGNL8SJ` — đã có mặc định cứng trong `src/lib/site.ts`, đặt biến chỉ để đổi hoặc để tắt | tuỳ |

Giá trị thật nằm ở `web/.env.local` trên Mac Mini. Tệp đó gitignore — **đừng
commit, đừng dán khoá vào chat**.

### Biến `NEXT_PUBLIC_*` phải để loại Config, không phải Secret

Lưu một biến `NEXT_PUBLIC_*` dạng Secret thì Vercel chặn, đúng câu này:

> Remove the public framework prefix to keep this value private. Public
> prefixes expose values to the browser. If that's safe, change the variable
> to Config.

Nó nói đúng: tiền tố `NEXT_PUBLIC_` nghĩa là giá trị được nướng thẳng vào JS
gửi xuống trình duyệt, giấu không nổi. Với `NEXT_PUBLIC_SITE_URL` và
`NEXT_PUBLIC_GA_ID` thì lộ cũng chẳng sao — tên miền và mã đo vốn nằm sẵn
trong HTML mọi trang. Chọn **Config**. Còn `API_KEY` thì ngược lại: nó không
có tiền tố ấy, chỉ chạy phía máy chủ, và phải để **Secret**.

## Xong rồi phải deploy lại

`NEXT_PUBLIC_SITE_URL` được nướng vào lúc `next build`. Đặt biến mà không
deploy lại thì canonical, `og:url` và sitemap vẫn giữ giá trị cũ — đã dính một
lần rồi, đừng dính lần nữa.

Vercel → Deployments → bản mới nhất → **Redeploy**, và **bỏ tick**
"Use existing Build Cache".

## Soát sau khi deploy

```bash
# 1. Canonical phải là www.tarot24.online, không còn tarrot24
curl -s https://www.tarot24.online/ | grep -o 'rel="canonical" href="[^"]*"'
curl -s https://www.tarot24.online/robots.txt | grep Sitemap
curl -s https://www.tarot24.online/sitemap.xml | head -3

# 2. Backend còn sống
curl -s https://api.tarot24.online/api/health
```

Rồi mở trình duyệt rút một bài thật — phải ra bài luận chứ không phải bản
dựng tạm. Đây là phép thử duy nhất chứng minh `API_KEY` khớp giữa hai bên. Sai
khoá thì backend trả 403, web nhận `reason:"backend-error"` và hiện ô "Chưa
luận được bài" kèm nút xin lại; chữ bên dưới ô đó là bản dựng tạm từ dữ liệu
lá, không phải bài luận.

Hỏi thêm một câu nữa, và mở một trang `/doc/<id>` xem ảnh OG có hiện không.

## Sau đó mới tới dọn tarrot24

Xem mục 5 trong [`deploy.md`](./deploy.md). Thứ tự quan trọng: chỉ dọn tunnel ở
Mac Mini **sau khi** đã xác nhận web trên Vercel chạy đủ cả đường luận bài.
