"""PHA 5 — Build /kb/cards/*.yaml -> /kb/build/cards.json. KHÔNG sửa tay file build."""
import json, os, glob, sys
import yaml

ROOT = os.path.dirname(os.path.abspath(__file__))


def main():
    cards = []
    for path in sorted(glob.glob(os.path.join(ROOT, "cards", "*.yaml"))):
        with open(path, encoding="utf-8") as f:
            cards.append(yaml.safe_load(f))

    def key(c):
        if c["arcana"] == "chinh":
            return (0, c["so"], "")
        suit = ["gay", "cup", "kiem", "tien"].index(c["chat"])
        rank = c["so"] if c["so"] is not None else {"page": 11, "knight": 12, "queen": 13, "king": 14}[c["id"].split("_")[1]]
        return (1 + suit, rank, "")

    cards.sort(key=key)
    os.makedirs(os.path.join(ROOT, "build"), exist_ok=True)
    out = os.path.join(ROOT, "build", "cards.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump({"version": 1, "he_ten": {"chat": "Gậy/Cốc/Kiếm/Tiền", "hoang_gia": "Tiểu Đồng/Hiệp Sĩ/Hoàng Hậu/Vua",
                                            "chiem_tinh": "Golden Dawn (Book T) ở chiem_tinh_gd; hành tinh hiện đại ở chiem_tinh_hd"},
                   "cards": cards}, f, ensure_ascii=False, indent=1)
    print(f"build: {len(cards)} lá -> {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
