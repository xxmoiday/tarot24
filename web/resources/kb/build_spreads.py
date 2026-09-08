"""Trải bài: ghép raw_vi_du -> spreads/<id>.yaml (nếu --merge), validate, build /build/spreads.json.
python3 build_spreads.py --merge   # điền vi_du từ spreads/raw_vi_du/*.json vào YAML (ghi đè vi_du)
python3 build_spreads.py           # validate + build
"""
import json, os, sys, glob, re
import yaml

ROOT = os.path.dirname(os.path.abspath(__file__))
SP = os.path.join(ROOT, "spreads")


class Dumper(yaml.SafeDumper):
    pass


Dumper.add_representer(str, lambda d, s: d.represent_scalar("tag:yaml.org,2002:str", s, style="|" if "\n" in s else None))


def merge():
    for p in sorted(glob.glob(os.path.join(SP, "raw_vi_du", "*.json"))):
        sid = os.path.basename(p)[:-5]
        yp = os.path.join(SP, sid + ".yaml")
        d = yaml.safe_load(open(yp, encoding="utf-8"))
        d["vi_du"] = json.load(open(p, encoding="utf-8"))
        yaml.dump(d, open(yp, "w", encoding="utf-8"), Dumper=Dumper, allow_unicode=True, sort_keys=False, width=1000)
        print("merge", sid, len(d["vi_du"]), "ví dụ")


def words(s):
    return len(re.findall(r"\S+", s))


def validate_and_build():
    import jsonschema
    schema = json.load(open(os.path.join(SP, "schema.json"), encoding="utf-8"))
    card_ids = {c["id"] for c in json.load(open(os.path.join(ROOT, "ref", "catalog.json"), encoding="utf-8"))}
    banned = re.compile(r"vũ trụ|năng lượng|hành trình|chữa lành|đón nhận|bản thể|khai mở|tần số|thông điệp|buông bỏ để|đánh thức|cho phép bản thân|thời điểm để bạn|được mời gọi|điều quan trọng là|chắc chắn|nhất định|bạn thân mến|!", re.I)
    errs, spreads = [], []
    for p in sorted(glob.glob(os.path.join(SP, "*.yaml"))):
        d = yaml.safe_load(open(p, encoding="utf-8"))
        sid = d.get("id")
        for e in jsonschema.Draft202012Validator(schema).iter_errors(d):
            errs.append(f"{sid}: {'/'.join(map(str, e.path))}: {e.message[:140]}")
        if len(d["vi_tri"]) != d["so_la"]:
            errs.append(f"{sid}: so_la={d['so_la']} nhưng có {len(d['vi_tri'])} vị trí")
        if [v["stt"] for v in d["vi_tri"]] != list(range(1, d["so_la"] + 1)):
            errs.append(f"{sid}: stt vị trí không liên tục")
        for i, ex in enumerate(d["vi_du"]):
            if len(ex["la"]) != d["so_la"]:
                errs.append(f"{sid}.vi_du[{i}]: số lá {len(ex['la'])} != so_la")
            if sorted(l["vi_tri"] for l in ex["la"]) != list(range(1, d["so_la"] + 1)):
                errs.append(f"{sid}.vi_du[{i}]: vi_tri lá không khớp")
            for l in ex["la"]:
                if l["id"] not in card_ids:
                    errs.append(f"{sid}.vi_du[{i}]: id lá lạ {l['id']}")
            n = words(ex["bai_luan"])
            lo, hi = d["do_dai"]["min"], d["do_dai"]["max"]
            if not (lo - 15 <= n <= hi + 15):
                errs.append(f"{sid}.vi_du[{i}]: {n} chữ, khung {lo}-{hi}")
            m = banned.search(ex["bai_luan"])
            if m:
                errs.append(f"{sid}.vi_du[{i}]: cụm cấm «{m.group(0)}»")
            if re.search(r"\bsẽ\b", ex["bai_luan"]):
                errs.append(f"{sid}.vi_du[{i}]: có chữ 'sẽ'")
        spreads.append(d)
    if errs:
        print(f"FAIL — {len(errs)} lỗi")
        for e in errs:
            print(" -", e)
        return 1
    order = {k: i for i, k in enumerate(["mot_la_hom_nay", "mot_la_co_khong", "ba_la_thoi_gian", "ba_la_tinh_huong", "nam_la_tinh_cam", "celtic_cross",
                                          "cong_viec_5", "tien_bac_4", "hai_nguoi", "quyet_dinh_ab", "thang_toi"])}
    spreads.sort(key=lambda d: order.get(d["id"], 99))
    os.makedirs(os.path.join(ROOT, "build"), exist_ok=True)
    out = os.path.join(ROOT, "build", "spreads.json")
    json.dump({"version": 1, "spreads": spreads}, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"PASS — {len(spreads)} kiểu trải, {sum(len(d['vi_du']) for d in spreads)} ví dụ -> {out}")
    return 0


if __name__ == "__main__":
    if "--merge" in sys.argv:
        merge()
    sys.exit(validate_and_build())
