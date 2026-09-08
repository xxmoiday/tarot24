"""PHA 5 — validate /kb/cards/*.yaml. Exit 1 nếu có lỗi.
Kiểm: đủ 78 lá, id không trùng, schema (trường bắt buộc, enum, độ dài mảng), ba_cach_doc đúng hoang_gia,
similarity cot_loi không vượt ngưỡng (dùng chung hàm với reports/dup_check.py).
"""
import json, os, glob, sys, re
import yaml

ROOT = os.path.dirname(os.path.abspath(__file__))
SIM_THRESHOLD = 0.85

try:
    import jsonschema
except ImportError:
    jsonschema = None


def load_cards():
    cards = {}
    errs = []
    for path in sorted(glob.glob(os.path.join(ROOT, "cards", "*.yaml"))):
        with open(path, encoding="utf-8") as f:
            c = yaml.safe_load(f)
        cid = c.get("id")
        if cid in cards:
            errs.append(f"id trùng: {cid}")
        if cid != os.path.basename(path)[:-5]:
            errs.append(f"tên file khác id: {path}")
        cards[cid] = c
    return cards, errs


def main():
    cards, errs = load_cards()
    if len(cards) != 78:
        errs.append(f"không đủ 78 lá: có {len(cards)}")

    with open(os.path.join(ROOT, "schema.json"), encoding="utf-8") as f:
        schema = json.load(f)
    if jsonschema is None:
        errs.append("thiếu jsonschema (pip install jsonschema)")
    else:
        v = jsonschema.Draft202012Validator(schema)
        for cid, c in cards.items():
            for e in sorted(v.iter_errors(c), key=lambda e: list(e.path)):
                errs.append(f"{cid}: {'/'.join(map(str, e.path)) or '<root>'}: {e.message[:160]}")

    # ba_cach_doc <-> hoang_gia (đã có trong schema, nhắc lại cho rõ)
    for cid, c in cards.items():
        if c.get("hoang_gia") and "ba_cach_doc" not in c:
            errs.append(f"{cid}: hoang_gia=true mà thiếu ba_cach_doc")
        if not c.get("hoang_gia") and "ba_cach_doc" in c:
            errs.append(f"{cid}: hoang_gia=false mà có ba_cach_doc")

    # similarity cot_loi
    try:
        sys.path.insert(0, os.path.join(ROOT, "reports"))
        from dup_check import cot_loi_pairs
        pairs = cot_loi_pairs(cards)
        for a, b, s in pairs:
            if s > SIM_THRESHOLD:
                errs.append(f"cot_loi quá giống: {a} ~ {b} ({s:.3f})")
    except ImportError as e:
        errs.append(f"không chạy được dup_check: {e}")

    if errs:
        print(f"FAIL — {len(errs)} lỗi")
        for e in errs:
            print(" -", e)
        return 1
    print("PASS — 78 lá hợp lệ")
    return 0


if __name__ == "__main__":
    sys.exit(main())
