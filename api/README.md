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

| Method | Đường dẫn | Việc |
|---|---|---|
| GET | `/api/health` | trạng thái database, LLM, KB |
| GET | `/api/readings/:id` | lấy bài đã lưu, không sinh mới |
| POST | `/api/readings` | `{id}` → viết bài luận, gọi lại cùng mã thì trả bản đã lưu |
| POST | `/api/readings/:id/follow-ups` | `{question}` → trả lời thêm, tối đa 3 câu |

`id` là mã base64url do web sinh, gói sẵn kiểu trải, câu hỏi, lĩnh vực và các
lá đã rút. Backend giải mã rồi tự dựng payload nên web không gửi lá sang.

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
