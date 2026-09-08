# Tarot24 — brief cho Claude Code

Dán file này làm `CLAUDE.md` ở gốc repo (hoặc làm prompt đầu tiên). Mọi dữ liệu nội dung đã có sẵn trong thư mục `kb/`, không sinh lại, không sửa tay `kb/build/*`.

## 1. Sản phẩm

Web bói tarot tiếng Việt tên **Tarot24**, cùng họ với lenormand24.online (liên kết chéo ở footer). Khách vãng lai, không đăng nhập. Người dùng chọn kiểu trải, đặt câu hỏi, rút bài, nhận bài luận do LLM viết dựa trên KB, có thể hỏi thêm, chia sẻ link bài đọc. Song song là 78 trang ý nghĩa lá và 11 trang kiểu trải để kéo SEO.

Design lấy từ file Claude Design mà chủ dự án cung cấp (mood: tối, huyền bí nhưng sạch; nền xanh đen thẫm, điểm xuyết vàng đồng, serif cho tiêu đề; ảnh lá là nhân vật chính). Nếu chưa có file design thì dựng theo mô tả ở `handoff/CLAUDE_DESIGN_PROMPT.md`.

## 2. Stack

Next.js (App Router, TypeScript), Tailwind, PostgreSQL (Prisma), deploy theo cách chủ dự án đang dùng (Mac Mini + Cloudflare Tunnel, hoặc Vercel). LLM gọi qua API route phía server, đa nhà cung cấp qua một adapter (Anthropic, OpenAI-compatible như DeepSeek, Z.ai), model và key đọc từ env, có fallback theo thứ tự.

## 3. Dữ liệu đầu vào (đã có, chỉ đọc)

- `kb/build/cards.json`: 78 lá. Trường quan trọng: `id`, `ten_vi`, `ten_en`, `arcana`, `so`, `chat`, `hoang_gia`, `bieu_tuong[]`, `cot_loi`, `tu_khoa_xuoi[]`, `tu_khoa_nguoc[]`, `canh_bao`, `nguyen_to`, `chiem_tinh_gd`, `chiem_tinh_hd`, `sac_thai{trong_luong, dong_tinh, huong}`, `lang_kinh{tinh_cam, cong_viec, tien_bac, tam_ly, hoc_hanh}`, `cach_noi_viet[]`, `ba_cach_doc{la_nguoi, la_nang_luong, la_tinh_huong}` (chỉ 16 lá hoàng gia).
- `kb/build/spreads.json`: 11 kiểu trải. Trường: `id`, `ten_vi`, `nhom` (co_ban | chuyen_de), `so_la`, `mo_ta`, `hop_voi[]`, `khong_hop_voi[]`, `cach_rut`, `vi_tri[]{stt, ten, cau_hoi, goi_y_doc, lang_kinh_uu_tien}`, `luat_doc[]`, `do_dai{min,max}`, `vi_du[]{cau_hoi, linh_vuc, la[], bai_luan, ghi_chu?}`.
- `kb/prompts/system_luan_bai.md`: system prompt nguyên văn. `kb/prompts/README.md`: cách ghép payload, bộ lọc phía app.
- Ảnh lá: chủ dự án cung cấp 78 ảnh, đặt tại `public/cards/<id>.webp` (tỉ lệ 2:3, ví dụ 600×900). Thêm `public/cards/back.webp` là mặt sau lá. Nếu thiếu ảnh nào, hiển thị placeholder có tên lá, không crash.

Nạp dữ liệu lúc build (import JSON tĩnh), không cần bảng DB cho lá và kiểu trải. DB chỉ dùng cho bài đọc đã tạo (để chia sẻ link) và log.

## 4. Trang và luồng

**Trang chủ `/`**: hero với một cụm lá, CTA "Rút bài ngay"; danh sách kiểu trải (6 cơ bản trước, 5 chuyên đề sau) dạng thẻ có tên, số lá, một câu `mo_ta`; khối "Lá bài hôm nay" (rút ngẫu nhiên theo ngày, seed = ngày + cookie ẩn danh); lối vào thư viện 78 lá; liên kết lenormand24.

**Luồng đọc bài `/boi/[spread_id]`**:
1. Màn chọn kiểu trải đã chọn sẵn, hiện `mo_ta`, `hop_voi` như gợi ý câu hỏi (bấm để điền), `cach_rut`. Ô nhập câu hỏi (bắt buộc, trừ `mot_la_hom_nay` được để trống). Chọn lĩnh vực (tình cảm / công việc / tiền bạc / tâm lý / học hành / chung) — tự đoán bằng từ khoá, người dùng sửa được.
2. Bộ lọc câu hỏi phía server trước khi gọi LLM: regex tiếng Việt cho chủ đề cấm (bệnh, ung thư, khỏi, thai, bầu, sinh con, hiếm muộn, kiện, toà, án, thắng kiện, chết, tang, mất, đầu tư, mua đất, mua vàng, cổ phiếu, coin, chứng khoán, gửi tiết kiệm, vay). Khớp thì gắn cờ `chu_de_cam: true`, vẫn cho rút bài, nhưng payload gửi kèm ví dụ mẫu chuyển hướng (`spreads.json` → `mot_la_co_khong.vi_du[1]` cho đầu tư; `nam_la_tinh_cam.vi_du[1]` cho câu hỏi về người vắng mặt) và một dòng nhắc "câu hỏi thuộc chủ đề cấm, làm theo mục 5".
3. Màn rút bài: bộ bài úp, xào (animation nhẹ), người dùng chạm chọn đúng `so_la` lá; mỗi lá lật lên đúng vị trí theo sơ đồ của kiểu trải, có xác suất ngược 30% (cấu hình được). Hiện tên vị trí + tên lá. Layout sơ đồ: 1 lá giữa; 3 lá hàng ngang; 4 lá hàng ngang; 5 lá tình cảm theo `cach_rut` (hai lá đối diện, giữa, dưới, trên); 5 lá công việc/tháng hàng ngang hoặc hình cung; quyết định A/B: 1 giữa, cột trái 2 lá, cột phải 2 lá; Celtic Cross đúng bố cục cổ điển (lá 2 xoay ngang đè lá 1, cột 4 lá bên phải). Mobile: cuộn ngang hoặc thu nhỏ, không được vỡ.
4. Gọi `POST /api/reading` với `{spread_id, cau_hoi, linh_vuc, la:[{vi_tri,id,nguoc}]}`. Server ghép payload đúng `kb/prompts/README.md`: system prompt + định nghĩa kiểu trải (bỏ `vi_du`) + lá rút gọn (bỏ `chiem_tinh_*`, `nguyen_to`, `ten_en`; `lang_kinh` chỉ gửi lăng kính khớp + `tam_ly`) + câu hỏi. Stream kết quả về client (SSE hoặc streaming response).
5. Kiểm đầu ra phía server trước khi lưu: regex cụm cấm (danh sách ở mục 1 system prompt), chữ "sẽ", "chắc chắn", "nhất định", dấu chấm than, tên lá tiếng Anh (khớp `ten_en`), nhãn hai chấm đầu dòng, đếm tiếng so với `do_dai` (lệch quá 15% thì gọi lại một lần với nhắc "sửa theo mục 9 và mục 6"). Tối đa 2 lần gọi lại, sau đó trả bản tốt nhất và log.
6. Màn kết quả: các lá đã lật (bấm vào lá mở drawer tóm tắt: `cot_loi`, 3 từ khoá theo chiều lật, `lang_kinh` khớp lĩnh vực, link tới trang lá), bài luận văn xuôi, nút "Hỏi thêm" (ô nhập, gọi `POST /api/reading/[id]/follow-up`, dùng cùng lá, không rút thêm, độ dài 60–120), nút chia sẻ (tạo link `/doc/[id]` công khai, không kèm câu hỏi nếu người dùng chọn ẩn), nút "Rút lại". Lưu bài đọc vào localStorage (lịch sử 20 bài gần nhất) và vào DB với id ngắn.

**Trang bài đọc chia sẻ `/doc/[id]`**: chỉ đọc, có lá, câu hỏi (nếu công khai), bài luận, CTA "Rút bài của bạn". OG image sinh động: tên kiểu trải + ảnh 1–3 lá.

**Thư viện `/la-bai`** và **trang lá `/la-bai/[slug]`**: slug tiếng Việt không dấu từ `ten_vi` (ví dụ `/la-bai/ba-coc`, `/la-bai/hoang-hau-kiem`, `/la-bai/toa-thap`). Mỗi trang: ảnh lớn, tên Việt + tên Anh, chất/số/nguyên tố/chiêm tinh (Golden Dawn ở dòng chính, hành tinh hiện đại ở dòng phụ có nhãn), `cot_loi` in nổi, từ khoá xuôi/ngược thành hai cột chip, năm lăng kính thành năm khối ngắn, `cach_noi_viet` thành mục "Người Việt hay nói", `bieu_tuong` thành mục "Trên lá bài", với lá hoàng gia thêm ba cách đọc. KHÔNG hiển thị `canh_bao` phần chỉ dẫn nội bộ; có thể hiển thị vế đầu (mặt tối) dưới tiêu đề "Khi lá lệch". Lọc theo bộ (Ẩn Chính, Gậy, Cốc, Kiếm, Tiền), tìm theo tên. Điều hướng lá trước/sau. SSG toàn bộ 78 trang, metadata title "Ý nghĩa lá bài {ten_vi} ({ten_en}) — xuôi, ngược, tình cảm, công việc | Tarot24", description lấy từ `cot_loi`. JSON-LD Article. Sitemap.

**Trang kiểu trải `/trai-bai/[id]`**: mô tả, sơ đồ vị trí có tên và câu hỏi của từng vị trí (không hiển thị `goi_y_doc`, `luat_doc` vì đó là chỉ dẫn LLM), một ví dụ minh hoạ lấy từ `vi_du[0]` (lá + bài luận), CTA rút bài với kiểu này. SSG 11 trang.

**Tĩnh**: `/gioi-thieu`, `/dieu-khoan` (nêu rõ bài đọc để tham khảo, không thay bác sĩ, luật sư, chuyên gia tài chính), `/lien-he`.

## 5. API

- `POST /api/reading` → `{id, bai_luan}` (stream). Rate limit theo IP (ví dụ 20 bài/ngày), trả lỗi tử tế bằng tiếng Việt.
- `POST /api/reading/[id]/follow-up` → `{tra_loi}`; tối đa 3 câu hỏi thêm mỗi bài.
- `GET /api/reading/[id]` → bài đọc để render trang chia sẻ.
- `GET /api/card-of-day` → lá hôm nay.
Bảng `readings`: id (nanoid 10), spread_id, cau_hoi, linh_vuc, la (json), bai_luan, follow_ups (json), chu_de_cam (bool), model, tokens, cong_khai (bool), created_at. Bảng `llm_logs` cho debug: reading_id, lần gọi, lý do gọi lại, output thô.

## 6. Ràng buộc nội dung

- Không bao giờ để LLM chạy mà thiếu system prompt hoặc thiếu dữ liệu lá. Không có "chế độ tự do".
- Mọi chữ hiển thị cho người dùng lấy từ KB hoặc từ bài luận đã qua kiểm; UI copy tự viết phải theo cùng giọng: ngắn, đời, không sáo ngữ, không dấu chấm than, không emoji.
- Xưng hô trong UI: "bạn". Không "quý khách".
- Footer mọi trang: một dòng "Bài đọc chỉ để tham khảo, không thay lời khuyên y tế, pháp lý, tài chính."

## 7. Nghiệm thu

- `npm run build` pass, 78 + 11 trang SSG có trong sitemap, Lighthouse SEO ≥ 95 trên trang lá.
- Chạy được luồng đầy đủ với 3 kiểu trải (1 lá, 3 lá, Celtic) trên mobile và desktop, kể cả khi LLM lỗi (hiện thông báo, cho rút lại, không mất lá đã rút).
- Test bộ lọc: 10 câu hỏi cấm mẫu (bệnh, thai, kiện, mua đất, coin...) đều gắn cờ; bài luận trả về không kết luận có/không, không khuyên mua bán.
- Test kiểm đầu ra: cố tình chèn "chắc chắn sẽ", "!" vào output giả thì bị bắt và gọi lại.
- Bài đọc chia sẻ mở được ở tab ẩn danh, có OG image.
