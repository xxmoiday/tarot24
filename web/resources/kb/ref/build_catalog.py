"""Sinh /kb/ref/catalog.json — dữ liệu cố định của 78 lá (tên, chất, số, nguyên tố, chiêm tinh Golden Dawn).
Chạy một lần. Nguồn chiêm tinh: Golden Dawn Book T. Tên chốt ở PHẦN 0: Gậy/Cốc/Kiếm/Tiền; Tiểu Đồng/Hiệp Sĩ/Hoàng Hậu/Vua.
"""
import json

MAJORS = [
    # so, ten_vi, ten_en, nguyen_to, gd, hd
    (0,  "Kẻ Khờ",            "The Fool",             "khi",  "Nguyên tố Khí",   "Thiên Vương Tinh"),
    (1,  "Pháp Sư",           "The Magician",         "khi",  "Sao Thuỷ",        None),
    (2,  "Nữ Tư Tế",          "The High Priestess",   "thuy", "Mặt Trăng",       None),
    (3,  "Nữ Hoàng",          "The Empress",          "tho",  "Sao Kim",         None),
    (4,  "Hoàng Đế",          "The Emperor",          "hoa",  "Bạch Dương",      None),
    (5,  "Giáo Hoàng",        "The Hierophant",       "tho",  "Kim Ngưu",        None),
    (6,  "Tình Nhân",         "The Lovers",           "khi",  "Song Tử",         None),
    (7,  "Cỗ Xe",             "The Chariot",          "thuy", "Cự Giải",         None),
    (8,  "Sức Mạnh",          "Strength",             "hoa",  "Sư Tử",           None),
    (9,  "Ẩn Sĩ",             "The Hermit",           "tho",  "Xử Nữ",           None),
    (10, "Bánh Xe Số Phận",   "Wheel of Fortune",     "hoa",  "Sao Mộc",         None),
    (11, "Công Lý",           "Justice",              "khi",  "Thiên Bình",      None),
    (12, "Người Treo Ngược",  "The Hanged Man",       "thuy", "Nguyên tố Thuỷ",  "Hải Vương Tinh"),
    (13, "Thần Chết",         "Death",                "thuy", "Bọ Cạp",          None),
    (14, "Tiết Chế",          "Temperance",           "hoa",  "Nhân Mã",         None),
    (15, "Ác Quỷ",            "The Devil",            "tho",  "Ma Kết",          None),
    (16, "Toà Tháp",          "The Tower",            "hoa",  "Sao Hoả",         None),
    (17, "Ngôi Sao",          "The Star",             "khi",  "Bảo Bình",        None),
    (18, "Mặt Trăng",         "The Moon",             "thuy", "Song Ngư",        None),
    (19, "Mặt Trời",          "The Sun",              "hoa",  "Mặt Trời",        None),
    (20, "Phán Xét",          "Judgement",            "hoa",  "Nguyên tố Hoả",   "Diêm Vương Tinh"),
    (21, "Thế Giới",          "The World",            "tho",  "Sao Thổ",         "Trái Đất"),
]

SUITS = {
    # key: (id prefix, chat enum, ten_vi, ten_en, nguyen_to, ten nguyên tố VI)
    "wand":  ("wand",  "gay",  "Gậy",  "Wands",     "hoa",  "Hoả"),
    "cup":   ("cup",   "cup",  "Cốc",  "Cups",      "thuy", "Thuỷ"),
    "sword": ("sword", "kiem", "Kiếm", "Swords",    "khi",  "Khí"),
    "coin":  ("coin",  "tien", "Tiền", "Pentacles", "tho",  "Thổ"),
}

SO_VI = {1: "Át", 2: "Hai", 3: "Ba", 4: "Bốn", 5: "Năm", 6: "Sáu", 7: "Bảy", 8: "Tám", 9: "Chín", 10: "Mười"}
SO_EN = {1: "Ace", 2: "Two", 3: "Three", 4: "Four", 5: "Five", 6: "Six", 7: "Seven", 8: "Eight", 9: "Nine", 10: "Ten"}

# Book T decans: (hành tinh, cung) cho lá 2..10
DECANS = {
    "wand":  {2: ("Sao Hoả", "Bạch Dương"), 3: ("Mặt Trời", "Bạch Dương"), 4: ("Sao Kim", "Bạch Dương"),
              5: ("Sao Thổ", "Sư Tử"), 6: ("Sao Mộc", "Sư Tử"), 7: ("Sao Hoả", "Sư Tử"),
              8: ("Sao Thuỷ", "Nhân Mã"), 9: ("Mặt Trăng", "Nhân Mã"), 10: ("Sao Thổ", "Nhân Mã")},
    "cup":   {2: ("Sao Kim", "Cự Giải"), 3: ("Sao Thuỷ", "Cự Giải"), 4: ("Mặt Trăng", "Cự Giải"),
              5: ("Sao Hoả", "Bọ Cạp"), 6: ("Mặt Trời", "Bọ Cạp"), 7: ("Sao Kim", "Bọ Cạp"),
              8: ("Sao Thổ", "Song Ngư"), 9: ("Sao Mộc", "Song Ngư"), 10: ("Sao Hoả", "Song Ngư")},
    "sword": {2: ("Mặt Trăng", "Thiên Bình"), 3: ("Sao Thổ", "Thiên Bình"), 4: ("Sao Mộc", "Thiên Bình"),
              5: ("Sao Kim", "Bảo Bình"), 6: ("Sao Thuỷ", "Bảo Bình"), 7: ("Mặt Trăng", "Bảo Bình"),
              8: ("Sao Mộc", "Song Tử"), 9: ("Sao Hoả", "Song Tử"), 10: ("Mặt Trời", "Song Tử")},
    "coin":  {2: ("Sao Mộc", "Ma Kết"), 3: ("Sao Hoả", "Ma Kết"), 4: ("Mặt Trời", "Ma Kết"),
              5: ("Sao Thuỷ", "Kim Ngưu"), 6: ("Mặt Trăng", "Kim Ngưu"), 7: ("Sao Thổ", "Kim Ngưu"),
              8: ("Mặt Trời", "Xử Nữ"), 9: ("Sao Kim", "Xử Nữ"), 10: ("Sao Thuỷ", "Xử Nữ")},
}

COURTS = [
    # rank id, ten_vi, ten_en, sub-element VI, GD title
    ("page",   "Tiểu Đồng", "Page",   "Thổ", "Công Chúa (Princess)"),
    ("knight", "Hiệp Sĩ",   "Knight", "Khí", "Hoàng Tử (Prince)"),
    ("queen",  "Hoàng Hậu", "Queen",  "Thuỷ", "Hoàng Hậu (Queen)"),
    ("king",   "Vua",       "King",   "Hoả", "Hiệp Sĩ (Knight)"),
]
# Book T: khoảng hoàng đạo của King (GD Knight), Queen, Knight (GD Prince); Page cai quản một góc phần tư
COURT_ZODIAC = {
    "wand":  {"king": "20° Bọ Cạp – 20° Nhân Mã", "queen": "20° Song Ngư – 20° Bạch Dương", "knight": "20° Cự Giải – 20° Sư Tử",
              "page": "góc phần tư Cự Giải – Sư Tử – Xử Nữ"},
    "cup":   {"king": "20° Bảo Bình – 20° Song Ngư", "queen": "20° Song Tử – 20° Cự Giải", "knight": "20° Thiên Bình – 20° Bọ Cạp",
              "page": "góc phần tư Thiên Bình – Bọ Cạp – Nhân Mã"},
    "sword": {"king": "20° Kim Ngưu – 20° Song Tử", "queen": "20° Xử Nữ – 20° Thiên Bình", "knight": "20° Ma Kết – 20° Bảo Bình",
              "page": "góc phần tư Ma Kết – Bảo Bình – Song Ngư"},
    "coin":  {"king": "20° Sư Tử – 20° Xử Nữ", "queen": "20° Nhân Mã – 20° Ma Kết", "knight": "20° Bạch Dương – 20° Kim Ngưu",
              "page": "góc phần tư Bạch Dương – Kim Ngưu – Song Tử"},
}

cards = []
for so, vi, en, nt, gd, hd in MAJORS:
    cards.append(dict(id=f"major_{so:02d}", ten_vi=vi, ten_en=en, arcana="chinh", so=so, chat=None,
                      hoang_gia=False, nguyen_to=nt, chiem_tinh_gd=gd, chiem_tinh_hd=hd, group="G1"))

for gi, (key, (pre, chat, svi, sen, nt, ntvi)) in enumerate(SUITS.items(), start=2):
    for n in range(1, 11):
        if n == 1:
            gd = f"Gốc của nguyên tố {ntvi}"
        else:
            p, z = DECANS[key][n]
            gd = f"{p} ở {z}"
        cards.append(dict(id=f"{pre}_{n:02d}", ten_vi=f"{SO_VI[n]} {svi}", ten_en=f"{SO_EN[n]} of {sen}",
                          arcana="phu", so=n, chat=chat, hoang_gia=False, nguyen_to=nt,
                          chiem_tinh_gd=gd, chiem_tinh_hd=None, group=f"G{gi}"))

for key, (pre, chat, svi, sen, nt, ntvi) in SUITS.items():
    for rank, rvi, ren, sub, gdtitle in COURTS:
        gd = f"{sub} của {ntvi} — {gdtitle}; {COURT_ZODIAC[key][rank]}"
        cards.append(dict(id=f"{pre}_{rank}", ten_vi=f"{rvi} {svi}", ten_en=f"{ren} of {sen}",
                          arcana="phu", so=None, chat=chat, hoang_gia=True, nguyen_to=nt,
                          chiem_tinh_gd=gd, chiem_tinh_hd=None, group="G6"))

assert len(cards) == 78 and len({c["id"] for c in cards}) == 78
with open("/home/claude/kb/ref/catalog.json", "w", encoding="utf-8") as f:
    json.dump(cards, f, ensure_ascii=False, indent=1)
print("ok", len(cards))
