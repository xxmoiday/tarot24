import { NextResponse } from "next/server";
import { askFollowUp, hasBackend } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_LEN = 200;

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = rateLimit(
    `hoi-them:${ip}`,
    Number(process.env.RATE_FOLLOWUPS_PER_HOUR ?? 30),
    60 * 60 * 1000,
  );
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Bạn vừa hỏi hơi nhiều, nghỉ một lát rồi quay lại nhé", reason: "rate-limit" },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  let id: string, question: string;
  try {
    ({ id, question } = (await request.json()) as { id: string; question: string });
  } catch {
    return NextResponse.json({ error: "Thân request không đọc được" }, { status: 400 });
  }

  const q = (question ?? "").trim().slice(0, MAX_LEN);
  if (!id || !q) {
    return NextResponse.json({ error: "Thiếu mã bài đọc hoặc câu hỏi" }, { status: 400 });
  }
  if (!hasBackend()) return NextResponse.json({ answer: null, reason: "no-backend" });

  try {
    const data = await askFollowUp(id, q, ip);
    return NextResponse.json(data ?? { answer: null, reason: "no-reading" });
  } catch (e) {
    console.error("[hỏi thêm] backend lỗi:", e);
    return NextResponse.json({ answer: null, reason: "backend-error" });
  }
}
