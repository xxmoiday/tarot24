# KB Tarot 78 lá (Rider-Waite-Smith, tiếng Việt)

Quyết định PHẦN 0 đã chốt: chất **Gậy / Cốc / Kiếm / Tiền**; hoàng gia **Tiểu Đồng / Hiệp Sĩ / Hoàng Hậu / Vua**; chiêm tinh **Golden Dawn (Book T)** ở `chiem_tinh_gd`, hành tinh hiện đại ở `chiem_tinh_hd` (chỉ 4 lá: Kẻ Khờ, Người Treo Ngược, Phán Xét, Thế Giới; còn lại null).

Tên Việt Ẩn Chính: Kẻ Khờ, Pháp Sư, Nữ Tư Tế, Nữ Hoàng (Empress — để "Hoàng Hậu" cho Queen), Hoàng Đế, Giáo Hoàng, Tình Nhân, Cỗ Xe, Sức Mạnh, Ẩn Sĩ, Bánh Xe Số Phận, Công Lý, Người Treo Ngược, Thần Chết, Tiết Chế, Ác Quỷ, Toà Tháp, Ngôi Sao, Mặt Trăng, Mặt Trời, Phán Xét, Thế Giới. Đổi tên thì sửa `ref/build_catalog.py` rồi chạy lại catalog → merge → build.

## Cấu trúc
```
cards/<id>.yaml        78 file nguồn — NGƯỜI SỬA Ở ĐÂY
build/cards.json       bản build (build.py sinh, không sửa tay)
schema.json            JSON Schema (validate.py dùng)
merge.py               PHA 2: raw/ -> cards/ (thuần code)
build.py               PHA 5: cards/ -> build/cards.json
validate.py            PHA 5: fail nếu sai schema / thiếu lá / cot_loi quá giống
raw/<field>/<G>.json   output thô từng pha sinh (theo trường × nhóm)
reports/               A_du_kien, B_trung_lap, C_an_toan_giong_van, D_cho_khong_chac, E_top20_cot_loi, F_kiem_trai_bai_va_prompt
spreads/<id>.yaml      11 kiểu trải bài (vị trí, câu hỏi, gợi ý đọc, luật đọc, ví dụ minh hoạ) — NGƯỜI SỬA Ở ĐÂY
spreads/TRAI_BAI.md    bản đọc cho người của 11 kiểu trải + 14 bài luận mẫu
spreads/schema.json    schema trải bài; spreads/raw_vi_du/ là lá rút sẵn + bài mẫu (nguồn của vi_du)
build/spreads.json     bản build trải bài (build_spreads.py sinh)
build_spreads.py       validate + build trải bài; --merge để đổ raw_vi_du vào YAML
prompts/system_luan_bai.md   system prompt LLM luận bài; prompts/README.md cách ghép payload
reports/dup_check.py   Agent B (code): cosine + tần suất từ khoá
ref/catalog.json       dữ liệu cố định 78 lá (tên, chất, số, nguyên tố, chiêm tinh GD/HD)
ref/pictorial_key/     trích Waite 1911 (public domain) làm nguồn neo
ref/STYLE.md           ràng buộc + giọng văn dùng chung cho mọi agent
ref/PROMPT_*.md        prompt từng pha; ref/mkctx.py gom ngữ cảnh; ref/patch_r*.py các vá vòng hai
```
id: `major_00..21`, `wand_01..10`, `cup_01..10`, `sword_01..10`, `coin_01..10`, `<suit>_page|knight|queen|king`. Át = `_01`. Enum `chat`: gay | cup | kiem | tien.

## Chạy lại
```
pip install pyyaml jsonschema scikit-learn pyvi   # + sentence-transformers nếu muốn cosine ngữ nghĩa
python3 merge.py && python3 reports/dup_check.py && python3 validate.py && python3 build.py
```
Sửa nội dung: sửa thẳng `cards/*.yaml` rồi chạy `validate.py` + `build.py` (đừng chạy lại `merge.py`, nó ghi đè cards/ từ raw/). Nếu muốn giữ raw/ đồng bộ thì sửa raw/ rồi merge.

## Trạng thái nghiệm thu
- 78 YAML, validate PASS; build/cards.json sinh được
- Báo cáo A/B/C: 0 cờ đỏ sau vòng hai
- E_top20_cot_loi.md: bảng 20 cặp giống nhất để reader đọc lần cuối
- D_cho_khong_chac.md: chỗ cần reader cầm bộ bài thật soát + các lựa chọn nghĩa Waite/phổ thông đã chọn + hạn chế kỹ thuật (embedding TF-IDF thay vì đa ngữ)

Lần chạy 2 đã thêm: 11 kiểu trải bài + 14 bài luận mẫu (rút ngẫu nhiên) + system prompt. Còn ngoài phạm vi: bảng luật tổ hợp cặp lá (chưa làm).
