# Nhiệm vụ: viết trường `cach_noi_viet` cho TRỌN nhóm {G}

Đọc trước: `/home/claude/kb/ref/STYLE.md`, rồi `/home/claude/kb/ref/ctx/cach_noi_viet_{G}.md` (mọi lá trong nhóm, kèm các trường đã sinh).

`cach_noi_viet`: mảng 3–6 thành ngữ / tục ngữ / khẩu ngữ / cách nói đời thường tiếng Việt hợp với lá này, để LLM có thể "nói như người Việt" khi luận. Đây là trường Việt hoá, không có nguồn tarot nào cho sẵn — dựa hoàn toàn vào vốn tiếng Việt.

Quy tắc:
- Ưu tiên: tục ngữ, thành ngữ có sẵn ("có công mài sắt có ngày nên kim", "của thiên trả địa", "một cây làm chẳng nên non"); khẩu ngữ ("làm cho có", "ăn chắc mặc bền", "mất bò mới lo làm chuồng"); cách nói đời thường ngắn ("thôi kệ", "để mai tính"). Ca dao lấy nửa câu được.
- KHÔNG dịch idiom tiếng Anh ("bức tranh lớn", "ánh sáng cuối đường hầm", "bước ra khỏi vùng an toàn", "đặt tất cả trứng vào một giỏ" — cấm). Không tự chế thành ngữ giả cổ.
- Mỗi cụm phải hợp ĐÚNG lá này, không phải hợp chung chung với "tình cảm" hay "tiền bạc". Nhìn cả nhóm: một cụm không xuất hiện ở quá 1 lá trong nhóm. Nếu cụm hợp với 2 lá, giữ cho lá hợp hơn, tìm cụm khác cho lá kia.
- Có thể kèm cụm nói về mặt ngược của lá, nhưng đa số nên là mặt xuôi.
- Không sáo ngữ. Không cụm dính danh sách cấm ("sinh con đẻ cái", "sống chết có số", "tiền nào của nấy" thì được, "mua vàng lúc này" thì không).
- Kiểm tra lại rằng mọi cụm đều là cách nói người Việt thật sự dùng, viết đúng chính tả, đúng dấu.

Output: JSON `/home/claude/kb/raw/cach_noi_viet/{G}.json` dạng {"<id>": ["...", ...], ...}, UTF-8, Write tool. Kiểm bằng:
python3 -c "import json,collections;d=json.load(open('/home/claude/kb/raw/cach_noi_viet/{G}.json'));print(len(d),[k for k,v in d.items() if not 3<=len(v)<=6]);c=collections.Counter(x.lower().strip() for v in d.values() for x in v);print([k for k,n in c.items() if n>1])"

KHÔNG dùng WebSearch/WebFetch. Kết thúc: trả lời ngắn số lá đã ghi; cụm nào bạn không chắc là cách nói phổ biến.
