import { Controller, Get, Header, NotFoundException, Param, UseGuards } from "@nestjs/common";
import { ApiKeyGuard } from "../common/api-key.guard.js";
import { KbService } from "./kb.service.js";

/**
 * Bộ bài và các kiểu trải, đọc nguyên từ KB. Ứng dụng ngoài cần chúng để dựng
 * màn chọn trải và thư viện lá; trước đây họ phải chép tay hai file dữ liệu về
 * rồi tự giữ cho khỏi lệch mỗi lần KB đổi.
 *
 * Dữ liệu tĩnh, không đụng mô hình nên không tính vào trần lượt gọi và cũng
 * không qua RateLimitGuard — chặn ở đây chỉ tổ ăn mất lượt bói của người dùng.
 * Vẫn đòi khoá như mọi đường khác, và Express tự gắn ETag nên lượt sau chỉ tốn
 * một 304.
 */
@Controller()
@UseGuards(ApiKeyGuard)
export class KbController {
  constructor(private readonly kb: KbService) {}

  @Get("spreads")
  @Header("cache-control", "public, max-age=3600")
  spreads() {
    return { spreads: this.kb.tatCaTrai() };
  }

  @Get("spreads/:slug")
  @Header("cache-control", "public, max-age=3600")
  spread(@Param("slug") slug: string) {
    const s = this.kb.spread(slug);
    if (!s) throw new NotFoundException("Không có kiểu trải này");
    return this.kb.moTrai(s);
  }

  @Get("cards")
  @Header("cache-control", "public, max-age=3600")
  cards() {
    return { cards: this.kb.tatCaLa() };
  }

  @Get("cards/:slug")
  @Header("cache-control", "public, max-age=3600")
  card(@Param("slug") slug: string) {
    const c = this.kb.card(slug);
    if (!c) throw new NotFoundException("Không có lá này");
    return this.kb.moLa(c);
  }
}
