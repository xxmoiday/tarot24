# Nhiệm vụ: viết trường `{F}` cho TRỌN nhóm {G}

Đọc trước, theo thứ tự: `/home/claude/kb/ref/STYLE.md`, rồi `/home/claude/kb/ref/ctx/{F}_{G}.md` (mọi lá trong nhóm, kèm các trường đã sinh: bieu_tuong, cot_loi{PREV}).

Trường `{F}`: mảng 5–8 cụm từ khoá {DIR}.

Quy tắc:
- Mỗi cụm 1–4 tiếng, là cụm mà người luận bài sẽ nói ra được ngay với khách: "chờ tin", "giữ của", "thắng mà mất người". Không viết cả câu. Không lặp lại `cot_loi` nguyên văn, nhưng phải nhất quán với nó.
- Đa dạng loại: có danh từ, có động từ, có trạng thái, có tình huống đời thường. Xen từ thuần Việt và khẩu ngữ khi tự nhiên; tránh toàn Hán Việt trừu tượng ("thành tựu", "chuyển hoá", "tiềm năng"...).
- Nhìn cả nhóm: cùng một cụm KHÔNG được xuất hiện ở quá 2 lá trong nhóm. Các cụm chung chung như "khởi đầu mới", "thay đổi", "thành công", "mất mát", "cân bằng", "kiên nhẫn" cấm dùng ở dạng trần — phải cụ thể hoá thành cái khởi đầu nào, thay đổi kiểu gì, thành công ra sao. Nếu buộc phải dùng ý đó thì gắn thêm sắc thái riêng của lá.
- Với bộ lá số, từ khoá phải cho thấy được nấc của lá trong tiến trình Át → Mười; với hoàng gia, phải cho thấy cả cấp lẫn chất.
{RULE_DIR}
- Không lấn vào danh sách cấm (bệnh, sinh tử, thai sản, kiện tụng, đầu tư). Không sáo ngữ trong STYLE.md.

Output: ghi JSON `/home/claude/kb/raw/{F}/{G}.json` dạng {"<id>": ["...", ...], ...} đủ mọi lá trong nhóm, UTF-8, dùng Write tool. Sau khi ghi, chạy:
python3 -c "import json,collections;d=json.load(open('/home/claude/kb/raw/{F}/{G}.json'));print(len(d),[k for k,v in d.items() if not 5<=len(v)<=8]);c=collections.Counter(x.lower().strip() for v in d.values() for x in v);print([k for k,n in c.items() if n>2])"
Nếu in ra lá sai số phần tử hoặc cụm lặp > 2 lá, sửa rồi chạy lại.

KHÔNG dùng WebSearch/WebFetch. Không đọc trang tarot nào.

Kết thúc: trả lời ngắn: số lá đã ghi; cụm nào bạn phân vân có phải nghĩa truyền thống chung không.
