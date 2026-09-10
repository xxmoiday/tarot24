import { existsSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { Injectable, Logger } from "@nestjs/common";
import { tranCua, WEB } from "../common/clients.js";

/**
 * Trần số lượt gọi mô hình mỗi ngày cho toàn hệ thống, kèm trần riêng cho
 * từng bên gọi vào.
 *
 * Mọi giới hạn khác đều đếm theo IP, mà IP thì đổi được: một người rải qua
 * nhiều IP là qua hết. Chỗ này không quan tâm ai gọi, chỉ đếm tổng, nên nó là
 * cái duy nhất chốt được số tiền phải trả cho nhà cung cấp mô hình trong ngày.
 *
 * Trần riêng không phải để chia phần mà để một bên hỏng — retry loạn, khoá bị
 * lộ — không nuốt hết túi của bên kia. Bên nào không khai trần riêng thì chỉ
 * chịu trần tổng. Xem `common/clients.ts`.
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
  /** Số lượt của từng bên trong ngày, để biết ai đang tiêu chứ không chỉ tiêu bao nhiêu. */
  private ben: Record<string, number> = {};
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
          ben?: Record<string, number>;
        };
        if (luu.ngay === ngay) {
          this.ngay = ngay;
          this.dem = Number(luu.dem) || 0;
          /* Sổ này người vận hành có mở ra xem và sửa tay, nên lọc lấy số. */
          this.ben = {};
          for (const [id, n] of Object.entries(luu.ben ?? {})) {
            const so = Number(n);
            if (Number.isFinite(so) && so > 0) this.ben[id] = so;
          }
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
    this.ben = {};
  }

  private ghi() {
    try {
      writeFileSync(
        this.file,
        JSON.stringify({ ngay: this.ngay, dem: this.dem, ben: this.ben }),
      );
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
    this.ben = {};
    this.daKeu.clear();
    this.ghi();
  }

  /** Kêu đúng một lần mỗi ngày cho mỗi chuyện, không thì log ngập. */
  private keu(chuyen: string, loi: string) {
    const khoa = `${this.ngay}:${chuyen}`;
    if (this.daKeu.has(khoa)) return;
    this.daKeu.add(khoa);
    this.log.warn(loi);
  }

  /**
   * Còn chỗ để gọi mô hình không. Gọi trước khi bắt đầu một lượt luận bài.
   * Soát cả trần tổng lẫn trần riêng của bên gọi.
   */
  con(client: string = WEB) {
    this.sangNgayMoi();

    const tran = this.tran;
    if (tran > 0 && this.dem >= tran) return false;

    const rieng = tranCua(client);
    if (rieng > 0 && (this.ben[client] ?? 0) >= rieng) {
      this.keu(`het:${client}`, `${client} đã dùng hết ${rieng} lượt của hôm nay`);
      return false;
    }
    return true;
  }

  /**
   * Ghi nhận một lượt đã gọi. Đếm cả lượt gọi lại để sửa bài, vì lượt đó cũng
   * phải trả tiền như mọi lượt khác.
   */
  ghiNhan(client: string = WEB) {
    this.sangNgayMoi();
    this.dem += 1;
    this.ben[client] = (this.ben[client] ?? 0) + 1;
    this.ghi();

    const tran = this.tran;
    if (tran > 0) {
      for (const moc of [0.8, 1]) {
        const nguong = Math.floor(tran * moc);
        if (this.dem >= nguong) {
          this.keu(
            `moc:${moc}`,
            `đã dùng ${this.dem}/${tran} lượt gọi mô hình của hôm nay (${this.mucDung()})`,
          );
        }
      }
    }

    const rieng = tranCua(client);
    if (rieng > 0 && this.ben[client] >= Math.floor(rieng * 0.8)) {
      this.keu(
        `sap-het:${client}`,
        `${client} đã dùng ${this.ben[client]}/${rieng} lượt riêng của hôm nay`,
      );
    }
  }

  /** Ai tiêu bao nhiêu, dạng một dòng để nhét vào log. */
  private mucDung() {
    const ds = Object.entries(this.ben).map(([id, n]) => `${id} ${n}`);
    return ds.length ? ds.join(", ") : "chưa bên nào";
  }

  /** Cho health endpoint và log; không lộ gì nhạy cảm. */
  tinhHinh() {
    this.sangNgayMoi();
    return { ngay: this.ngay, dem: this.dem, tran: this.tran };
  }
}
