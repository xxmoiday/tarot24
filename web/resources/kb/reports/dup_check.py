"""Agent B — kiểm trùng lặp bằng code.
- cosine từng cặp cot_loi (sentence-transformers đa ngữ nếu có; nếu sandbox không tải được model thì
  fallback TF-IDF word(1-2gram, tách từ pyvi) + char(3-5gram)), ngưỡng > 0.85 -> cờ đỏ
- tần suất cụm từ khoá trên tu_khoa_*; cụm ở > 6 lá -> cờ đỏ
- tương tự cho từng trường lang_kinh (cosine + cụm lặp)
- bảng xếp hạng cặp giống nhất
Usage: python3 reports/dup_check.py  -> ghi reports/B_trung_lap.md
"""
import os, sys, glob, json, re, itertools, collections, unicodedata
import numpy as np
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
THRESH_COTLOI = 0.85
THRESH_LK = 0.85
KW_MAX_CARDS = 6

_model = None
_backend = None


def _embed(texts):
    global _model, _backend
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
            _backend = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        except Exception:
            _model = "tfidf"
            _backend = "TF-IDF (pyvi word 1-2gram + char 3-5gram) — fallback, sandbox không tải được model HF"
    if _model == "tfidf":
        from sklearn.feature_extraction.text import TfidfVectorizer
        from scipy.sparse import hstack
        try:
            from pyvi import ViTokenizer
            toks = [ViTokenizer.tokenize(t.lower()) for t in texts]
        except Exception:
            toks = [t.lower() for t in texts]
        w = TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True).fit_transform(toks)
        c = TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 5), sublinear_tf=True).fit_transform([t.lower() for t in texts])
        m = hstack([w, c]).toarray()
        m = m / (np.linalg.norm(m, axis=1, keepdims=True) + 1e-9)
        return m
    return _model.encode(texts, normalize_embeddings=True)


def pair_sims(ids, texts):
    e = _embed(texts)
    s = e @ e.T
    out = []
    for i, j in itertools.combinations(range(len(ids)), 2):
        out.append((ids[i], ids[j], float(s[i, j])))
    out.sort(key=lambda x: -x[2])
    return out


def cot_loi_pairs(cards):
    ids = sorted(cards)
    return pair_sims(ids, [cards[i]["cot_loi"] for i in ids])


def norm(s):
    s = unicodedata.normalize("NFC", s.lower().strip())
    return re.sub(r"\s+", " ", s)


def keyword_freq(cards, fields):
    cnt = collections.defaultdict(set)
    for cid, c in cards.items():
        for f in fields:
            for kw in c.get(f, []):
                cnt[norm(kw)].add(cid)
    return sorted(((k, sorted(v)) for k, v in cnt.items()), key=lambda x: -len(x[1]))


def ngram_freq(cards, getter, n=3, min_cards=7):
    """cụm n âm tiết lặp qua nhiều lá trong một trường văn xuôi"""
    cnt = collections.defaultdict(set)
    stop = set("của và là có một những các cho với để không được này đó rồi thì mà ở về từ hay hơn đã sẽ đang cũng".split())
    for cid, c in cards.items():
        words = re.findall(r"\w+", norm(getter(c)))
        for i in range(len(words) - n + 1):
            g = words[i:i + n]
            if all(w in stop for w in g):
                continue
            cnt[" ".join(g)].add(cid)
    return sorted(((k, sorted(v)) for k, v in cnt.items() if len(v) >= min_cards), key=lambda x: -len(x[1]))


def load_cards():
    cards = {}
    for p in sorted(glob.glob(os.path.join(ROOT, "cards", "*.yaml"))):
        with open(p, encoding="utf-8") as f:
            c = yaml.safe_load(f)
        cards[c["id"]] = c
    return cards


def main():
    cards = load_cards()
    lines = []
    red = 0
    name = lambda i: f"{i} ({cards[i]['ten_vi']})"

    pairs = cot_loi_pairs(cards)
    lines.append(f"# Báo cáo B — kiểm trùng lặp (code)\n\nBackend embedding: `{_backend}`\n")
    lines.append(f"## 1. cot_loi — cặp cosine > {THRESH_COTLOI} (cờ đỏ)\n")
    flagged = [p for p in pairs if p[2] > THRESH_COTLOI]
    red += len(flagged)
    lines.append("Không có." if not flagged else "\n".join(f"- 🔴 {name(a)} ~ {name(b)}: {s:.3f}" for a, b, s in flagged))
    lines.append("\n## 2. Bảng 20 cặp cot_loi giống nhau nhất (reader người thật đọc lần cuối)\n")
    lines.append("| # | Lá A | Lá B | cosine | cot_loi A | cot_loi B |\n|---|---|---|---|---|---|")
    for k, (a, b, s) in enumerate(pairs[:20], 1):
        lines.append(f"| {k} | {name(a)} | {name(b)} | {s:.3f} | {cards[a]['cot_loi']} | {cards[b]['cot_loi']} |")

    lines.append(f"\n## 3. Từ khoá lặp trên tu_khoa_xuoi + tu_khoa_nguoc (cụm ở > {KW_MAX_CARDS} lá = cờ đỏ)\n")
    kf = keyword_freq(cards, ["tu_khoa_xuoi", "tu_khoa_nguoc"])
    bad = [(k, v) for k, v in kf if len(v) > KW_MAX_CARDS]
    red += len(bad)
    lines.append("Không có." if not bad else "\n".join(f"- 🔴 «{k}» ở {len(v)} lá: {', '.join(v)}" for k, v in bad))
    lines.append("\nTop 15 cụm xuất hiện nhiều nhất (tham khảo):\n")
    lines.append("\n".join(f"- «{k}» ×{len(v)}: {', '.join(v)}" for k, v in kf[:15]))

    lines.append("\n## 4. lang_kinh — từng trường\n")
    for f in ["tinh_cam", "cong_viec", "tien_bac", "tam_ly", "hoc_hanh"]:
        ids = sorted(cards)
        ps = pair_sims(ids, [cards[i]["lang_kinh"][f] for i in ids])
        fl = [p for p in ps if p[2] > THRESH_LK]
        red += len(fl)
        lines.append(f"### lang_kinh.{f}\n")
        lines.append("Cặp cosine > ngưỡng: " + ("không có." if not fl else ""))
        lines.extend(f"- 🔴 {name(a)} ~ {name(b)}: {s:.3f}" for a, b, s in fl)
        lines.append("Top 5 cặp giống nhất:")
        lines.extend(f"- {name(a)} ~ {name(b)}: {s:.3f}" for a, b, s in ps[:5])
        ng = ngram_freq(cards, lambda c: c["lang_kinh"][f], n=3, min_cards=7)
        red += len(ng)
        if ng:
            lines.append("Cụm 3 tiếng lặp ở ≥ 7 lá (cờ đỏ):")
            lines.extend(f"- 🔴 «{k}» ×{len(v)}: {', '.join(v)}" for k, v in ng[:20])
        lines.append("")

    lines.append(f"\n## Tổng cờ đỏ: {red}\n")
    out = os.path.join(ROOT, "reports", "B_trung_lap.md")
    with open(out, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines))
    print(f"ghi {out}; cờ đỏ = {red}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
