# Nhiệm vụ: định nghĩa 11 kiểu trải bài, viết trong MỘT context để các kiểu không dẫm nhau

Đọc trước, theo thứ tự:
1. `/home/claude/kb/ref/STYLE.md` — ràng buộc cứng, danh sách cấm, giọng văn (áp dụng cho mọi chữ bạn viết).
2. `/home/claude/kb/prompts/system_luan_bai.md` — system prompt LLM sẽ dùng khi luận. Định nghĩa trải bài của bạn là thứ được ghép vào prompt này ở mục 4, nên `cau_hoi`, `goi_y_doc`, `luat_doc` phải viết cho LLM đọc và làm theo, giọng chỉ dẫn nội bộ, ngắn, cụ thể.
3. `/home/claude/kb/spreads/schema.json` — cấu trúc bắt buộc của mỗi file.
4. Lướt 3 file lá để biết KB có gì: `/home/claude/kb/cards/cup_05.yaml`, `/home/claude/kb/cards/major_16.yaml`, `/home/claude/kb/cards/sword_queen.yaml`.

Viết 11 file YAML vào `/home/claude/kb/spreads/<id>.yaml`, bỏ trống `vi_du: []` (pha sau sẽ điền). Danh sách và số lá đã chốt:

Nhóm co_ban:
- `mot_la_hom_nay` (1 lá) — lá cho hôm nay / một câu hỏi mở
- `mot_la_co_khong` (1 lá) — câu hỏi có/không. luat_doc PHẢI có quy tắc ra kết luận ba mức "nghiêng về có / nghiêng về không / chưa ngã ngũ" dựa trên `sac_thai.trong_luong` (rất nhẹ, nhẹ → có; nặng, rất nặng → không; vừa → chưa ngã ngũ, đọc theo cot_loi), lá ngược làm mềm hoặc đảo, và quy tắc: câu hỏi có/không rơi vào chủ đề cấm thì không trả lời có/không mà chuyển hướng theo mục 5 của system prompt. Không bao giờ nói "chắc chắn có/không".
- `ba_la_thoi_gian` (3) — quá khứ, hiện tại, tương lai gần
- `ba_la_tinh_huong` (3) — tình huống, trở ngại, lời khuyên
- `nam_la_tinh_cam` (5) — cho chuyện tình cảm đang có hoặc đang tìm hiểu; tự thiết kế 5 vị trí hợp lý (ví dụ: bạn trong chuyện này, người kia trong chuyện này, cái đang nối hai người, cái đang cản, hướng đi). Vị trí "người kia" phải có goi_y_doc dặn LLM: chỉ nói bài đang cho thấy gì về phía người kia trong mối này, không phán về người vắng mặt như sự thật, không mặc định ngoại tình.
- `celtic_cross` (10) — Celtic Cross cổ điển theo Waite: 1 hoàn cảnh, 2 cái cắt ngang (đọc xuôi, không đọc ngược), 3 gốc rễ/nền, 4 quá khứ gần, 5 cái trên đầu/khả năng tốt nhất hoặc điều đang nghĩ tới, 6 tương lai gần, 7 bản thân người hỏi, 8 xung quanh/người khác, 9 hy vọng và nỗi sợ, 10 kết cục nếu giữ đà. luat_doc phải nói cách gom 10 lá thành 3–4 cụm khi viết bài cho vừa 450–550 chữ.

Nhóm chuyen_de:
- `cong_viec_5` (5) — công việc / sự nghiệp: tự thiết kế 5 vị trí (vd: chỗ đứng hiện tại, điểm mạnh đang có, cái đang cản, người hoặc yếu tố bên ngoài, hướng đi). Lăng kính ưu tiên cong_viec.
- `tien_bac_4` (4) — tiền bạc: 4 vị trí (vd: tình hình hiện tại, nguyên nhân/thói quen, cái nên giữ hoặc bỏ, hướng đi). Lăng kính tien_bac. luat_doc PHẢI nhắc: tuyệt đối không thành khuyến nghị mua/bán/đầu tư; chỉ nói về nếp tiêu, nguồn thu, cách giữ.
- `hai_nguoi` (3) — "người ấy đang nghĩ gì / giữa hai người": bạn, người kia, giữa hai người. Cùng lưu ý về người vắng mặt như trên.
- `quyet_dinh_ab` (5) — chọn giữa hai hướng: hiện tại/ gốc của phân vân, hướng A, hướng A dẫn tới đâu, hướng B, hướng B dẫn tới đâu. luat_doc: không quyết thay người hỏi, so sánh hai nhánh rồi nói nhánh nào bài nghiêng về và cái giá của nó; nếu câu hỏi là mua/bán/đầu tư thì chuyển hướng.
- `thang_toi` (5) — tháng tới: 4 tuần + 1 lá chủ đề của tháng. luat_doc: nói theo khoảng thời gian, không nói ngày; không hứa sự kiện.

Với mỗi vị trí: `cau_hoi` là câu hỏi mà lá ở đó phải trả lời; `goi_y_doc` 1–3 câu chỉ LLM cách đọc lá ở vị trí đó (lá nặng ở đây nghĩa gì, lá nhẹ ở đây nghĩa gì, lá ngược ở đây thiên về hướng nào, trường KB nào nên ưu tiên), viết để đặt cạnh lá bất kỳ đều dùng được; `lang_kinh_uu_tien` điền khi vị trí đó luôn đọc theo một lĩnh vực, còn lại "theo_cau_hoi".
`luat_doc`: 2–8 câu luật nối và tổng hợp riêng cho kiểu trải này (thứ tự nói, lá nào then chốt, cách gom, cái gì cấm riêng ở kiểu trải này). Không lặp lại những gì system prompt đã nói chung.
`hop_voi` / `khong_hop_voi`: kiểu câu hỏi, viết như ví dụ câu hỏi thật của người Việt ("Mối này có đi xa được không", "Có nên nhận offer bên kia không").
`cach_rut`: cách rút và đặt lá, một câu, để app hiển thị hướng dẫn.
`do_dai`: theo mục 6 của system prompt.
`mo_ta`: 1–2 câu để app hiển thị cho người dùng chọn kiểu trải, giọng đời, không sáo.

Không "bạn" trong goi_y_doc/luat_doc (đó là chỉ dẫn cho LLM); "bạn" chỉ xuất hiện trong mo_ta/hop_voi nếu cần. Không dấu chấm than. Không sáo ngữ.

Sau khi ghi 11 file, chạy để tự kiểm:
python3 - <<'PY'
import yaml,glob,json,jsonschema
S=json.load(open('/home/claude/kb/spreads/schema.json'))
S2=dict(S); S2['properties']=dict(S['properties']); S2['properties']['vi_du']={"type":"array"}
for p in sorted(glob.glob('/home/claude/kb/spreads/*.yaml')):
    d=yaml.safe_load(open(p)); errs=list(jsonschema.Draft202012Validator(S2).iter_errors(d))
    print(p.split('/')[-1], d['so_la'], len(d['vi_tri']), 'OK' if not errs and len(d['vi_tri'])==d['so_la'] else [e.message[:100] for e in errs])
PY
Sửa tới khi 11 file OK. Kết thúc: trả lời ngắn danh sách 11 id và số vị trí, cùng chỗ nào bạn phải tự quyết thiết kế (5 vị trí tình cảm, công việc...) để tôi xem lại.
