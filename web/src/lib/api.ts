import "server-only";

/**
 * Cầu nối sang backend. Chỉ chạy phía máy chủ vì có khoá dùng chung;
 * trình duyệt luôn đi qua route handler của Next chứ không gọi thẳng.
 */
const BASE = process.env.API_BASE_URL ?? "";
const KEY = process.env.API_KEY ?? "";
const TIMEOUT = Number(process.env.API_TIMEOUT_MS ?? 90_000);

export interface FollowUp {
  question: string;
  answer: string;
}

export interface ApiReading {
  essay: string | null;
  followUps: FollowUp[];
  cached?: boolean;
  reason?: string;
}

export function hasBackend() {
  return !!BASE && !!KEY;
}

/**
 * Backend đếm lượt theo IP, mà lời gọi này đi từ máy chủ nên nó chỉ thấy IP
 * của chính máy chạy web. Không khai IP người dùng thì trần lượt gọi bên đó
 * thành trần của cả website chứ không phải của mỗi người.
 */
async function call<T>(path: string, init?: RequestInit, ip?: string): Promise<T | null> {
  if (!hasBackend()) return null;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT);
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        "x-api-key": KEY,
        ...(ip ? { "x-client-ip": ip } : {}),
        ...init?.headers,
      },
      signal: ctl.signal,
      cache: "no-store",
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`backend trả ${res.status}: ${body.slice(0, 200)}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/** Lấy bài đã lưu; không có thì trả null chứ không sinh mới. */
export function fetchReading(id: string) {
  return call<{ essay: string; followUps: FollowUp[] }>(`/api/readings/${id}`);
}

export function createReading(id: string, ip?: string) {
  return call<ApiReading>(
    "/api/readings",
    { method: "POST", body: JSON.stringify({ id }) },
    ip,
  );
}

export function askFollowUp(id: string, question: string, ip?: string) {
  return call<{ answer: string | null; followUps: FollowUp[]; reason?: string }>(
    `/api/readings/${id}/follow-ups`,
    { method: "POST", body: JSON.stringify({ question }) },
    ip,
  );
}
