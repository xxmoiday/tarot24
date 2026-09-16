import {
  BadRequestException,
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiKeyGuard } from "../common/api-key.guard.js";
import {
  AN_HOP_LE,
  BO_HOP_LE,
  KbService,
  laAnCoThat,
  laBoCoThat,
} from "./kb.service.js";

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

  /**
   * Lọc bằng `?bo=` và `?an=`, bỏ trống thì trả cả 78 lá như trước.
   *
   * Gõ sai tên bộ thì trả 400 chứ không trả mảng rỗng: rỗng trông y hệt một bộ
   * thật mà hết lá, người nối API sẽ ngồi dò xem mình sai ở đâu.
   */
  @Get("cards")
  @Header("cache-control", "public, max-age=3600")
  cards(@Query("bo") bo?: string, @Query("an") an?: string) {
    if (bo !== undefined && !laBoCoThat(bo)) {
      throw new BadRequestException(
        `Không có bộ "${bo}". Nhận: ${BO_HOP_LE.join(", ")}`,
      );
    }
    if (an !== undefined && !laAnCoThat(an)) {
      throw new BadRequestException(
        `Không có ẩn "${an}". Nhận: ${AN_HOP_LE.join(", ")}`,
      );
    }
    return { cards: this.kb.locLa(bo, an) };
  }

  @Get("cards/:slug")
  @Header("cache-control", "public, max-age=3600")
  card(@Param("slug") slug: string) {
    const c = this.kb.card(slug);
    if (!c) throw new NotFoundException("Không có lá này");
    return this.kb.moLa(c);
  }
}
