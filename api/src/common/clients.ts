/**
 * Ai được gọi vào đây và mỗi bên tiêu được bao nhiêu.
 *
 * `API_KEY` vẫn là khoá của web, giữ nguyên tên biến cũ để không phải đụng tới
 * biến môi trường trên Vercel. `API_KEYS` là chỗ khai những ứng dụng khác, mỗi
 * bên một mục `ten:khoa:tran_moi_ngay`.
 *
 * Web cố tình không có trần riêng: nó là sản phẩm chính, chặn nó là chặn thứ
 * quan trọng nhất, mà trần tổng ở `LLM_CALLS_PER_DAY` vẫn đứng đó chốt tiền.
 * Bên đi mượn khoá mới là bên cần có nắp riêng.
 */

/** Tên của web, cũng là bên mặc định khi không xác định được ai gọi. */
export const WEB = "web";

export interface Client {
  id: string;
  key: string;
  /** Trần lượt gọi mô hình mỗi ngày của riêng bên này; 0 là không có trần riêng. */
  tran: number;
}

let nguonCu: string | null = null;
let dsCu: Client[] = [];

/**
 * Tách một mục `ten:khoa` hoặc `ten:khoa:tran`. Khoá sinh bằng
 * `openssl rand -base64url` thì không có dấu hai chấm, nhưng khoá đặt tay thì
 * có thể có, nên phần giữa được ghép lại nguyên vẹn.
 */
function tach(dong: string): Client | null {
  const [id, ...conLai] = dong.split(":").map((s) => s.trim());
  if (!id || !conLai.length) return null;

  const cuoi = conLai.at(-1)!;
  const coTran = conLai.length > 1 && /^\d+$/.test(cuoi);
  const key = (coTran ? conLai.slice(0, -1) : conLai).join(":");
  if (!key) return null;

  return { id, key, tran: coTran ? Number(cuoi) : 0 };
}

/** Đọc lại env khi nó đổi, còn không thì dùng bản đã tách sẵn. */
function danhSach(): Client[] {
  const nguon = `${process.env.API_KEY ?? ""}\n${process.env.API_KEYS ?? ""}`;
  if (nguon === nguonCu) return dsCu;

  const ds: Client[] = [];
  const web = (process.env.API_KEY ?? "").trim();
  if (web) ds.push({ id: WEB, key: web, tran: 0 });

  for (const dong of (process.env.API_KEYS ?? "").split(",")) {
    const c = tach(dong);
    if (c) ds.push(c);
  }

  nguonCu = nguon;
  dsCu = ds;
  return ds;
}

/** Khoá gửi lên là của bên nào; không khớp ai thì null. */
export function timTheoKhoa(sent: string): Client | null {
  if (!sent) return null;
  for (const c of danhSach()) {
    /* So độ dài trước để không đem chuỗi rỗng so với khoá thật. */
    if (sent.length === c.key.length && sent === c.key) return c;
  }
  return null;
}

/** Trần riêng mỗi ngày của một bên; 0 là bên đó chỉ chịu trần tổng. */
export function tranCua(id: string): number {
  return danhSach().find((c) => c.id === id)?.tran ?? 0;
}

/** Đã khai được khoá nào chưa; chưa thì guard chặn hết. */
export function coKhoa(): boolean {
  return danhSach().length > 0;
}

/** Bên gọi request này, do ApiKeyGuard gắn vào sau khi soi khoá. */
export interface CoClient {
  client?: string;
}

export function clientCua(req: CoClient): string {
  return req.client ?? WEB;
}
