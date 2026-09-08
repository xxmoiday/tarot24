"""PHA 2 — Ghép /kb/raw/<field>/<group>.json thành /kb/cards/<id>.yaml.
Thuần code, không agent, không viết lại chữ nào.

raw file format: {"<card_id>": <value>, ...}
Trường cố định (id, tên, nguyên tố, chiêm tinh) lấy từ ref/catalog.json.
"""
import json, os, sys, glob
import yaml

ROOT = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(ROOT, "raw")
CARDS = os.path.join(ROOT, "cards")

FIELD_ORDER = [
    "id", "ten_vi", "ten_en", "arcana", "so", "chat", "hoang_gia",
    "bieu_tuong", "cot_loi", "tu_khoa_xuoi", "tu_khoa_nguoc", "canh_bao",
    "nguyen_to", "chiem_tinh_gd", "chiem_tinh_hd",
    "sac_thai", "lang_kinh", "cach_noi_viet", "ba_cach_doc",
]
GENERATED = ["bieu_tuong", "cot_loi", "tu_khoa_xuoi", "tu_khoa_nguoc", "canh_bao",
             "sac_thai", "lang_kinh", "cach_noi_viet", "ba_cach_doc"]


class Dumper(yaml.SafeDumper):
    pass


def _str(dumper, data):
    style = "|" if "\n" in data else None
    return dumper.represent_scalar("tag:yaml.org,2002:str", data, style=style)


Dumper.add_representer(str, _str)


def load_raw():
    out = {}  # field -> {card_id: value}
    for field in GENERATED:
        out[field] = {}
        for path in sorted(glob.glob(os.path.join(RAW, field, "*.json"))):
            with open(path, encoding="utf-8") as f:
                data = json.load(f)
            for cid, val in data.items():
                if cid in out[field]:
                    print(f"WARN: {field}/{cid} xuất hiện ở nhiều file raw, lấy {os.path.basename(path)}")
                out[field][cid] = val
    return out


def main():
    with open(os.path.join(ROOT, "ref", "catalog.json"), encoding="utf-8") as f:
        catalog = json.load(f)
    raw = load_raw()
    os.makedirs(CARDS, exist_ok=True)
    missing = []
    for c in catalog:
        card = {k: c[k] for k in ["id", "ten_vi", "ten_en", "arcana", "so", "chat", "hoang_gia",
                                  "nguyen_to", "chiem_tinh_gd", "chiem_tinh_hd"]}
        for field in GENERATED:
            if field == "ba_cach_doc" and not c["hoang_gia"]:
                continue
            if c["id"] in raw[field]:
                card[field] = raw[field][c["id"]]
            else:
                missing.append(f"{c['id']}.{field}")
        ordered = {k: card[k] for k in FIELD_ORDER if k in card}
        with open(os.path.join(CARDS, f"{c['id']}.yaml"), "w", encoding="utf-8") as f:
            yaml.dump(ordered, f, Dumper=Dumper, allow_unicode=True, sort_keys=False, width=1000)
    print(f"Ghép xong {len(catalog)} lá. Thiếu {len(missing)} trường.")
    if missing:
        for m in missing[:40]:
            print("  thiếu:", m)
        if len(missing) > 40:
            print("  ...")
    return 0 if not missing else 1


if __name__ == "__main__":
    sys.exit(main())
