# Tarot24

Rút bài, đọc rõ, làm được. Next.js 16 App Router, Tailwind v4, TypeScript.

## Chạy

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

Đặt `NEXT_PUBLIC_SITE_URL` (xem `.env.example`) để canonical, sitemap và ảnh OG trỏ đúng tên miền.

## Kiến trúc render

| Đường dẫn | Cách render | Vì sao |
| --- | --- | --- |
| `/` | Tĩnh, ISR 1 giờ | Landing cần SEO; lá hôm nay đổi theo ngày |
| `/kieu-trai`, `/kieu-trai/[slug]` | SSG | 11 kiểu trải, mỗi trang có `HowTo` JSON-LD |
| `/la-bai`, `/la-bai/[slug]` | SSG | 78 trang nghĩa lá, mỗi trang có `Article` JSON-LD và ảnh OG riêng |
| `/kien-thuc`, `/kien-thuc/[slug]` | SSG | Bài kiến thức, có `Article` + `FAQPage` JSON-LD |
| `/ve-tarot24` | SSG | |
| `/rut-bai/[slug]` | Vỏ tĩnh + luồng CSR | Xào bài, chạm chọn lá, lật bài đều chạy client cho mượt; `noindex` vì là công cụ |
| `/doc/[id]` | SSR theo yêu cầu | Bài đọc đã chia sẻ, dựng lại từ chính đường dẫn; `noindex` |

`/sitemap.xml` và `/robots.txt` sinh tự động, chặn `/doc/` và `/rut-bai/`.

## Cấu trúc

```
src/
  app/                      route App Router, sitemap, robots, ảnh OG
  components/
    TarotCardFace.tsx       lá bài, mọi kích thước bên trong tính theo cqw
    reading/                ReadingFlow (CSR) · ReadingBoard · CardDrawer · ReadingView
  lib/
    cards.ts                78 lá: nghĩa xuôi, ngược, 5 mặt đời sống, hình vẽ, thành ngữ
    spreads.ts              11 kiểu trải, vị trí từng lá, sơ đồ Thập tự Celtic
    draw.ts                 xào bài theo seed, lá hôm nay theo ngày
    reading.ts              bộ soạn bài luận cục bộ, dùng khi backend không tới được
    api.ts                  cầu nối sang backend NestJS
    share.ts                nén/giải nén cả bài đọc vào đường dẫn
    articles.ts             nội dung trang kiến thức
```

## Bài luận

Bài luận do **backend NestJS** viết, không nằm trong repo này. Xem `../api`.

Web gửi mã bài đọc sang `POST /api/readings`, backend giải mã ra kiểu trải,
câu hỏi và các lá, tự dựng payload theo `system_luan_bai.md`, gọi mô hình, soát
đầu ra, lưu Postgres rồi trả bài luận về.

- `src/lib/api.ts` là cầu nối, chỉ chạy phía máy chủ vì có khoá dùng chung.
  Trình duyệt luôn đi qua route handler của Next chứ không gọi thẳng backend.
- **Chưa cấu hình backend thì web vẫn chạy**: bài luận dựng bằng bộ soạn cục bộ
  trong `src/lib/reading.ts`. Backend chết cũng rơi về đó, không chặn người dùng.
- Chặn lượt gọi hai tầng: tại Next để một máy khách hỏng không dội vào backend,
  và tại backend theo IP thật.

## Vài điểm cần biết

- **Không có cơ sở dữ liệu.** Bài đọc được nén base64url vào chính `/doc/<id>`, nên chia sẻ được mà không lưu gì của người dùng.
- **Rút bài tái lập được.** `shuffleDeck(seed)` dùng PRNG mulberry32; cùng seed cho cùng bộ bài.
- **Dữ liệu nội dung không sửa tay.** `data/cards.source.json` và `data/spreads.source.json` là bản gốc; `src/lib/cards.ts` và `src/lib/spreads.ts` chỉ chuyển đổi. Ba script `npm run check:cards`, `check:spreads`, `check:lengths` đối chiếu lại.
- **Lá bài dùng container query.** `TarotCardFace` không tự đặt bề ngang; nơi gọi phải truyền class width (`w-full`, `w-[98px]`, …).

## Nguồn thiết kế

Claude Design · `Tarot24.dc.html` (1 artboard hệ thống, 8 màn mobile 390, 4 màn desktop 1440, 1 ảnh OG).
