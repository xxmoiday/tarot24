/**
 * Bỏ dấu tiếng Việt. Câu hỏi người dùng gõ mỗi người một kiểu dấu, có người
 * gõ thiếu, nên mọi việc dò từ khoá đều làm trên bản đã bỏ dấu.
 */
export function deaccent(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

/**
 * Hư từ tiếng Việt. Chúng có mặt trong gần như mọi câu nên để lại thì câu nào
 * cũng "giống" câu mẫu của mọi kiểu trải. Những chữ mang tín hiệu thật ("hay",
 * "nên") vẫn bị bỏ ở đây, vì tín hiệu đó do mẫu regex bắt trên nguyên câu chứ
 * không đếm bằng chữ.
 */
const STOP = new Set(
  ("co khong la va thi ma nhung nay no do kia cua cho voi ve den tu tai trong " +
    "ngoai tren duoi se dang da bi duoc minh em anh chi toi ta ban gi sao the " +
    "nhu hay ra vao len xuong di lai roi nen cai con chua van cung deu hon rat " +
    "qua lam bao gio dau day ai moi nua thoi luon nhi a o").split(" "),
);

/**
 * Tách câu đã bỏ dấu thành tập từ có nghĩa. Dùng để so câu hỏi với câu mẫu
 * trong `fits` và `notFor` của từng kiểu trải.
 */
export function tokens(s: string): Set<string> {
  const out = new Set<string>();
  for (const w of s.split(/[^a-z0-9]+/)) {
    if (w.length > 1 && !STOP.has(w)) out.add(w);
  }
  return out;
}

/** Số từ có nghĩa còn lại sau khi bỏ hư từ. */
export function contentCount(s: string) {
  return tokens(s).size;
}
