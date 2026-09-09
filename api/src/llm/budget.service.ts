import { existsSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { Injectable, Logger } from "@nestjs/common";

/**
 * Trần số lượt gọi mô hình mỗi ngày cho toàn hệ thống.
 *
 * Mọi giới hạn khác đều đếm theo IP, mà IP thì đổi được: một người rải qua
 * nhiều IP là qua hết. Chỗ này không quan tâm ai gọi, chỉ đếm tổng, nên nó là
 * cái duy nhất chốt được số tiền phải trả cho nhà cung cấp mô hình trong ngày.
 *
 * Đếm giữ trong bộ nhớ và ghi kèm ra một tệp nhỏ, để `pm2 restart` lúc triển
 * khai không xoá sạch số của ngày hôm đó. Tệp nằm ngoài thư mục mã nguồn vì
 * rsync lúc triển khai có `--delete`, để trong đó là mỗi lần deploy mất số.
 */
@Injectable()
export class LlmBudgetService {
  private readonly log = new Logger(LlmBudgetService.name);
  private readonly file =
    process.env.LLM_BUDGET_FILE ?? path.join(os.tmpdir(), "tarot24-llm-budget.json");

  private ngay = "";
  private dem = 0;
  /* Chỉ kêu một lần mỗi ngày cho mỗi mốc, không thì log ngập. */
  private daKeu = new Set<string>();

  constructor() {
    this.doc();
  }

  /** Trần mỗi ngày; đặt 0 là tắt hẳn chốt chặn này. */
  private get tran() {
    return Number(process.env.LLM_CALLS_PER_DAY ?? 1000);
  }

  /**
   * Ngày theo giờ Việt Nam. Lấy theo UTC thì mốc đổi ngày rơi vào bảy giờ
   * sáng, tức đang giữa lúc đông người dùng nhất.
   */
  private homNay() {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }

  private doc() {
    const ngay = this.homNay();
    try {
      if (existsSync(this.file)) {
        const luu = JSON.parse(readFileSync(this.file, "utf8")) as {
          ngay?: string;
          dem?: number;
        };
        if (luu.ngay === ngay) {
          this.ngay = ngay;
          this.dem = Number(luu.dem) || 0;
          this.log.log(`hôm nay đã gọi mô hình ${this.dem} lượt trước lần khởi động này`);
          return;
        }
      }
    } catch (e) {
      /* Tệp hỏng thì đếm lại từ đầu, đừng vì nó mà backend không lên được. */
      this.log.warn(`không đọc được sổ đếm lượt: ${e instanceof Error ? e.message : e}`);
    }
    this.ngay = ngay;
    this.dem = 0;
  }

  private ghi() {
    try {
      writeFileSync(this.file, JSON.stringify({ ngay: this.ngay, dem: this.dem }));
    } catch (e) {
      /* Ghi hỏng thì vẫn đếm trong bộ nhớ, chỉ mất phần sống qua restart. */
      this.log.warn(`không ghi được sổ đếm lượt: ${e instanceof Error ? e.message : e}`);
    }
  }

  private sangNgayMoi() {
    const ngay = this.homNay();
    if (ngay === this.ngay) return;
    this.ngay = ngay;
    this.dem = 0;
    this.daKeu.clear();
    this.ghi();
  }

  /** Còn chỗ để gọi mô hình không. Gọi trước khi bắt đầu một lượt luận bài. */
  con() {
    this.sangNgayMoi();
    const tran = this.tran;
    return tran <= 0 || this.dem < tran;
  }

  /**
   * Ghi nhận một lượt đã gọi. Đếm cả lượt gọi lại để sửa bài, vì lượt đó cũng
   * phải trả tiền như mọi lượt khác.
   */
  ghiNhan() {
    this.sangNgayMoi();
    this.dem += 1;
    this.ghi();

    const tran = this.tran;
    if (tran > 0) {
      for (const moc of [0.8, 1]) {
        const nguong = Math.floor(tran * moc);
        const khoa = `${this.ngay}:${moc}`;
        if (this.dem >= nguong && !this.daKeu.has(khoa)) {
          this.daKeu.add(khoa);
          this.log.warn(`đã dùng ${this.dem}/${tran} lượt gọi mô hình của hôm nay`);
        }
      }
    }
  }

  /** Cho health endpoint và log; không lộ gì nhạy cảm. */
  tinhHinh() {
    this.sangNgayMoi();
    return { ngay: this.ngay, dem: this.dem, tran: this.tran };
  }
}
