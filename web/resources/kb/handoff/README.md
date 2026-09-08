# Handoff Tarot24

Thứ tự dùng:
1. `CLAUDE_DESIGN_PROMPT.md` → dán vào Claude Design, ra canvas 12 artboard + design system. Xuất PNG/HTML đưa cho Claude Code.
2. `CLAUDE_CODE_BRIEF.md` → chép thành `CLAUDE.md` ở gốc repo mới, kèm thư mục `kb/` (nguyên trạng) và thư mục `public/cards/` chứa 78 ảnh `<id>.webp` + `back.webp`. Chạy Claude Code: "Đọc CLAUDE.md và kb/README.md, dựng web theo brief, bắt đầu từ data layer và 78 trang lá."
3. Trước khi public: reader người thật soát `kb/reports/D_cho_khong_chac.md` và `kb/reports/E_top20_cot_loi.md`.

Cái Claude Code cần thêm ngoài gói này: API key LLM (đọc từ env), domain + hosting, 78 ảnh lá.
