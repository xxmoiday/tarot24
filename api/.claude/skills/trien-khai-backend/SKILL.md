---
name: trien-khai-backend
description: Triển khai backend NestJS của Tarot24 lên VPS Vultr 45.76.161.193. Dùng khi người dùng nói "deploy backend", "đẩy backend lên VPS", "triển khai api", hoặc sau khi sửa mã trong api/ và muốn đưa lên máy chủ.
---

# Triển khai backend Tarot24

Toàn bộ việc triển khai nằm trong một script. Đừng gõ tay rsync, npm hay pm2
lên VPS — script đã lo thứ tự, đường lùi và các bước soát.

## Chạy

```bash
cd /Users/ddyuh/Projects/tarrot24/api
npm run deploy:vps
```

Muốn xem trước sẽ đồng bộ tệp nào mà chưa đụng gì tới VPS:

```bash
npm run deploy:vps -- --thu
```

## Script làm gì

1. Chạy `check:kb` rồi `build` **ở máy dev** — lỗi biên dịch lộ ra khi VPS còn nguyên
2. `rsync --delete` sang `/var/www/tarot24-backend`, chừa `node_modules`, `dist`, `.git`, `.env*`
3. Trên VPS: sao lưu `dist` thành `dist.truoc`, `npm install`, `npm run build`
4. `pm2 restart tarot24-backend --update-env`
5. Soát `http://127.0.0.1:3210/api/health` trong 40 giây
6. Soát `https://api.tarot24.online/api/health` và soát `POST /api/readings` không kèm `x-api-key` phải trả 403

Bước 5 hỏng thì script tự trả `dist` cũ về, khởi động lại và thoát khác 0.
Đường lùi này đã thử thật, backend sống lại được.

## Khi script báo hỏng

Xem log rồi sửa mã, chạy lại script — đừng vá tay trên VPS:

```bash
ssh -i ~/.ssh/tarot24_vps root@45.76.161.193 'pm2 logs tarot24-backend --lines 60 --nostream'
```

## Những chỗ dễ vấp

- **`.env` chỉ nằm trên VPS**, script không bao giờ đẩy đè. Cần thêm biến mới
  thì sửa thẳng `/var/www/tarot24-backend/.env` rồi chạy lại script để nạp lại.
- **Không chạy `pm2 save` trên VPS.** Máy đó có mấy app người dùng chủ đích
  tắt, `pm2 save` sẽ xoá chúng khỏi danh sách khởi động. Cần đổi danh sách thì
  chèn thẳng vào `~/.pm2/dump.pm2`.
- **Không nâng npm toàn cục trên VPS.** npm ở đó cũ hơn máy dev nên `npm ci`
  báo thiếu gói dù lock hợp lệ; script dùng `npm install` là vì vậy.
- Đổi `API_KEY` thì phải đổi **cả hai đầu**: `.env` trên VPS và
  `web/.env.local` ở Mac Mini, rồi `pm2 restart tarot24 --update-env`.

Chi tiết hạ tầng: `api/DEPLOY.md`.
