import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Chặn trang soát nội bộ bằng mật khẩu. Trang này bày nguyên các báo cáo
 * chưa chốt, không nên để ai có link cũng đọc được. Chưa đặt biến môi trường
 * thì trả 404, tức là khoá mặc định chứ không mở mặc định.
 */
export function proxy(request: NextRequest) {
  const user = process.env.REVIEW_USER;
  const pass = process.env.REVIEW_PASS;

  if (!user || !pass) {
    return new NextResponse("Not found", { status: 404 });
  }

  const header = request.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    const [u, p] = atob(encoded).split(":");
    if (u === user && p === pass) return NextResponse.next();
  }

  return new NextResponse("Cần đăng nhập", {
    status: 401,
    headers: { "www-authenticate": 'Basic realm="Tarot24 soat", charset="UTF-8"' },
  });
}

export const config = {
  matcher: "/soat/:path*",
};
