// Chạy thử một bài luận với LLM thật, in ra bài và danh sách vi phạm.
//
// Không đụng tới Postgres và không đi qua controller: chỉ dựng đúng chuỗi
// KbService -> LlmService -> parse -> checkEssay như ReadingsService.create
// làm, để xem đầu ra thật trông thế nào trước khi triển khai.
//
// Chạy:  npm run build && node scripts/thu-bai.mjs --ca dayThem --lan 3
//        node scripts/thu-bai.mjs --trai nam-la-cong-viec --hoi "..." --la coin_03n,cup_07,major_12
//
// Khoá mô hình lấy từ api/.env, hoặc từ biến môi trường sẵn có.
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const goc = path.resolve(import.meta.dirname, "..");

/* .env của dự án không lên git và cũng không rsync lên VPS; đọc tay cho khỏi
   thêm một phụ thuộc chỉ để chạy một script dev. */
const env = path.join(goc, ".env");
if (existsSync(env)) {
  for (const dong of readFileSync(env, "utf8").split("\n")) {
    const m = dong.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const dist = path.join(goc, "dist");
if (!existsSync(dist)) {
  console.error("Chưa có dist/. Chạy `npm run build` trước đã.");
  process.exit(1);
}

const { KbService, slugOf } = await import(path.join(dist, "kb/kb.service.js"));
const { LlmService } = await import(path.join(dist, "llm/llm.service.js"));
const { detectGuard } = await import(path.join(dist, "llm/guard.js"));
const { parseParts, flatten } = await import(path.join(dist, "llm/parse.js"));
const { checkEssay, countWords, stripStockLabels } = await import(
  path.join(dist, "llm/validate.js")
);

const cards = JSON.parse(readFileSync(path.join(goc, "data/cards.source.json"), "utf8")).cards;
const tenTheoId = new Map(cards.map((c) => [c.id, c.ten_vi]));

/* Ca hỏng đã dựng nên bản sửa này, giữ sẵn để chạy lại cho nhanh. */
const CA = {
  dayThem: {
    trai: "nam-la-cong-viec",
    linhVuc: "work",
    hoi: "bận đi làm trở lại, bận chăm con, có nên dạy thêm tại nhà nữa không?",
    la: "coin_03n,cup_07,major_12,cup_06,major_18n",
  },
  doiViec: {
    trai: "nam-la-chon-huong",
    linhVuc: "work",
    hoi: "Nên nhận offer bên kia hay ở lại chỗ cũ",
    la: "major_01,cup_05,wand_07,major_16,cup_04",
  },
  thangToi: {
    trai: "nam-la-thang-toi",
    linhVuc: "mind",
    hoi: "Tháng tới của mình thế nào",
    la: "cup_01,cup_10n,major_03,major_15,major_14",
  },
};

function docThamSo(argv) {
  const ra = {};
  for (let i = 0; i < argv.length; i += 2) ra[argv[i].replace(/^--/, "")] = argv[i + 1];
  return ra;
}

const ts = docThamSo(process.argv.slice(2));
const ca = ts.ca ? CA[ts.ca] : null;
if (ts.ca && !ca) {
  console.error(`Không có ca "${ts.ca}". Có: ${Object.keys(CA).join(", ")}`);
  process.exit(1);
}

const trai = ts.trai ?? ca?.trai;
const hoi = ts.hoi ?? ca?.hoi ?? "";
const moTaLa = ts.la ?? ca?.la;
const linhVuc = ts.linhVuc ?? ca?.linhVuc ?? "general";
const soLan = Number(ts.lan ?? 1);

if (!trai || !moTaLa) {
  console.error("Thiếu --trai và --la, hoặc dùng --ca <tên>.");
  process.exit(1);
}

/* Hậu tố n là lá ngược, cho gọn khi gõ tay: coin_03n, major_18n. */
const la = moTaLa.split(",").map((x) => {
  const nguoc = x.endsWith("n");
  const id = nguoc ? x.slice(0, -1) : x;
  const ten = tenTheoId.get(id);
  if (!ten) throw new Error(`Không có lá ${id}`);
  return { slug: slugOf(ten), reversed: nguoc, ten };
});

const kb = new KbService();
const llm = new LlmService();
if (!llm.hasProvider()) {
  console.error(
    "Chưa có nhà cung cấp LLM nào. Đặt DEEPSEEK_API_KEY (hoặc ANTHROPIC_API_KEY,\n" +
      "OPENAI_API_KEY) trong api/.env rồi chạy lại.",
  );
  process.exit(1);
}

const guard = detectGuard(hoi);
const req = { spreadSlug: trai, question: hoi, topic: linhVuc, cards: la, guard };
const spread = kb.spread(trai);
const messages = kb.buildMessages(req);
const budget = Math.ceil(spread.do_dai.max * 4) + 300;

console.log(`\nTrải: ${spread.ten_vi}  |  lĩnh vực: ${linhVuc}  |  chủ đề cấm: ${guard?.kind ?? "không"}`);
console.log(`Hỏi: ${hoi || "(không có câu hỏi)"}`);
console.log(
  "Lá:  " +
    la.map((c, i) => `${i + 1}. ${c.ten}${c.reversed ? " (ngược)" : ""}`).join("  |  "),
);
console.log(
  `Prompt: ${messages.length} lượt, ${messages.reduce((n, m) => n + m.content.length, 0)} ký tự` +
    `${messages.some((m) => m.role === "assistant") ? ", có bài mẫu few-shot" : ", không bài mẫu"}`,
);

for (let lan = 1; lan <= soLan; lan++) {
  console.log(`\n${"=".repeat(72)}\nLƯỢT ${lan}/${soLan}\n${"=".repeat(72)}`);
  const t0 = Date.now();
  const { text, provider, model } = await llm.chat(messages, budget);

  const raw = parseParts(text);
  const parts = raw
    ? {
        toanCanh: stripStockLabels(raw.toanCanh),
        theoViTri: raw.theoViTri.map((p) => ({ ...p, doan: stripStockLabels(p.doan) })),
        ket: stripStockLabels(raw.ket),
      }
    : null;
  const essay = parts ? flatten(parts) : stripStockLabels(text);

  if (parts) {
    console.log(`\n[mở]  ${parts.toanCanh}`);
    for (const p of parts.theoViTri) {
      const vt = spread.vi_tri.find((v) => v.stt === p.stt);
      console.log(`\n[${p.stt}. ${vt?.ten ?? "?"}]  ${p.doan}`);
    }
    console.log(`\n[chốt]  ${parts.ket}`);
  } else {
    console.log("\nKhuôn hỏng, mô hình không trả JSON:\n");
    console.log(essay);
  }

  const loi = checkEssay(essay, spread.do_dai, { question: hoi, parts, guard: !!guard });
  if (!parts) loi.push({ rule: "khuôn", detail: "không trả về khối JSON" });

  console.log(
    `\n— ${countWords(essay)} tiếng (khung ${spread.do_dai.min}–${spread.do_dai.max}), ` +
      `${((Date.now() - t0) / 1000).toFixed(1)}s, ${provider}/${model}`,
  );
  if (loi.length) {
    console.log(`— ${loi.length} vi phạm:`);
    for (const v of loi) console.log(`   • ${v.rule}: ${v.detail}`);
  } else {
    console.log("— không vi phạm luật nào máy soát được");
  }
}

console.log(
  "\nMáy chỉ soát được T2, T3, T6, T7. Còn phải đọc tay:\n" +
    "  T1  chốt lại có nghiêng rõ và có điều kiện lật lại không\n" +
    "  T4  ô điểm mạnh có mở bằng mặt dùng được không\n" +
    "  T5  câu có chữ nữa/tiếp/lại có được đọc là tiếp-hay-dừng không\n" +
    "  T8  câu mở có tiết lộ kết luận phía dưới không\n",
);
