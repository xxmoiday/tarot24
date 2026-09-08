# Cách ghép prompt luận bài

Mỗi lượt luận bài gồm ba khối, gửi theo thứ tự:

1. **System**: nguyên văn `prompts/system_luan_bai.md`. Không đổi giữa các lượt, cache được.
2. **Ngữ cảnh lượt** (system thứ hai hoặc đầu user message), gồm:
   - Định nghĩa kiểu trải lấy từ `build/spreads.json` (một entry, bỏ `vi_du`): `ten_vi`, `vi_tri[]` (stt, ten, cau_hoi, goi_y_doc, lang_kinh_uu_tien), `luat_doc[]`, `do_dai`.
   - Các lá đã rút, theo vị trí, mỗi lá là entry từ `build/cards.json` rút gọn: `ten_vi`, `cot_loi`, `tu_khoa_xuoi`, `tu_khoa_nguoc`, `canh_bao`, `lang_kinh` (có thể chỉ gửi lăng kính khớp câu hỏi + `tam_ly`), `sac_thai`, `cach_noi_viet`, một hai dòng `bieu_tuong`, và `ba_cach_doc` nếu là hoàng gia. Kèm cờ `nguoc`. Không gửi `chiem_tinh_*`, `nguyen_to`, `ten_en` (giảm token, LLM cũng không được nhắc tới).
   - Lĩnh vực câu hỏi nếu app đã phân loại (`tinh_cam | cong_viec | tien_bac | tam_ly | hoc_hanh | chung`).
3. **User**: câu hỏi nguyên văn của người dùng.

Few-shot: khi cần ổn định giọng, gửi thêm 1–2 `vi_du` của đúng kiểu trải đó (câu hỏi + lá + bai_luan) làm cặp user/assistant mẫu trước câu hỏi thật. Ví dụ `mot_la_co_khong[1]` (mua đất) và `nam_la_tinh_cam[1]` (có người khác không) là hai mẫu xử lý chủ đề cấm và người vắng mặt, nên đưa vào khi bộ lọc phía app phát hiện câu hỏi thuộc dạng đó.

## Ví dụ payload (rút gọn)

```json
{
  "spread": {
    "ten_vi": "Ba lá quá khứ, hiện tại, tương lai gần",
    "vi_tri": [
      {"stt": 1, "ten": "Quá khứ", "cau_hoi": "...", "goi_y_doc": "...", "lang_kinh_uu_tien": "theo_cau_hoi"},
      {"stt": 2, "ten": "Hiện tại", "cau_hoi": "...", "goi_y_doc": "..."},
      {"stt": 3, "ten": "Tương lai gần", "cau_hoi": "...", "goi_y_doc": "..."}
    ],
    "luat_doc": ["..."],
    "do_dai": {"min": 220, "max": 300}
  },
  "linh_vuc": "cong_viec",
  "la": [
    {"vi_tri": 1, "nguoc": false, "ten_vi": "Chín Tiền", "cot_loi": "...", "tu_khoa_xuoi": ["..."], "tu_khoa_nguoc": ["..."],
     "canh_bao": "...", "lang_kinh": {"cong_viec": "...", "tam_ly": "..."}, "sac_thai": {"trong_luong": "nhẹ", "dong_tinh": "tĩnh", "huong": "..."},
     "cach_noi_viet": ["..."], "bieu_tuong": ["..."]},
    {"vi_tri": 2, "nguoc": false, "ten_vi": "Bốn Tiền", "...": "..."},
    {"vi_tri": 3, "nguoc": false, "ten_vi": "Mặt Trăng", "...": "..."}
  ],
  "cau_hoi": "Mình có nên đổi việc trong năm nay không"
}
```

## Bộ lọc phía app (nên có, không thay được prompt)

- Phân loại câu hỏi trước khi gửi: nếu chạm chủ đề cấm (bệnh, sinh tử, thai sản, kiện tụng, mua bán đầu tư), gắn cờ `chu_de_cam: true` để prompt biết chuyển hướng ngay, và gửi kèm ví dụ mẫu tương ứng.
- Kiểm đầu ra bằng regex trước khi hiển thị: cụm cấm ở mục 1 system prompt, chữ "sẽ", "chắc chắn", dấu chấm than, tên lá tiếng Anh. Vi phạm thì gọi lại với nhắc "sửa theo mục 9".
- Đếm chữ; vượt khung `do_dai` quá 15% thì gọi lại yêu cầu cắt.

## Câu hỏi thêm sau bài

Gửi lại cùng system + ngữ cảnh lượt + bài luận đã trả (assistant turn) + câu hỏi mới. Không rút lá mới. Nếu app có tính năng "lá làm rõ", gửi lá đó với `vi_tri: 0, ten: "Lá làm rõ"` và một dòng `goi_y_doc: "Đọc lá này để trả lời đúng câu hỏi thêm, nối với các lá đã trải, không luận lại cả bài."`
