import { NextResponse } from "next/server";
import { askClarifier, hasBackend } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Lá làm rõ cho một vị trí. Lá do trình duyệt rút từ phần cỗ còn lại rồi gửi
 * lên, giống ngoài đời người rút tự chọn lá, mô hình chỉ đọc nó.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = rateLimit(
    `lam-ro:${ip}`,
    Number(process.env.RATE_CLARIFIERS_PER_HOUR ?? 20),
    60 * 60 * 1000,
  );
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Bạn vừa rút hơi nhiều, nghỉ một lát rồi quay lại nhé", reason: "rate-limit" },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  let id: string, stt: number, slug: string, reversed: boolean;
  try {
    ({ id, stt, slug, reversed } = (await request.json()) as {
      id: string;
      stt: number;
      slug: string;
      reversed: boolean;
    });
  } catch {
    return NextResponse.json({ error: "Thân request không đọc được" }, { status: 400 });
  }

  if (!id || !slug || !Number.isInteger(stt) || stt < 1) {
    return NextResponse.json(
      { error: "Thiếu mã bài đọc, vị trí hoặc lá làm rõ" },
      { status: 400 },
    );
  }
  if (!hasBackend()) return NextResponse.json({ clarifiers: null, reason: "no-backend" });

  try {
    const data = await askClarifier(id, { stt, slug, reversed: !!reversed }, ip);
    return NextResponse.json(data ?? { clarifiers: null, reason: "no-reading" });
  } catch (e) {
    console.error("[làm rõ] backend lỗi:", e);
    return NextResponse.json({ clarifiers: null, reason: "backend-error" });
  }
}
