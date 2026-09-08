"""Gom ngữ cảnh cho một pha sinh: python3 ref/mkctx.py <field> <group>  -> ref/ctx/<field>_<group>.md
Gồm: catalog + Pictorial Key + mọi trường đã sinh trước đó của từng lá trong nhóm.
"""
import json, os, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORDER = ["bieu_tuong", "cot_loi", "tu_khoa_xuoi", "tu_khoa_nguoc", "lang_kinh", "canh_bao", "sac_thai", "cach_noi_viet", "ba_cach_doc"]

H_GROUPS = {  # nhóm ngang
    **{f"H{n}": [f"{s}_{n:02d}" for s in ["wand", "cup", "sword", "coin"]] for n in range(1, 11)},
    **{f"H{10+i}": [f"{s}_{r}" for s in ["wand", "cup", "sword", "coin"]] for i, r in enumerate(["page", "knight", "queen", "king"], 1)},
}


def load_raw():
    raw = {}
    for f in ORDER:
        raw[f] = {}
        for p in glob.glob(os.path.join(ROOT, "raw", f, "*.json")):
            raw[f].update(json.load(open(p, encoding="utf-8")))
    return raw


def main(field, group, with_pk=True):
    cat = json.load(open(os.path.join(ROOT, "ref", "catalog.json"), encoding="utf-8"))
    if group.startswith("H"):
        ids = H_GROUPS[group]
        cards = [c for c in cat if c["id"] in ids]
    else:
        cards = [c for c in cat if c["group"] == group]
    raw = load_raw()
    prev = ORDER[:ORDER.index(field)] if field in ORDER else ORDER
    out = [f"# Ngữ cảnh nhóm {group} cho trường `{field}` — {len(cards)} lá\n"]
    for c in cards:
        out.append(f"## {c['id']} — {c['ten_vi']} ({c['ten_en']})")
        out.append(f"nguyen_to: {c['nguyen_to']} | chiem_tinh_gd: {c['chiem_tinh_gd']} | hoang_gia: {c['hoang_gia']}")
        if with_pk:
            pk = open(os.path.join(ROOT, "ref", "pictorial_key", c["id"] + ".md"), encoding="utf-8").read().split("\n", 2)[2]
            pk = pk.replace("## Description", "### Waite — mô tả").replace("## Divinatory meanings", "### Waite — nghĩa bói")
            out.append(pk.strip())
        for f in prev:
            if c["id"] in raw[f]:
                v = raw[f][c["id"]]
                out.append(f"### {f} (đã sinh)")
                out.append(json.dumps(v, ensure_ascii=False, indent=1) if not isinstance(v, str) else v)
        out.append("")
    os.makedirs(os.path.join(ROOT, "ref", "ctx"), exist_ok=True)
    p = os.path.join(ROOT, "ref", "ctx", f"{field}_{group}.md")
    open(p, "w", encoding="utf-8").write("\n".join(out))
    print(p, len("\n".join(out)))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], with_pk=(len(sys.argv) < 4 or sys.argv[3] != "nopk"))
