import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiKeyGuard } from "../common/api-key.guard.js";
import { detectVague, detectTopic, SuggestService } from "./question.js";

/**
 * Đọc câu hỏi rồi nói nên trải kiểu nào. Không đụng mô hình — toàn bộ là luật
 * viết tay chạy trong bộ nhớ — nên không tính vào trần lượt gọi và cũng không
 * qua RateLimitGuard.
 *
 * Trước đây luật này chỉ sống trong trình duyệt của web, ứng dụng ngoài muốn
 * có màn gợi ý thì phải tự viết lại. Giờ hai bên gọi chung một chỗ.
 */
@Controller()
@UseGuards(ApiKeyGuard)
export class SuggestController {
  constructor(private readonly suggest: SuggestService) {}

  /**
   * Dùng POST chứ không GET vì câu hỏi là chuyện riêng của người ta: nhét vào
   * query string là nó nằm lại trong log truy cập và lịch sử trình duyệt.
   */
  @Post("suggest-spreads")
  goiY(@Body() body: { question?: unknown; spread?: unknown }) {
    const { question, spread } = body ?? {};

    if (question !== undefined && typeof question !== "string") {
      throw new BadRequestException("Câu hỏi phải là chuỗi");
    }
    if (spread !== undefined && typeof spread !== "string") {
      throw new BadRequestException("Kiểu trải phải là chuỗi");
    }
    if (typeof spread === "string" && !this.suggest.coTrai(spread)) {
      throw new BadRequestException(`Không có kiểu trải "${spread}"`);
    }

    const q = typeof question === "string" ? question : "";

    return {
      /* Ba kiểu trải hợp nhất, kèm câu lý do viết sẵn cho giao diện. */
      suggestions: this.suggest.suggestSpreads(q),
      /* Câu hỏi mơ hồ tới mức bài chỉ trả lời chung chung được thì nhắc. Là
         lời nhắc chứ không phải cửa chặn: người ta vẫn rút được như thường. */
      vague: detectVague(q),
      /* Lĩnh vực đoán từ chính câu hỏi; null thì giữ mặc định của kiểu trải. */
      topic: detectTopic(q),
      /* Chỉ có khi client nói đang mở trải nào, và chỉ khi trải khác hơn hẳn. */
      better: typeof spread === "string" ? this.suggest.betterSpread(q, spread) : null,
    };
  }
}
