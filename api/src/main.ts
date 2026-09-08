import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
  });

  /* Chạy sau Cloudflare hoặc nginx nên phải tin header chuyển tiếp để lấy đúng IP. */
  app.set("trust proxy", 1);

  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const origins = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  app.enableCors({
    origin: origins.length ? origins : false,
    methods: ["GET", "POST"],
    allowedHeaders: ["content-type", "x-api-key"],
    maxAge: 86_400,
  });

  const port = Number(process.env.PORT ?? 3210);
  await app.listen(port, "0.0.0.0");
  new Logger("bootstrap").log(`Tarot24 API nghe ở cổng ${port}`);
}

void bootstrap();
