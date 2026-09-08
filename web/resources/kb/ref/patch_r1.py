"""Pha 4 vòng 1 — vá cơ học theo báo cáo A/B/C. Sửa trên /raw rồi merge lại.
Mỗi vá: (id, field, old, new). old phải khớp đúng một lần. Với mảng: old = phần tử, new = phần tử mới hoặc None (xoá)."""
import json, glob, os, sys
ROOT = "/home/claude/kb"

# id -> group
cat = json.load(open(f"{ROOT}/ref/catalog.json"))
grp = {c["id"]: c["group"] for c in cat}
grp_file = lambda cid, field: f"{ROOT}/raw/{field}/ALL.json" if field == "sac_thai" else f"{ROOT}/raw/{field}/{grp[cid]}.json"

P = []  # (id, field, subkey|None, old, new)
def s(cid, field, old, new, sub=None): P.append((cid, field, sub, old, new))

# ---- A: bieu_tuong (chắc sai + nghi sai nên viết trung tính) ----
s("cup_08","bieu_tuong","Tám chiếc cốc vàng xếp ở tiền cảnh thành hai hàng, hàng trên năm cốc, hàng dưới ba cốc, chừa một khoảng trống như thiếu một cốc",
  "Tám chiếc cốc vàng xếp ở tiền cảnh thành hai hàng, hàng dưới năm cốc, hàng trên ba cốc, hàng trên chừa một khoảng trống như thiếu một cốc")
s("coin_05","bieu_tuong","Người đi trước là một người đàn ông chống hai nạng, đầu quấn băng, cổ đeo một cái chuông nhỏ",
  "Người đi trước là một phụ nữ trùm khăn rách, đi chân trần trên tuyết, dáng người còng xuống")
s("coin_05","bieu_tuong","Người đi sau là một phụ nữ trùm khăn rách, đi chân trần trên tuyết, dáng người còng xuống",
  "Người đi sau là một người đàn ông chống hai nạng, đầu quấn băng, cổ đeo một cái chuông nhỏ")
s("cup_03","bieu_tuong","Cô gái mặc trắng quay lưng về phía người xem, tay đưa ra nắm lấy tay bạn",
  "Một trong ba cô quay lưng về phía người xem, tay đưa ra nắm lấy tay bạn")
s("coin_06","bieu_tuong","Thương nhân đội mũ đỏ, khoác áo choàng đỏ dài, đứng thẳng, nhìn xuống người quỳ bên phải",
  "Thương nhân đội mũ đỏ, khoác áo choàng đỏ dài, đứng thẳng, mắt nhìn xuống một trong hai người quỳ")
s("wand_10","bieu_tuong","Người này mặc áo dài màu cam đỏ, đi chân đất trên đất nâu","Người này mặc áo dài màu cam đỏ, bước trên nền đất nâu")
s("major_16","bieu_tuong","Hai người rơi từ trên tháp xuống, đầu chúc xuống trước, một người đội vương miện, một người áo xanh",
  "Hai người rơi từ trên tháp xuống, đầu chúc xuống trước; một người mặc áo xanh đội vương miện, người kia mặc áo đỏ")
s("major_18","bieu_tuong","Vầng trăng lớn giữa trời, có khuôn mặt nghiêng nhìn xuống, tia thẳng và tia sóng toả quanh, những giọt nhỏ rơi từ trăng xuống",
  "Vầng trăng lớn giữa trời, có khuôn mặt nghiêng nhìn xuống, những tia thẳng dài ngắn xen nhau toả quanh, những giọt nhỏ rơi từ trăng xuống")
s("major_21","bieu_tuong","Mỗi tay cầm một cây gậy ngắn, chân trái gập ra sau, chân phải đứng trụ","Mỗi tay cầm một cây gậy ngắn, một chân đứng trụ, chân kia gập ra sau")
s("wand_01","bieu_tuong","Nền trời xanh nhạt, không có người, không có con vật","Nền trời nhạt màu, không có người, không có con vật")
s("cup_02","bieu_tuong","Bầu trời vàng đồng đều, không mây","Bầu trời sáng nhạt, không mây")
s("coin_04","bieu_tuong","Một người đàn ông đội vương miện ngồi trên chiếc ghế đá, hai tay hai cánh tay ôm chặt một đồng tiền lớn ép vào ngực",
  "Một người đàn ông đội vương miện ngồi trên chiếc ghế đá, hai cánh tay ôm chặt một đồng tiền lớn ép vào ngực")
s("coin_07","bieu_tuong","Người mặc áo tunic màu nâu đất, đi ủng, hai tay chồng lên nhau trên đầu cán","Người mặc áo dài quá gối màu nâu đất, đi ủng, hai tay chồng lên nhau trên đầu cán")

# ---- C: an toàn ----
s("sword_knight","canh_bao","Waite có nhắc chữ chết, nhưng chỉ khi đứng cạnh các lá định mệnh khác, nên không bao giờ đọc thành tai nạn, sinh tử hay bệnh nặng.",
  "Waite có nhắc chữ chết, nhưng lá này không bao giờ đọc thành tai nạn, sinh tử hay bệnh nặng, dù đứng cạnh lá nào.")
s("coin_07","lang_kinh","cho mượn lúc này thì khó đòi.","khoản đã cho mượn đang khó đòi.",sub="tien_bac")
s("major_11","lang_kinh","người hỏi thắng nếu đúng lý,","người hỏi được xét đúng nếu có lý,",sub="cong_viec")
s("major_20","lang_kinh","quyết đổi hẳn nếp cũ; một khoản tưởng mất có thể được xét trả lại.","quyết đổi hẳn nếp cũ; cái nhìn về tiền đổi khác hẳn so với trước.",sub="tien_bac")
s("major_13","lang_kinh","hoặc quan hệ cũ chết đi để hai người sang một dạng khác","hoặc mối cũ hết đời của nó để hai người sang một dạng khác",sub="tinh_cam")
s("major_13","lang_kinh","Con người cũ đang chết đi, cách sống cũ không dùng được nữa","Con người cũ đang hết thời của nó, cách sống cũ không dùng được nữa",sub="tam_ly")
s("major_15","tu_khoa_nguoc","sắp tái nghiện","sắp dính lại")
s("major_15","tu_khoa_nguoc","cai chưa dứt","bỏ chưa dứt")
s("major_15","lang_kinh","hoặc bị dụ bởi món hời mờ ám;","hoặc bị món hời mờ ám dụ;",sub="cong_viec")
s("cup_knight","lang_kinh","xem lời hứa có gì chắc trước khi rút ví, kẻo tiền đi theo lời.","lời hứa thường nghe hay hơn phần chắc, tiền dễ đi theo lời.",sub="tien_bac")
s("major_19","lang_kinh","Đỗ, điểm cao, kết quả rõ, được ghi nhận trước lớp;","Kết quả đang rõ, được ghi nhận trước lớp;",sub="hoc_hanh")
s("sword_king","ba_cach_doc","Phụ nữ ngồi ở ghế phán quyết cũng thế.","Phụ nữ ngồi ghế quyết cũng thế.",sub="la_nguoi")
s("wand_king","lang_kinh","sổ sách rõ; có thể có tin về phần được chia từ phía gia đình.","sổ sách rõ; tiền vào lớn nhưng đi cũng nhanh nếu việc chậm.",sub="tien_bac")
s("wand_king","ba_cach_doc","Cũng có thể là tin từ phía gia đình, họ hàng về một việc lớn, một phần được chia. Hoàn cảnh ổn nhưng đòi hỏi cao.",
  "Cũng có thể là một việc lớn trong nhà, trong họ cần người đứng ra cầm trịch. Hoàn cảnh ổn nhưng đòi hỏi cao.",sub="la_tinh_huong")

# ---- C: chính tả ----
s("cup_queen","canh_bao","ngược nữa thì ngoài dịu trong tính.","ngược nữa thì ngoài dịu trong tính toán.")
s("wand_knight","tu_khoa_nguoc","chia bè xé lẻ","chia năm xẻ bảy")
s("major_05","tu_khoa_nguoc","thầy dởm","thầy rởm")
s("major_05","canh_bao","Gặp thầy dởm mà vẫn quỳ","Gặp thầy rởm mà vẫn quỳ")
s("sword_01","canh_bao","Ý vừa loé mà chưa thành hình","Ý vừa loé lên mà chưa thành hình")
s("sword_01","canh_bao","lá này chỉ là sự rõ ràng trong đầu;","lá này chỉ nói đầu óc đang sáng ra;")
s("coin_03","cach_noi_viet","thuận vợ thuận chồng tát biển Đông cũng cạn","đúng thầy đúng thợ")
s("coin_knight","cach_noi_viet","làm cho có","một nắng hai sương")

# ---- C: từ khoá khó hiểu / lạc tông ----
s("sword_06","tu_khoa_nguoc","thú thật","nói ra chuyện giấu")
s("cup_09","tu_khoa_nguoc","lòng thật lộ ra","hết vui hết bạn")
s("cup_09","tu_khoa_nguoc","sơ suất nhỏ","đủ rồi vẫn muốn thêm")
s("coin_02","tu_khoa_xuoi","tin nhắn thư từ","giấy tờ qua lại")
s("cup_05","tu_khoa_xuoi","của để lại không như mong","tiếc mãi chuyện cũ")
s("cup_08","tu_khoa_xuoi","rời bỏ chủ động","chủ động rời đi")
s("cup_08","tu_khoa_xuoi","đi tìm ý nghĩa",None)
s("cup_page","tu_khoa_xuoi","mơ mộng học trò","mơ mộng tuổi mới lớn")
s("major_08","tu_khoa_xuoi","can đảm lặng","gan mà lặng")
s("major_01","tu_khoa_xuoi","ý thành việc","nghĩ được là làm được")
s("cup_01","tu_khoa_xuoi","rung động đầu tiên","xao xuyến đầu tiên")

# ---- C: giọng văn lang_kinh / canh_bao (G1, G3, G4) ----
s("major_10","lang_kinh","bài học lúc này là chấp nhận cái ngoài tầm tay thay vì đổ tại số hoặc cưỡng lại nó.","lúc này chỉ có cách chịu cái ngoài tầm tay, không đổ tại số mà cũng không cố cưỡng.",sub="tam_ly")
s("major_06","lang_kinh","lúc này phải thống nhất giá trị chứ không chỉ chia con số.","lúc này phải hợp nhau ở cách nhìn tiền, chứ không chỉ chia con số.",sub="tien_bac")
s("major_09","lang_kinh","keo với chính mình vì sợ thì lại quá.","nhưng keo với cả chính mình chỉ vì sợ thì lại quá đà.",sub="tien_bac")
s("major_17","lang_kinh","mối cũ lành lại bằng thành thật và cho đi nhẹ nhõm.","mối cũ lành lại nhờ thật lòng và không tiếc gì với nhau.",sub="tinh_cam")
s("major_14","lang_kinh","kiên nhẫn với nhịp của chính mình.","không sốt ruột với nhịp của mình.",sub="tam_ly")
s("major_21","lang_kinh","Thấy mọi mảnh trong mình khớp lại, tròn, không còn thiếu;","Thấy mình đâu vào đấy, tròn, không thiếu gì;",sub="tam_ly")
s("major_04","lang_kinh","ngược thì là ép bản thân đến khô hoặc bỏ lịch.","ngược lại là ép mình đến khô hoặc bỏ lịch.",sub="hoc_hanh")
s("sword_04","canh_bao","kiệt sức vì không cho phép mình nằm yên.","kiệt sức vì không chịu nằm yên.")
s("sword_02","canh_bao","hiểu sự cân bằng thành bình yên hay hoà hợp;","hiểu cái thế cân này thành yên ổn, hoà thuận;")
s("cup_02","lang_kinh","thấy được hiểu, được đón;","thấy có người hiểu, có người đỡ lời;",sub="tam_ly")
s("cup_01","canh_bao","người hỏi dễ thương lung tung,","người hỏi dễ đem lòng thương lung tung,")
s("cup_03","canh_bao","chỉ chạm hướng đó khi câu hỏi hỏi thẳng và có lá khác đỡ,","chỉ chạm hướng đó khi khách hỏi thẳng và có lá khác đỡ,")
s("cup_queen","lang_kinh","các môn cần hiểu người, thấu cảm;","các môn cần hiểu người, biết thương người;",sub="hoc_hanh")
s("sword_knight","lang_kinh","cãi thắng lý nhưng làm đối phương tổn thương;","cãi thắng lý nhưng làm người kia đau;",sub="tinh_cam")

# ---- B: cụm "ngược thì là" ×7 và "gia đình hai bên" ×7 ----
s("major_00","lang_kinh","ngược thì là bỏ việc bốc đồng.","lật lại thì thành bỏ việc bốc đồng.",sub="cong_viec")
s("major_01","lang_kinh","ngược thì là lời ngọt để lấy lòng chứ chưa thật.","còn khi ngược, lời ngọt chỉ để lấy lòng chứ chưa thật.",sub="tinh_cam")
s("major_04","lang_kinh","ngược thì là siết quá chặt hoặc mất quyền quản tiền.","lá ngược thành siết quá chặt hoặc mất quyền quản tiền.",sub="tien_bac")
s("major_07","lang_kinh","ngược thì là chạy quá đà vượt khả năng.","ngược lại là chạy quá đà vượt khả năng.",sub="tien_bac")
s("major_08","lang_kinh","ngược thì là thả tay tiêu cho hả cơn.","lật ngược là thả tay tiêu cho hả cơn.",sub="tien_bac")
s("coin_03","lang_kinh","gia đình hai bên cũng góp tay.","nhà hai họ cũng góp tay.",sub="tinh_cam")
s("coin_queen","lang_kinh","gia đình hai bên êm vì có người khéo vun vén.","hai nhà êm vì có người khéo vun vén.",sub="tinh_cam")
s("major_04","lang_kinh","gia đình hai bên có tiếng nói của người cha.","bên nhà nào cũng có tiếng nói của người cha.",sub="tinh_cam")

def apply():
    cache = {}
    for cid, field, sub, old, new in P:
        path = grp_file(cid, field)
        if path not in cache:
            cache[path] = json.load(open(path, encoding="utf-8"))
        d = cache[path]
        v = d[cid]
        if sub:
            assert old in v[sub], f"{cid}.{field}.{sub}: không thấy {old!r}"
            assert v[sub].count(old) == 1
            v[sub] = v[sub].replace(old, new)
        elif isinstance(v, list):
            assert old in v, f"{cid}.{field}: không thấy phần tử {old!r}"
            i = v.index(old)
            if new is None: v.pop(i)
            else: v[i] = new
        else:
            assert old in v, f"{cid}.{field}: không thấy {old!r}"
            assert v.count(old) == 1
            d[cid] = v.replace(old, new)
    for path, d in cache.items():
        json.dump(d, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"đã vá {len(P)} chỗ trên {len(cache)} file")

if __name__ == "__main__":
    apply()
