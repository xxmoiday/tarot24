export type GuardKind = "health" | "death" | "pregnancy" | "legal" | "finance";

export interface Guard {
  kind: GuardKind;
  /** Nhãn ngắn cho ô cảnh báo */
  label: string;
  /** Câu nhắc ngay ở màn đặt câu hỏi */
  hint: string;
  /** Câu chuyển hướng mở đầu bài đọc */
  notice: string;
}

const GUARDS: Record<GuardKind, Omit<Guard, "kind">> = {
  health: {
    label: "Chuyện sức khoẻ",
    hint: "Bài không đọc chuyện bệnh tật. Hỏi bác sĩ, rồi quay lại hỏi bài về tâm thế của bạn.",
    notice:
      "Chuyện bệnh tật và cách chữa thì bài tarot ở đây không dùng để trả lời, và mình không kết luận gì dù lá ra sao. Cái đó phải hỏi bác sĩ. Bài chỉ nói được bạn đang mang chuyện này với tâm thế gì.",
  },
  death: {
    label: "Chuyện sinh tử",
    hint: "Bài không đọc chuyện sinh tử. Nếu đang có chuyện gấp, tìm người có chuyên môn trước đã.",
    notice:
      "Chuyện sinh tử thì bài không trả lời, và mình sẽ không đoán gì về nó. Nếu bạn hoặc người thân đang trong lúc ngặt, hãy gọi cho người có chuyên môn trước. Bài chỉ nói được bạn đang mang chuyện này với tâm thế gì.",
  },
  pregnancy: {
    label: "Chuyện thai sản",
    hint: "Bài không đọc chuyện thai sản. Cái đó cần xét nghiệm và bác sĩ.",
    notice:
      "Chuyện thai sản thì bài không trả lời và không thay được xét nghiệm hay lời bác sĩ. Bài chỉ nói được bạn đang mang chuyện này với tâm thế gì.",
  },
  legal: {
    label: "Chuyện pháp lý",
    hint: "Bài không đoán kết quả kiện tụng. Cái đó phải hỏi luật sư.",
    notice:
      "Chuyện kiện tụng và giấy tờ pháp lý thì bài không trả lời, và mình không đoán bên nào thắng. Cái đó phải hỏi luật sư. Bài chỉ nói được bạn đang mang chuyện này với tâm thế gì.",
  },
  finance: {
    label: "Chuyện mua bán, đầu tư",
    hint: "Bài không khuyên mua, bán hay xuống tiền. Cái đó cần người có chuyên môn tài chính.",
    notice:
      "Chuyện nên xuống tiền hay không thì bài tarot ở đây không dùng để trả lời, và mình không kết luận có hay không dù lá ra sao. Cái đó phải hỏi người có chuyên môn tài chính và người rành pháp lý. Bài chỉ nói được bạn đang mang chuyện này với tâm thế gì.",
  },
};

/**
 * Từ khoá viết không dấu vì câu hỏi được bỏ dấu trước khi dò.
 * Chọn cụm hẹp để tránh bắt nhầm, ví dụ dùng "chua benh" chứ không dùng "dau".
 */
const KEYWORDS: Record<GuardKind, string[]> = {
  health: [
    "benh", "ung thu", "phau thuat", "bac si", "benh vien", "chua benh", "khoi benh",
    "suc khoe", "tram cam", "uong thuoc", "xet nghiem", "dot quy", "tieu duong",
  ],
  death: ["chet", "qua doi", "tu tu", "tai nan", "song duoc bao lau", "tang le"],
  pregnancy: [
    "co bau", "mang thai", "co thai", "sinh con", "hiem muon", "thu tinh", "ivf", "thai nhi",
  ],
  legal: [
    "kien tung", "thang kien", "toa an", "luat su", "to cao", "khoi kien",
    "tranh chap dat", "di chuc", "hop dong phap ly",
  ],
  finance: [
    "mua vang", "ban vang", "mua dat", "ban dat", "mua nha", "ban nha", "co phieu",
    "chung khoan", "coin", "bitcoin", "crypto", "forex", "dau tu", "gop von", "vay tien",
    "lai suat", "chot loi", "cat lo", "ma nay", "bat day", "xuong tien",
  ],
};

/**
 * Vài câu chen chữ vào giữa, ví dụ "mua mảnh đất ở Long Thành", nên cần mẫu
 * cho phép có chữ đệm giữa động từ và thứ được mua bán.
 */
const PATTERNS: Partial<Record<GuardKind, RegExp[]>> = {
  finance: [
    /\b(mua|ban|dau tu|xuong tien|gom)\b[^?!.]{0,24}\b(dat|nha|vang|coin|chung khoan|co phieu|bat dong san|can ho)\b/,
    /\b(manh|lo|mieng) dat\b/,
  ],
  legal: [/\b(kien|thang|thua)\b[^?!.]{0,16}\b(kien|toa|vu an)\b/],
};

function deaccent(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

/**
 * Dò câu hỏi xem có rơi vào nhóm bài không trả lời không.
 * Trả về nhóm đầu tiên khớp, ưu tiên nhóm nặng hơn.
 */
export function detectGuard(question: string): Guard | null {
  const q = deaccent(question);
  if (!q.trim()) return null;
  const order: GuardKind[] = ["death", "health", "pregnancy", "legal", "finance"];
  for (const kind of order) {
    const hit =
      KEYWORDS[kind].some((k) => q.includes(k)) ||
      (PATTERNS[kind]?.some((re) => re.test(q)) ?? false);
    if (hit) return { kind, ...GUARDS[kind] };
  }
  return null;
}
