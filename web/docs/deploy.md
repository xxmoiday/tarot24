# Đưa Tarot24 lên www.tarot24.online

Web chạy trên Vercel, backend chạy trên VPS Vultr. Mac Mini không còn phục vụ
gì cho production — tunnel và tiến trình web ở đó đã gỡ, xem mục 5.

| Thành phần | Ở đâu | Tên miền |
|---|---|---|
| Web (Next.js) | Vercel, root directory `web/` | `www.tarot24.online` (chính), `tarot24.online` → 308 sang www |
| Backend (NestJS) | VPS Vultr `45.76.161.193`, PM2 `tarot24-backend` | `api.tarot24.online` |
| DNS | Namecheap BasicDNS (`dns1/dns2.registrar-servers.com`) | zone `tarot24.online` |

Trình duyệt **không bao giờ** gọi thẳng backend: `src/lib/api.ts` là
`server-only`, mọi lượt đi qua route handler của Next rồi mới sang VPS. Vì vậy
`CORS_ORIGINS` bên backend không nằm trên đường đi thật — nó chỉ là hàng rào
phòng khi có ai gọi từ trình duyệt.

## 1. DNS ở Namecheap

Domain List → Manage → **Advanced DNS**:

| Type | Host | Value | Ghi chú |
|---|---|---|---|
| A | `@` | giá trị Vercel hiện ra | Vercel đang cấp `216.150.1.1` |
| CNAME | `www` | giá trị Vercel hiện ra | dạng `<hash>.vercel-dns-016.com` |
| A | `api` | `45.76.161.193` | trỏ thẳng nginx trên VPS |

Dùng đúng giá trị Vercel hiện trong **Settings → Domains**, đừng chép cứng ở
đây — Vercel có đổi IP anycast theo thời gian.

## 2. Biến môi trường trên Vercel

> **Chưa đặt biến nào (09/09/2026).** Rút bài ngoài production hiện không
> ra bài luận. Xem [`viec-can-lam-vercel.md`](./viec-can-lam-vercel.md).

Project Settings → Environment Variables, môi trường **Production**:

| Biến | Giá trị |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://www.tarot24.online` |
| `API_BASE_URL` | `https://api.tarot24.online` |
| `API_KEY` | đúng khoá trong `/var/www/tarot24-backend/.env` trên VPS |
| `REVIEW_USER` / `REVIEW_PASS` | chặn trang `/soat`; **không đặt là `/soat` trả 404**, đúng ý đồ |
| `RATE_READINGS_PER_HOUR` | tuỳ, mặc định 12 |
| `RATE_FOLLOWUPS_PER_HOUR` | tuỳ, mặc định 30 |
| `API_TIMEOUT_MS` | tuỳ, một lượt luận bài mất 6–15 giây |

`NEXT_PUBLIC_SITE_URL` được **nướng vào lúc build**. Đổi biến xong mà không
deploy lại thì canonical, `og:url` và sitemap vẫn giữ giá trị cũ — đã dính một
lần rồi. Chưa đặt biến thì mã rơi về mặc định cứng ở `src/lib/site.ts`.

Lấy giá trị từ `web/.env.local`. Tệp đó gitignore, đừng commit.

## 3. Deploy

```bash
npm i -g vercel
vercel login
cd /Users/ddyuh/Projects/tarrot24/web
vercel link            # root directory là web/, không phải gốc kho
vercel                 # bản preview, ra link *.vercel.app
```

Trên link preview soát đủ trước khi `vercel --prod`:

- rút một bài thật, xem có ra bài luận không (đây là đường đi qua backend VPS)
- hỏi thêm một câu
- mở một trang `/la-bai/<slug>` và `/doc/<id>`, xem **ảnh OG** có hiện không
- `/soat` phải hỏi mật khẩu

### Hai chỗ từng hỏng trên Vercel, đừng bỏ khi refactor

- `outputFileTracingIncludes` trong `next.config.ts` — không khai thì
  `data/system_luan_bai.md` và cả ba ảnh OG không được đóng gói vào function
- ảnh OG đọc `data/og-cards/*.jpg` dựng sẵn, **không** đọc `public/cards/*.webp`
  lúc chạy, vì `public` do CDN phục vụ chứ không nằm trong bundle

## 4. Kiểm sau khi lên

```bash
curl -sI https://www.tarot24.online/ | head -1
curl -s  https://www.tarot24.online/ | grep -o 'rel="canonical" href="[^"]*"'
curl -s  https://www.tarot24.online/robots.txt
curl -s  https://www.tarot24.online/sitemap.xml | head -3
curl -s  https://api.tarot24.online/api/health
```

Canonical, `Sitemap:` trong robots và `<loc>` trong sitemap đều phải là
`www.tarot24.online`. Rồi dán một link `/doc/<id>` vào Zalo xem ảnh OG có hiện
đúng mấy lá không.

## 5. Dọn tên miền cũ tarrot24.online

Tên miền gõ nhầm, chưa từng quảng bá nên không có gì để giữ cho SEO.

**Đã dọn xong ở Mac Mini (09/09/2026):**

- `pm2 delete tarot24 tarot24-tunnel`, và gỡ khỏi `~/.pm2/dump.pm2` bằng cách
  sửa thẳng tệp (30 → 28 app). **Không chạy `pm2 save`** — máy này có app đang
  tắt chủ đích, lệnh đó ghi đè từ trạng thái đang chạy nên sẽ xoá mất chúng.
  Sao lưu: `~/.pm2/dump.pm2.truoc-don-web`
- `cloudflared tunnel delete tarot24` (id `15808c1b-…`), xoá
  `config-tarot24.yml` và tệp credential. Sao lưu:
  `~/.cloudflared/luu-tarot24-cu/`
- Bốn tunnel còn lại (hocvuiai, openclaw-gateway, taohinhanh, thuchiai) không
  đụng tới

`https://tarrot24.online` giờ trả 530 — đúng, bản ghi Cloudflare còn trỏ vào
tunnel đã xoá.

**Đã dọn xong trên VPS (09/09/2026):**

- xoá nginx site `api.tarrot24.online` (sao lưu `/root/luu-tarot24-cu/`)
- `certbot delete --cert-name api.tarrot24.online`
- tám cert và tám site của dự án khác trên máy không đụng tới

**Còn lại, làm lúc nào cũng được:** xoá zone `tarrot24.online` ở Cloudflare,
thôi gia hạn tên miền, và xoá hai bản ghi rác trong zone `taohinhanh.online`.

Giữ lại kho mã ở `~/Projects/tarrot24` (thư mục vẫn mang tên cũ, không sao) để
còn dev và để chạy `npm run deploy:vps` cho backend.

## 6. Việc còn lại

- **`src/lib/rate-limit.ts` đếm trong bộ nhớ tiến trình.** Vercel chạy nhiều
  instance nên mỗi cái đếm riêng, giới hạn thành ra nhân lên theo số instance
  mà **không báo lỗi gì**. Hàng rào thật hiện là `RATE_PER_HOUR` bên backend
  (đếm theo `x-client-ip`), nhưng nên thay bằng Upstash Redis:

  ```bash
  vercel integration add upstash
  npm i @upstash/redis @upstash/ratelimit
  ```

  Viết lại `rateLimit()` bằng `Ratelimit.slidingWindow`, giữ nguyên chữ ký hàm
  (`key, max, windowMs` → `{ ok, retryAfter }`) thì hai route gọi nó không phải
  sửa gì.
- Xoá hai bản ghi rác trong zone **taohinhanh.online**:
  `tarrot24.online.taohinhanh.online` và `www.tarrot24.online.taohinhanh.online`
  (tạo nhầm hôm dựng tunnel, vì `cert.pem` chỉ có phạm vi zone đó)
- Soát nội dung ở `/soat` trước khi quảng bá
- Xoay khoá DeepSeek và đổi mật khẩu root VPS — cả hai từng gõ trong chat
- Google Search Console: thêm tài sản `www.tarot24.online`, nộp sitemap
- Ảnh lưng lá `back.webp`
