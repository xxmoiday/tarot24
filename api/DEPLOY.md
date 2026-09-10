# Đưa backend lên VPS Vultr

Backend là tiến trình Node thường, không cần gì đặc biệt ngoài Postgres.

## Hiện trạng trên VPS 45.76.161.193

Đã triển khai xong, theo đúng khuôn của các dự án khác trên máy:

- ma nguon `/var/www/tarot24-backend`
- PM2 ten `tarot24-backend`, chay `dist/main.js`, fork mode
- database `tarot24`, user `tarot24`, chi nghe qua 127.0.0.1
- nginx site `api.tarot24.online`, chuyen tiep ve cong 3210
- DNS A `api.tarot24.online` -> 45.76.161.193, DNS-only (khong bat proxy)
- vao bang khoa chung `~/.ssh/id_ed25519`, dung khoa cua alias
  `dautuyensinh-vps` trong `~/.ssh/config` — may nay con chay may dich vu khac
  nen khong co khoa rieng cho tarot24. May khac thi de bang bien `VPS_KEY`.
- TLS Let's Encrypt da cap, HTTP 301 sang HTTPS, `certbot renew` dry-run dat

Web tren Mac Mini goi thang vao `https://api.tarot24.online`. Backend chay
tren Mac Mini (`tarot24-api`) da go khoi PM2 va khoi `~/.pm2/dump.pm2`
(ban sao: `~/.pm2/dump.pm2.truoc-doi-sang-vps`).

### Cam bay: npm tren may chu cu hon may dev

Server co npm 10.9.3, may dev co npm 11. `npm ci` tren server bao
`Missing: typescript@5.9.3 from lock file` du lock hoan toan hop le, vi hai
ban npm giai cay phu thuoc khac nhau.

May nay dang chay bay dich vu khac nen KHONG nang npm toan cuc. Cach dung
cho du an nay:

```bash
npm install --no-audit --no-fund   # khong dung npm ci
npm run build
```

### Khong chay pm2 save tren may nay

Lenh do ghi de danh sach khoi dong lai tu trang thai dang chay, ma ba app dang
dung (food-discovery-backend, chiemtinh-backend, laisuat24-backend) se bi xoa
khoi danh sach. Thay vao do chen thang vao `~/.pm2/dump.pm2` bang doan Python
nhu da lam ben Mac Mini. Ban sao luu: `~/.pm2/dump.pm2.truoc-tarot24`.

## 0. Trien khai lai (dung khi da co san)

```bash
cd api && npm run deploy:vps          # them --thu de xem truoc, khong dung VPS
```

Script `scripts/deploy.sh` lo het: build thu o may dev, rsync (chua `.env`),
`npm install` + build tren VPS, `pm2 restart`, roi soat health va soat 403.
Backend khong song lai sau 40 giay thi tu tra ve ban `dist` cu.

Muc 1-6 duoi day la dung lai tu dau tren mot may moi.

## 1. Chuan bi may

```bash
# Ubuntu 24.04
sudo apt update && sudo apt install -y postgresql nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs
sudo npm i -g pm2
```

## 2. Postgres

```bash
sudo -u postgres createuser --pwprompt tarot24
sudo -u postgres createdb -O tarot24 tarot24
```

Bảng `readings` tự dựng lúc backend khởi động, không cần migrate.

## 3. Mã nguồn

```bash
git clone <repo> /opt/tarot24-api && cd /opt/tarot24-api
npm ci
cp .env.example .env      # điền cho đủ, xem mục 4
npm run build
pm2 start ecosystem.config.cjs   # xem canh bao ve pm2 save o tren
```

## 4. Biến môi trường

| Biến | Ghi chú |
|---|---|
| `API_KEY` | khoá dùng chung, phải khớp `API_KEY` bên web. Chưa đặt thì backend **chặn hết** |
| `API_KEYS` | khoá cho ứng dụng ngoài, `ten:khoa:tran_moi_ngay` cách nhau bằng dấu phẩy. Trần riêng chặn một bên tiêu hết túi chung; bỏ trống là bên đó chỉ chịu trần tổng. Xem `INTEGRATION.md` |
| `CORS_ORIGINS` | `https://tarot24.online,https://www.tarot24.online` |
| `WEB_BASE_URL` | gốc của web, để `/api/cards` dựng đường dẫn ảnh lá. Mặc định `https://www.tarot24.online` |
| `DATABASE_URL` | `postgres://tarot24:...@localhost:5432/tarot24` |
| `DEEPSEEK_API_KEY` | khoá mô hình, chỉ nằm ở đây chứ không lên Vercel |
| `LLM_CALLS_PER_DAY` | trần tổng lượt gọi mô hình mỗi ngày, mặc định 1000, tính cả lượt gọi lại. Chạm trần thì ba endpoint trả 429 kèm `reason: over-budget`. Đặt 0 là tắt. Xem `/api/health` (nhớ kèm khoá) để biết đã dùng bao nhiêu |
| `LLM_BUDGET_FILE` | nơi ghi sổ đếm, mặc định trong thư mục tạm. Đặt ra ngoài `/var/www/tarot24-backend` vì rsync lúc deploy chạy kèm `--delete` |
| `RATE_PER_HOUR` | mặc định 30 lượt mỗi người mỗi giờ. Web phải gửi kèm header `x-client-ip`, không thì backend chỉ thấy IP của máy chạy web và con số này thành trần của **cả website** |

Sinh khoá: `openssl rand -base64url 24`

Sổ đếm lượt ghi kèm phân rã theo bên gọi, xem ai đang tiêu:

```bash
cat /var/lib/tarot24/llm-budget.json
# {"ngay":"2026-09-10","dem":19,"ben":{"web":17,"troly":2}}
```

## 5. Nginx và TLS

Đặt backend sau tên miền riêng, ví dụ `api.tarot24.online`.

```nginx
server {
  server_name api.tarot24.online;
  location / {
    proxy_pass http://127.0.0.1:3210;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 120s;   # một lượt luận bài mất 8–15 giây
  }
}
```

```bash
sudo certbot --nginx -d api.tarot24.online
```

`X-Forwarded-For` là bắt buộc, không có thì RateLimitGuard thấy mọi request
đến từ cùng một IP của nginx.

## 6. Tường lửa

```bash
sudo ufw allow 22,80,443/tcp && sudo ufw enable
```

Cổng 3210 và 5432 **không mở ra ngoài**. Backend chỉ ra ngoài qua nginx,
Postgres chỉ nghe localhost.

## 7. Nối web vào

Bên web đặt:

```
API_BASE_URL=https://api.tarot24.online
API_KEY=<đúng khoá ở mục 4>
```

Trên Vercel thì đặt hai biến này trong Project Settings, không commit.

## 8. Kiểm

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://api.tarot24.online/api/health
# 403 — health cũng đòi khoá, và 403 nghĩa là nginx với DNS đều thông

curl -s -H "x-api-key: $KHOA" https://api.tarot24.online/api/health
# {"ok":true,"database":true,"llm":true,"spread":true,"luot":{...}}

curl -s -o /dev/null -w '%{http_code}\n' -X POST https://api.tarot24.online/api/readings \
  -H 'content-type: application/json' -d '{"id":"x"}'
# 403 vì thiếu x-api-key, đúng là đang chặn
```

Giám sát ngoài thì cho nó gửi kèm khoá, hoặc để nó canh đúng mã 403: máy chết
hay nginx sập thì không có gì trả nổi 403.

## Khi sửa dữ liệu KB

Bản gốc nằm bên `web/data`. Sửa xong thì `npm run sync:kb` bên api rồi build và
deploy lại cả hai. `npm run check:kb` báo nếu hai bên lệch.
