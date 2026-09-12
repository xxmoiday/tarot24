import { NextResponse } from "next/server";
import { createReading, hasBackend } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Chuyển tiếp sang backend. Khoá dùng chung không bao giờ ra tới trình duyệt,
 * nên trình duyệt luôn đi qua đây chứ không gọi thẳng backend.
 */
export async function POST(request: Request) {
  /*
    Chặn sớm ngay tại đây để một máy khách hỏng không dội hết vào backend.

    12 bài mỗi giờ là quá chặt. Tiền của ngày đã có `LLM_CALLS_PER_DAY` bên
    backend chốt, nên trần này chỉ để một máy khách hỏng không dội loạn — mà
    12 thì chặn cả người đang ngồi thử thật, kể cả chính người vận hành. Hết
    trần lại rơi vào đúng đường lặng lẽ dựng bản tạm, nên người bị chặn tưởng
    bài luận viết dở chứ không biết mình bị chặn.

    24 vẫn nằm dưới trần 30 lượt mỗi giờ của backend, nên phần còn lại đủ cho
    câu hỏi thêm và lá làm rõ của chính người đó.
  */
  const ip = clientIp(request);
  const limit = rateLimit(
    `luan-bai:${ip}`,
    Number(process.env.RATE_READINGS_PER_HOUR ?? 24),
    60 * 60 * 1000,
  );
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Bạn vừa rút hơi nhiều, nghỉ một lát rồi quay lại nhé", reason: "rate-limit" },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  let id: string;
  try {
    ({ id } = (await request.json()) as { id: string });
  } catch {
    return NextResponse.json({ error: "Thân request không đọc được" }, { status: 400 });
  }
  if (!id) return NextResponse.json({ error: "Thiếu mã bài đọc" }, { status: 400 });

  if (!hasBackend()) {
    return NextResponse.json({ essay: null, parts: null, reason: "no-backend" });
  }

  try {
    const data = await createReading(id, ip);
    return NextResponse.json(data ?? { essay: null, parts: null, reason: "no-backend" });
  } catch (e) {
    console.error("[luận bài] backend lỗi:", e);
    /* Web vẫn dựng được bài bằng bộ soạn cục bộ nên không chặn người dùng. */
    return NextResponse.json({ essay: null, parts: null, reason: "backend-error" });
  }
}
