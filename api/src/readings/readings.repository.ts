import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Pool } from "pg";
import type { ReadingParts } from "../llm/parse.js";

export interface FollowUp {
  question: string;
  answer: string;
}

/** Một lá rút thêm để làm rõ đúng một vị trí trên bàn. */
export interface Clarifier {
  /** Vị trí được làm rõ, đánh số như trong kiểu trải */
  stt: number;
  slug: string;
  reversed: boolean;
  answer: string;
}

export interface StoredReading {
  id: string;
  /** Bài luận đã ghép thành văn xuôi liền, luôn có */
  essay: string;
  /** Bài luận tách theo vị trí; null với bài cũ hoặc khi mô hình trả văn xuôi */
  parts: ReadingParts | null;
  provider: string;
  model: string;
  createdAt: string;
  followUps: FollowUp[];
  clarifiers: Clarifier[];
}

interface Row {
  id: string;
  essay: string;
  parts: ReadingParts | null;
  provider: string;
  model: string;
  created_at: Date;
  follow_ups: FollowUp[];
  clarifiers: Clarifier[];
}

@Injectable()
export class ReadingsRepository implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger(ReadingsRepository.name);
  private pool: Pool | null = null;

  async onModuleInit() {
    const url = process.env.DATABASE_URL;
    if (!url) {
      this.log.warn("Chưa có DATABASE_URL, bài đọc sẽ không lưu được");
      return;
    }
    this.pool = new Pool({
      connectionString: url,
      max: Number(process.env.DATABASE_POOL_MAX ?? 5),
      idleTimeoutMillis: 30_000,
    });

    /* Tự dựng bảng để triển khai lên máy mới không cần bước migrate riêng. */
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS readings (
        id          text PRIMARY KEY,
        essay       text NOT NULL,
        provider    text NOT NULL,
        model       text NOT NULL,
        created_at  timestamptz NOT NULL DEFAULT now(),
        follow_ups  jsonb NOT NULL DEFAULT '[]'::jsonb
      );
      CREATE INDEX IF NOT EXISTS readings_created_at_idx ON readings (created_at DESC);

      /* Thêm sau, nên phải cộng vào bảng đã có chứ không chỉ khai trong CREATE. */
      ALTER TABLE readings ADD COLUMN IF NOT EXISTS parts jsonb;
      ALTER TABLE readings ADD COLUMN IF NOT EXISTS clarifiers jsonb NOT NULL DEFAULT '[]'::jsonb;
    `);
    this.log.log("đã nối Postgres và bảo đảm bảng readings tồn tại");
  }

  async onModuleDestroy() {
    await this.pool?.end();
  }

  get ready() {
    return !!this.pool;
  }

  private toReading(r: Row): StoredReading {
    return {
      id: r.id,
      essay: r.essay,
      parts: r.parts ?? null,
      provider: r.provider,
      model: r.model,
      createdAt: r.created_at.toISOString(),
      followUps: r.follow_ups ?? [],
      clarifiers: r.clarifiers ?? [],
    };
  }

  async find(id: string): Promise<StoredReading | null> {
    if (!this.pool) return null;
    const { rows } = await this.pool.query<Row>("SELECT * FROM readings WHERE id = $1", [id]);
    return rows[0] ? this.toReading(rows[0]) : null;
  }

  /** Ghi một lần, hai request cùng mã chạy song song thì bản đầu thắng. */
  async insert(r: Omit<StoredReading, "createdAt">): Promise<StoredReading | null> {
    if (!this.pool) return null;
    const { rows } = await this.pool.query<Row>(
      `INSERT INTO readings (id, essay, parts, provider, model, follow_ups, clarifiers)
       VALUES ($1, $2, $3::jsonb, $4, $5, $6::jsonb, $7::jsonb)
       ON CONFLICT (id) DO NOTHING
       RETURNING *`,
      [
        r.id,
        r.essay,
        r.parts ? JSON.stringify(r.parts) : null,
        r.provider,
        r.model,
        JSON.stringify(r.followUps),
        JSON.stringify(r.clarifiers),
      ],
    );
    return rows[0] ? this.toReading(rows[0]) : this.find(r.id);
  }

  async appendFollowUp(id: string, f: FollowUp): Promise<StoredReading | null> {
    if (!this.pool) return null;
    const { rows } = await this.pool.query<Row>(
      `UPDATE readings
          SET follow_ups = follow_ups || $2::jsonb
        WHERE id = $1
        RETURNING *`,
      [id, JSON.stringify([f])],
    );
    return rows[0] ? this.toReading(rows[0]) : null;
  }

  async appendClarifier(id: string, c: Clarifier): Promise<StoredReading | null> {
    if (!this.pool) return null;
    const { rows } = await this.pool.query<Row>(
      `UPDATE readings
          SET clarifiers = clarifiers || $2::jsonb
        WHERE id = $1
        RETURNING *`,
      [id, JSON.stringify([c])],
    );
    return rows[0] ? this.toReading(rows[0]) : null;
  }
}
