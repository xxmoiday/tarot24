# Tarot24 API

Backend NestJS 12 (ESM, Node 20+). Giữ database, khoá LLM và toàn bộ luật đọc
bài. Web chỉ hiển thị và gọi sang đây.

## Chạy tại chỗ

```bash
npm ci
cp .env.example .env     # điền API_KEY, DATABASE_URL, DEEPSEEK_API_KEY
npm run build
pm2 start ecosystem.config.cjs
```

Bảng `readings` tự dựng lúc khởi động, không cần bước migrate riêng.

## Endpoint

Tiền tố `/api`. Mọi endpoint trừ `/api/health` đòi header `x-api-key`.

Khoá của web nằm ở `API_KEY`. Ứng dụng khác khai trong `API_KEYS` theo dạng
`ten:khoa:tran_moi_ngay`, mỗi bên một khoá riêng và một trần lượt gọi mô hình
riêng mỗi ngày — cái nắp để một bên hỏng không nuốt hết trần tổng. Sổ đếm ghi
kèm phân rã theo bên, xem `common/clients.ts` và `llm/budget.service.ts`.

| Method | Đường dẫn | Việc |
|---|---|---|
| GET | `/api/health` | trạng thái database, LLM, KB |
| GET | `/api/spreads` `/api/spreads/:slug` | kiểu trải, nguyên như KB, thêm `slug` |
| GET | `/api/cards` `/api/cards/:slug` | 78 lá, nguyên như KB, thêm `slug` và `anh` |
| GET | `/api/readings/:id` | lấy bài đã lưu, không sinh mới |
| POST | `/api/readings` | `{id}` → viết bài luận, gọi lại cùng mã thì trả bản đã lưu |
| POST | `/api/readings/:id/follow-ups` | `{question}` → trả lời thêm, tối đa 3 câu |
| POST | `/api/readings/:id/clarifiers` | `{stt, slug, reversed}` → lá làm rõ một vị trí, tối đa 2 lá |

`id` là mã base64url do web sinh, gói sẵn kiểu trải, câu hỏi, lĩnh vực và các
lá đã rút. Backend giải mã rồi tự dựng payload nên web không gửi lá sang.

Ứng dụng khác muốn gọi sang đây thì đọc `INTEGRATION.md`: khuôn mã bài đọc,
bảng kiểu trải, bảng 78 lá, mã lỗi và những chỗ hay dính.

## Dữ liệu KB

`data/` là bản sao của `web/data`. Bản gốc nằm bên web vì các trang tĩnh cần
nó lúc build.

```bash
npm run check:kb   # báo nếu lệch
npm run sync:kb    # chép lại từ web
```

## Luật đọc

Đường đi một lượt luận bài:

1. `KbService.buildMessages` ghép ba khối theo `prompts/README.md`
2. `LlmService.chat` gọi lần lượt theo `LLM_PROVIDERS`, nhà nào lỗi thì rơi sang nhà kế
3. `checkEssay` soát theo mục 9 của system prompt
4. Vi phạm thì gọi lại đúng một lần kèm danh sách chỗ sai
5. Ghi vào Postgres, mỗi mã chỉ tốn một lượt gọi mô hình

## Chạy thử một bài với mô hình thật

`scripts/thu-bai.mjs` đi đúng chuỗi trên nhưng không đụng Postgres và không qua
controller, để xem đầu ra thật trước khi triển khai. Cần `DEEPSEEK_API_KEY`
trong `.env` và một lượt `npm run build`.

```bash
npm run build
node scripts/thu-bai.mjs --ca dayThem --lan 3
node scripts/thu-bai.mjs --trai nam-la-cong-viec --hoi "..." --la coin_03n,cup_07,major_12,cup_06,major_18n
```

Hậu tố `n` sau mã lá là lá ngược. Ba ca dựng sẵn: `dayThem` là ca hỏng đã dựng
nên mục 10 của system prompt, `doiViec` là câu hỏi đóng dạng A hay B, `thangToi`
là câu hỏi mở để xem luật 1 có bắt oan không.

Script in bài theo từng ô, số tiếng và danh sách vi phạm. Máy chỉ soát được T2,
T3, T6, T7 trong bảng nghiệm thu; T1, T4, T5, T8 vẫn phải đọc tay.
