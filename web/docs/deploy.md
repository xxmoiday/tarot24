# Đưa Tarot24 lên tarrot24.online

Máy chủ là Mac Mini, ra ngoài bằng Cloudflare Tunnel, tiến trình do PM2 giữ.
Kho bài đọc ghi ra tệp nên **phải chạy một máy duy nhất**; muốn chạy nhiều nơi
thì đổi `src/lib/store.ts` sang Postgres trước.

## 1. Ứng dụng

```bash
cd ~/Projects/tarrot24/web
npm ci
npm run build
pm2 start ecosystem.config.cjs      # cổng 3111
```

Bí mật đọc từ `.env.local`, không commit:

```
LLM_PROVIDERS=deepseek
DEEPSEEK_API_KEY=...
DEEPSEEK_MODEL=deepseek-chat
NEXT_PUBLIC_SITE_URL=https://tarrot24.online
```

`NEXT_PUBLIC_SITE_URL` được nướng vào lúc `next build`, nên đổi tên miền là
phải build lại chứ không chỉ restart.

## 2. DNS

Tên miền mua ở Namecheap, phải chuyển nameserver sang Cloudflare thì
`cloudflared tunnel route dns` mới chạy được.

- Cloudflare → Add a site → `tarrot24.online` → gói Free
- Namecheap → Domain List → Manage → Nameservers → **Custom DNS**
- Dán đúng hai nameserver Cloudflare hiện cho zone đó
- Kiểm: `dig +short NS tarrot24.online` phải ra `*.ns.cloudflare.com`

## 3. Tunnel riêng cho Tarot24

Không dùng chung tunnel `hocvuiai` để hai dự án không kéo nhau xuống khi restart.

Tunnel đã tạo sẵn:

- tên `tarot24`, id `15808c1b-eb5e-49d6-9cdd-57e64af7a2c1`
- config `~/.cloudflared/config-tarot24.yml`, ingress trỏ `localhost:3111`
- chạy dưới PM2 tên `tarot24-tunnel`

### Cạm bẫy: cert.pem chỉ có phạm vi một zone

`~/.cloudflared/cert.pem` hiện chỉ cấp quyền cho zone `taohinhanh.online`
(zoneID `52c6f601…`). Vì vậy **không chạy được**:

```bash
cloudflared tunnel route dns tarot24 tarrot24.online   # SAI
```

Lệnh đó không báo lỗi mà lặng lẽ tạo bản ghi
`tarrot24.online.taohinhanh.online` trong zone taohinhanh. Muốn dùng lệnh này
cho zone mới thì phải `cloudflared tunnel login` lại và chọn zone đó.

### Cách trỏ DNS không cần đăng nhập lại

Vào Cloudflare dashboard, zone `tarrot24.online` → DNS → Records:

| Type  | Name | Target                                                   | Proxy |
|-------|------|----------------------------------------------------------|-------|
| CNAME | `@`  | `15808c1b-eb5e-49d6-9cdd-57e64af7a2c1.cfargotunnel.com`   | bật   |
| CNAME | `www`| `15808c1b-eb5e-49d6-9cdd-57e64af7a2c1.cfargotunnel.com`   | bật   |

Xoá trước bản ghi `A` mà Cloudflare nhập từ Namecheap (trỏ `192.64.119.189`),
nếu không sẽ ra lỗi 522.

## 4. Giữ sau khi khởi động lại máy

`tarot24` và `tarot24-tunnel` đã được thêm thẳng vào `~/.pm2/dump.pm2`, giữ
nguyên 9 app đang dừng thay vì chạy `pm2 save` (lệnh đó ghi đè từ trạng thái
đang chạy nên sẽ bỏ mất chúng). Bản sao lưu trước khi sửa nằm ở
`~/.pm2/dump.pm2.truoc-tarot24`.

Đã kiểm bằng cách xoá tiến trình rồi `pm2 resurrect`: app lên lại và trả 200.

## 5. Kiểm sau khi lên

```bash
curl -sI https://tarrot24.online | head -1
curl -s https://tarrot24.online/robots.txt
curl -s https://tarrot24.online/sitemap.xml | head -3
```

Rồi dán một link `/doc/<id>` vào Zalo xem ảnh OG có hiện đúng mấy lá không.


---

# Việc còn lại

Ghi ngày 08/09/2026. Backend đã lên VPS xong, chỉ còn ba việc dưới đây.
Thứ tự quan trọng: **A làm được ngay**, **B rồi mới tới C** — dọn Mac Mini
trước khi Vercel phục vụ được là web chết.

## A. Bật Always Use HTTPS ở Cloudflare

`http://tarrot24.online` hiện trả thẳng 200 chứ không chuyển hướng. Trình
duyệt Chrome tự nâng lên HTTPS nên nhìn thì tưởng xong, nhưng máy khách khác
(curl, bot, app trong máy) vẫn đi HTTP trần.

Đường đi trong dashboard:

1. <https://dash.cloudflare.com> → chọn tài khoản → chọn tên miền
   **tarrot24.online**
2. Thanh bên trái → **SSL/TLS** → **Edge Certificates**
3. Kéo tới **Always Use HTTPS** → gạt sang **On**

Nhân tiện ở **SSL/TLS → Overview**, đặt chế độ mã hoá là **Full (strict)**.
Không hại gì: `tarrot24.online` đi qua tunnel nên chế độ này không đụng tới
nó, còn `api.tarrot24.online` là bản ghi DNS-only trỏ thẳng vào nginx đang
có chứng chỉ Let's Encrypt thật.

Soát lại, phải thấy `301` và `location: https://...`:

```bash
curl -sI http://tarrot24.online/ | head -3
```

## B. Đưa web lên Vercel

### B1. Chỗ duy nhất còn vướng trong mã

`src/lib/rate-limit.ts` đếm lượt trong bộ nhớ tiến trình. Vercel chạy nhiều
instance nên mỗi cái đếm riêng, giới hạn thành ra nhân lên theo số instance
mà **không báo lỗi gì** — rất dễ bỏ sót. Thay bằng Upstash Redis:

```bash
vercel integration add upstash          # cần đăng nhập tài khoản, chủ dự án tự chạy
npm i @upstash/redis @upstash/ratelimit
```

Rồi viết lại `rateLimit()` bằng `Ratelimit.slidingWindow`. Giữ nguyên chữ ký
hàm (`key, max, windowMs` → `{ ok, retryAfter }`) thì hai route gọi nó
không phải sửa gì.

Kho bài đọc thì **không còn là vấn đề** — đã nằm ở Postgres trên VPS, web chỉ
gọi API. `src/lib/store.ts` ngày trước ghi tệp đã xoá rồi.

Hai chỗ từng hỏng trên Vercel đã sửa xong, đừng bỏ khi refactor:

- `outputFileTracingIncludes` trong `next.config.ts` — không khai thì
  `data/system_luan_bai.md` và cả ba ảnh OG không được đóng gói vào function
- ảnh OG đọc `data/og-cards/*.jpg` dựng sẵn, **không** đọc `public/cards/*.webp`
  lúc chạy, vì `public` do CDN phục vụ chứ không nằm trong bundle

### B2. Dựng project

```bash
npm i -g vercel                 # máy chưa có
vercel login
cd /Users/ddyuh/Projects/tarrot24/web
vercel link
```

Root directory của project là `web/`, không phải gốc kho.

### B3. Biến môi trường (Project Settings → Environment Variables, Production)

| Biến | Giá trị |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://tarrot24.online` |
| `API_BASE_URL` | `https://api.tarrot24.online` |
| `API_KEY` | **đúng khoá** đang nằm trong `/var/www/tarot24-backend/.env` trên VPS |
| `REVIEW_USER` / `REVIEW_PASS` | chặn trang `/soat`; **không đặt là `/soat` trả 404**, đúng ý đồ |
| `RATE_READINGS_PER_HOUR` | tuỳ, mặc định 12 |
| `RATE_FOLLOWUPS_PER_HOUR` | tuỳ |
| `API_TIMEOUT_MS` | tuỳ, một lượt luận bài mất 6–15 giây |

Lấy giá trị từ `web/.env.local` ở Mac Mini. Tệp đó gitignore, đừng commit.

### B4. Deploy thử rồi mới đổi DNS

```bash
vercel                          # bản preview, ra link *.vercel.app
```

Trên link preview phải soát đủ:

- rút một bài thật, xem có ra bài luận không (đây là đường đi qua backend VPS)
- hỏi thêm một câu
- mở một trang `/la-bai/<slug>` và `/doc/<id>`, xem **ảnh OG** có hiện không
- `/soat` phải hỏi mật khẩu

Xanh hết thì `vercel --prod`.

### B5. Đổi DNS sang Vercel

Nameserver đang ở Cloudflare, và `api.tarrot24.online` cũng nằm trong zone đó,
nên **cứ giữ DNS ở Cloudflare** cho đỡ phải dựng lại bản ghi api.

Trong Vercel: Project → **Settings → Domains** → thêm `tarrot24.online` và
`www.tarrot24.online`. Vercel sẽ hiện đúng bản ghi cần đặt (thường là A
`76.76.21.21` cho gốc và CNAME `cname.vercel-dns.com` cho `www`) — **dùng giá
trị Vercel hiện ra**, đừng chép cứng ở đây.

Sang Cloudflare → **DNS → Records**, sửa hai bản ghi `tarrot24.online` và
`www` (đang là CNAME trỏ vào `<id>.cfargotunnel.com`) thành giá trị Vercel,
và **tắt proxy — đám mây phải xám (DNS only)**. Bật proxy thì Vercel không
cấp được chứng chỉ, lại thành hai lớp CDN chồng nhau.

Giữ nguyên `api.tarrot24.online` — không đụng.

Chờ Vercel báo domain **Valid Configuration** và cấp xong chứng chỉ, rồi mới
sang mục C.

## C. Dọn frontend ở Mac Mini

**Chỉ làm sau khi `https://tarrot24.online` đã do Vercel phục vụ.** Kiểm bằng
header, Vercel sẽ có `x-vercel-id`:

```bash
curl -sI https://tarrot24.online/ | grep -i 'server\|x-vercel-id'
```

Rồi mới dọn:

```bash
# 1. Tắt hai tiến trình
pm2 delete tarot24 tarot24-tunnel

# 2. Gỡ khỏi danh sách khởi động lại. KHÔNG chạy `pm2 save` —
#    máy này có app đang tắt chủ đích, pm2 save sẽ xoá mất.
cp ~/.pm2/dump.pm2 ~/.pm2/dump.pm2.truoc-don-web
node -e '
const fs=require("fs"), p=process.env.HOME+"/.pm2/dump.pm2";
const l=JSON.parse(fs.readFileSync(p,"utf8"));
const n=l.filter(a=>!["tarot24","tarot24-tunnel"].includes(a.name));
fs.writeFileSync(p,JSON.stringify(n));
console.log(l.length+" -> "+n.length+" app");
'

# 3. Xoá tunnel và cấu hình của nó
cloudflared tunnel delete tarot24
rm -f ~/.cloudflared/config-tarot24.yml
rm -f ~/.cloudflared/15808c1b-eb5e-49d6-9cdd-57e64af7a2c1.json
```

Giữ lại kho mã ở `~/Projects/tarrot24` để còn dev và để chạy
`npm run deploy:vps` cho backend.

## D. Linh tinh, làm lúc nào cũng được

- Xoá hai bản ghi rác trong zone **taohinhanh.online**:
  `tarrot24.online.taohinhanh.online` và `www.tarrot24.online.taohinhanh.online`
  (tạo nhầm hôm dựng tunnel, vì `cert.pem` chỉ có phạm vi zone đó)
- Soát nội dung ở `/soat` trước khi quảng bá
- Xoay khoá DeepSeek và đổi mật khẩu root VPS — cả hai từng gõ trong chat
- Google Search Console: thêm tài sản, nộp sitemap
- Mua `tarot24.online` (một chữ r) rồi trỏ 301 về `tarrot24.online`
- Ảnh lưng lá `back.webp`
