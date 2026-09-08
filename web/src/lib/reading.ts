import {
  getCard,
  motionOfCard,
  MOTION_LABEL,
  MOTION_RANK,
  WEIGHT_RANK,
  type Lean,
  type Suit,
  type TarotCard,
} from "./cards";
import { applyUprightOnly, type DrawnCard } from "./draw";
import { detectGuard, type Guard } from "./guard";
import {
  getSpread,
  type Spread,
  type SpreadPosition,
  type TopicKey,
} from "./spreads";
import type { ReadingState } from "./share";

export interface ReadCard {
  card: TarotCard;
  reversed: boolean;
  position: SpreadPosition;
  index: number;
}

export interface Reading {
  spread: Spread;
  question: string;
  topic: TopicKey;
  cards: ReadCard[];
  intro: string;
  body: string[];
  closing: string;
  lean?: { key: Lean; label: string };
  /** Câu hỏi rơi vào nhóm bài không trả lời; bài đọc chuyển sang nói về tâm thế */
  guard?: Guard;
}

const SUIT_TONE: Record<Suit, string> = {
  coc: "chuyện này chạy bằng cảm xúc, không bằng lý",
  gay: "chuyện này đang đòi bạn làm chứ không đòi bạn nghĩ",
  kiem: "chuyện này nằm ở cái đầu: lời nói, suy nghĩ và cái bạn đang tự kể cho mình",
  tien: "chuyện này rất cụ thể: tiền, việc, chỗ đứng, những thứ sờ được",
};

const SUIT_NOUN: Record<Suit, string> = {
  coc: "Cốc",
  gay: "Gậy",
  kiem: "Kiếm",
  tien: "Tiền",
};

const LEAN_LABEL: Record<Lean, string> = {
  yes: "Nghiêng về có",
  no: "Nghiêng về không",
  mixed: "Chưa ngã ngũ",
};

const CLOSING_ACTION: Record<Suit | "major", string[]> = {
  tien: [
    "Tuần này ngồi xuống viết ra từng khoản một, cái bạn được và cái bạn mất nếu đổi, rồi hỏi thẳng một người đang ở chỗ bạn muốn tới.",
    "Tuần này mở sổ ra và nhìn con số thật, không nhìn con số bạn nhớ. Quyết sau khi thấy nó.",
  ],
  coc: [
    "Tuần này nói ra một câu bạn vẫn giữ trong bụng, với đúng người cần nghe, và nói lúc bạn đang tỉnh chứ không lúc đang tủi.",
    "Tuần này cho mình một buổi không giải thích với ai cả, chỉ ngồi xem mình thật sự muốn gì.",
  ],
  kiem: [
    "Tuần này viết ra đúng cái bạn sợ, từng dòng một, rồi đọc lại vào buổi sáng xem còn bao nhiêu dòng đứng vững.",
    "Tuần này hỏi thẳng một câu bạn vẫn né, và chịu nghe hết câu trả lời chứ không cắt ngang.",
  ],
  gay: [
    "Tuần này chọn việc nhỏ nhất trong đống đó và làm cho xong trong ba ngày, đừng chọn việc oai nhất.",
    "Tuần này bắt đầu một lần cho ra bắt đầu: đặt lịch, nhắn tin, nộp hồ sơ, một hành động có ngày giờ.",
  ],
  major: [
    "Tuần này đừng chốt gì lớn. Gom cho đủ dữ kiện đã, rồi hẵng tính chuyện quyết.",
    "Tuần này để chuyện tự chạy một nhịp và quan sát nó, thay vì cố bẻ lái ngay.",
  ],
};

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(arr: T[], seed: number) {
  return arr[seed % arr.length];
}

function joinList(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} và ${items[items.length - 1]}`;
}

/**
 * Lá ngược luôn kéo kết luận về giữa: lá nhẹ ngược là cái nhẹ đang bị chặn,
 * lá nặng ngược là cái nặng đang dịu, lá vừa ngược thì vẫn chưa ngã ngũ.
 */
function flipLean(lean: Lean, reversed: boolean): Lean {
  return reversed ? "mixed" : lean;
}

/** Hạ chữ cái đầu để ghép được vào giữa câu, giữ nguyên các chữ hoa còn lại. */
function lowerFirst(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

const TOPIC_PHRASE: Record<Exclude<TopicKey, "general">, string> = {
  love: "chuyện tình cảm",
  work: "chuyện công việc",
  money: "chuyện tiền bạc",
  mind: "chuyện tâm lý",
  study: "chuyện học hành",
};

/** Tóm cả trải bài thành một đoạn mở đầu: bộ nào trội, mấy lá Ẩn Chính, mấy lá ngược. */
function buildIntro(cards: ReadCard[], spread: Spread, seed: number) {
  const majors = cards.filter((c) => c.card.arcana === "major");
  const reversed = cards.filter((c) => c.reversed);
  const suitCount = new Map<Suit, number>();
  for (const c of cards) {
    if (c.card.suit)
      suitCount.set(c.card.suit, (suitCount.get(c.card.suit) ?? 0) + 1);
  }
  const top = [...suitCount.entries()].sort((a, b) => b[1] - a[1])[0];

  const parts: string[] = [];

  /* Một lá thì không có gì để so tỉ lệ, nói thẳng lá đó là gì. */
  if (cards.length === 1) {
    const only = cards[0];
    const kind =
      only.card.arcana === "major"
        ? "một lá Ẩn Chính"
        : `một lá bộ ${SUIT_NOUN[only.card.suit!]}`;
    const tone =
      only.card.arcana === "major"
        ? "Ẩn Chính nghĩa là chuyện này lớn hơn một tình huống thường ngày, và phần lớn nó không nằm trong tay bạn quyết trong một hôm."
        : `Đây là bộ nói chuyện thường ngày, nên ${SUIT_TONE[only.card.suit!]}.`;
    parts.push(
      `Bài đưa ra ${kind}${only.reversed ? ", lá ngược" : ""}: ${only.card.vi}. ${tone}`,
    );
    if (only.reversed) {
      parts.push(
        "Lá rơi ngược, tức là mạch của nó đang bị chặn hoặc đang quay vào bên trong chứ không chảy thẳng ra ngoài.",
      );
    }
    return parts.join(" ");
  }

  if (majors.length >= Math.ceil(cards.length / 2)) {
    parts.push(
      `Trải này nhiều Ẩn Chính, ${majors.length} trên ${cards.length} lá. Chuyện đang lớn hơn một tình huống đời thường, và phần lớn nó không nằm trong tay bạn quyết trong một ngày.`,
    );
  } else if (top && top[1] >= Math.max(2, Math.ceil(cards.length / 2))) {
    parts.push(
      `Bộ ${SUIT_NOUN[top[0]]} chiếm ${top[1]} trên ${cards.length} lá, nên ${SUIT_TONE[top[0]]}.`,
    );
  } else {
    parts.push(
      `Trải này không nghiêng hẳn về bộ nào, ${cards.length} lá đến từ nhiều phía khác nhau. Chuyện đang bị kéo bởi vài lực cùng lúc chứ không phải một nguyên nhân duy nhất.`,
    );
  }

  if (reversed.length === 0) {
    parts.push(
      "Không có lá nào ngược, mạch chạy khá thẳng và cái gì cũng ở đúng chiều của nó.",
    );
  } else if (reversed.length >= Math.ceil(cards.length / 2)) {
    parts.push(
      `Có tới ${reversed.length} lá ngược, tức là nhiều thứ đang bị chặn hoặc bị vặn khỏi chiều tự nhiên; cái cản nằm bên trong nhiều hơn bên ngoài.`,
    );
  } else {
    parts.push(
      `Có ${reversed.length} lá ngược, đủ để nói rằng một phần của chuyện đang không chảy đúng chiều.`,
    );
  }

  /* Trải nhiều lá thì bỏ câu điểm tên, vì thân bài đã gọi tên từng lá rồi. */
  if (cards.length >= 5) return parts.join(" ");

  const names = joinList(cards.slice(0, 3).map((c) => c.card.vi));
  parts.push(
    pick(
      [
        `Mạch của ${spread.name.toLowerCase()} mở ra bằng ${names}, và ba lá đó đã đặt sẵn giọng cho cả bài.`,
        `Nhìn tổng thể, ${names} là chỗ chuyện bắt đầu lộ ra rõ nhất.`,
      ],
      seed,
    ),
  );

  return parts.join(" ");
}

function buildParagraph(c: ReadCard, topic: TopicKey, seed: number) {
  const { card, reversed, position } = c;
  /* Vài vị trí luôn đọc bằng một lăng kính cố định bất kể câu hỏi thuộc lĩnh vực nào. */
  const lens: TopicKey = position.lens ?? topic;
  const head = `${position.label} là ${card.vi}${reversed ? ", lá ngược" : ""}.`;
  const core = firstSentence(reversed ? card.skewed : card.core);
  const keys = (reversed ? card.reversed : card.upright).slice(0, 3).join(", ");

  const tie =
    lens === "general"
      ? pick(
          [
            `Vị trí này hỏi ${position.meaning}, và câu trả lời đọng lại ở ${keys}.`,
            `Ở đây bài đang nói về ${position.meaning}, và nó nói bằng ${keys}.`,
            `Chỗ này là ${position.meaning}, nên mạch của lá đọc ra thành ${keys}.`,
          ],
          seed + c.index,
        )
      : pick(
          [
            `Trong ${TOPIC_PHRASE[lens]}, lá này thành ra: ${lowerFirst(aspectHalf(card, lens, reversed))}.`,
            `Áp vào ${TOPIC_PHRASE[lens]} của bạn: ${lowerFirst(aspectHalf(card, lens, reversed))}.`,
            `Vị trí này hỏi ${position.meaning}, và câu trả lời là: ${lowerFirst(aspectHalf(card, lens, reversed))}.`,
          ],
          seed + c.index,
        );

  return `${head} ${core} ${tie}`;
}

/**
 * Câu gọn cho những lá chỉ cần nhắc một dòng khi gom cụm. Vị trí nào có lăng
 * kính riêng thì lấy mệnh đề đầu của nghĩa theo lăng kính đó cho đúng vai,
 * còn lại thì dùng từ khoá.
 */
/** Ý đầu của một đoạn; dữ liệu gốc viết hai ba câu, bài đọc chỉ lấy ý dẫn. */
function firstSentence(t: string) {
  const m = t.match(/^[^.]+\./);
  return (m ? m[0] : t).trim();
}

/**
 * Nghĩa theo lĩnh vực trong dữ liệu gốc viết dạng "nghĩa xuôi; ngược thì ...",
 * nên lấy đúng nửa hợp với chiều lá thay vì đọc cả hai.
 */
function aspectHalf(
  card: TarotCard,
  lens: Exclude<TopicKey, "general">,
  reversed: boolean,
) {
  const [up, down] = card.aspects[lens].split(";").map((t) => t.trim());
  const half = reversed && down ? down.replace(/^ngược thì\s*/i, "") : up;
  return half.replace(/\.$/, "");
}

function briefSentence(c: ReadCard, topic: TopicKey) {
  const { card, reversed, position } = c;
  const lens: TopicKey = position.lens ?? topic;
  const head = `${position.label} là ${card.vi}${reversed ? " ngược" : ""}`;

  if (position.lens && lens !== "general") {
    const clause = firstSentence(aspectHalf(card, lens, reversed)).replace(
      /\.$/,
      "",
    );
    if (clause) return `${head}: ${lowerFirst(clause)}.`;
  }
  const keys = (reversed ? card.reversed : card.upright).slice(0, 2).join(", ");
  return `${head}, ${keys}.`;
}

/**
 * Thập tự Celtic không đọc tuần tự mười lá. Gom thành bốn cụm: tâm điểm và
 * cái cắt ngang, đường từ gốc tới đoạn sắp tới, trong và quanh người hỏi,
 * rồi kết cục. Lá 1, 2, 6, 10 là then chốt nên nói kỹ, sáu lá còn lại một câu.
 */
function buildCelticBody(cards: ReadCard[], topic: TopicKey, seed: number) {
  const at = (i: number) => cards[i];
  const out: string[] = [];

  out.push(
    [buildParagraph(at(0), topic, seed), buildParagraph(at(1), topic, seed)]
      .filter(Boolean)
      .join(" "),
  );

  out.push(
    [
      briefSentence(at(2), topic),
      briefSentence(at(3), topic),
      briefSentence(at(4), topic),
      buildParagraph(at(5), topic, seed),
    ]
      .filter(Boolean)
      .join(" "),
  );

  const seven = at(6);
  const nine = at(8);
  const clash =
    seven &&
    nine &&
    motionOfCard(seven.card, seven.reversed) !==
      motionOfCard(nine.card, nine.reversed)
      ? " Chỗ đáng nói nhất là đầu và lòng đang vênh nhau, cái bạn tự thấy về mình không khớp với cái bạn vừa mong vừa sợ."
      : "";
  out.push(
    [
      briefSentence(at(6), topic),
      briefSentence(at(7), topic),
      briefSentence(at(8), topic),
    ]
      .filter(Boolean)
      .join(" ") + clash,
  );

  out.push(buildParagraph(at(9), topic, seed));
  return out.filter(Boolean);
}

/** Trải tháng tới mở bài bằng lá chủ đề rồi mới đi qua bốn tuần. */
function buildMonthBody(cards: ReadCard[], topic: TopicKey, seed: number) {
  const theme = cards[4];
  const weeks = cards.slice(0, 4);
  const out: string[] = [];

  if (theme) {
    out.push(
      /* Lá chủ đề là lá duy nhất được nói đủ, vì cả bài mở và kết bằng nó. */
      `Chủ đề của tháng là ${theme.card.vi}${theme.reversed ? ", lá ngược" : ""}. ${
        theme.reversed ? theme.card.skewed : theme.card.core
      } Cả tháng xoay quanh chuyện đó, và bốn tuần dưới đây là bốn đoạn của nó.`,
    );
  }
  if (weeks.length) {
    out.push(
      weeks
        .slice(0, 2)
        .map((c) => buildParagraph(c, topic, seed))
        .join(" "),
    );
    out.push(
      weeks
        .slice(2)
        .map((c) => buildParagraph(c, topic, seed))
        .join(" "),
    );
  }
  return out.filter(Boolean);
}

/** Trải chọn hướng đọc thành gốc phân vân, rồi từng nhánh một. */
function buildBranchBody(cards: ReadCard[], topic: TopicKey, seed: number) {
  const out: string[] = [];
  if (cards[0]) out.push(buildParagraph(cards[0], topic, seed));
  if (cards[1] && cards[2]) {
    out.push(
      `${briefSentence(cards[1], topic)} ${buildParagraph(cards[2], topic, seed)}`,
    );
  }
  if (cards[3] && cards[4]) {
    out.push(
      `${briefSentence(cards[3], topic)} ${buildParagraph(cards[4], topic, seed)}`,
    );
  }
  return out.filter(Boolean);
}

/**
 * So hai lá đích của trải chọn hướng. Chiều đi quyết trước, chỉ khi hai nhánh
 * cùng chiều mới xét tới trọng lượng của lá.
 */
function compareBranches(cards: ReadCard[]) {
  const a = cards[2];
  const b = cards[4];
  if (!a || !b) return null;

  const ma = motionOfCard(a.card, a.reversed);
  const mb = motionOfCard(b.card, b.reversed);

  let side: "A" | "B" | null = null;
  if (MOTION_RANK[ma] !== MOTION_RANK[mb]) {
    side = MOTION_RANK[ma] > MOTION_RANK[mb] ? "A" : "B";
  } else if (WEIGHT_RANK[a.card.weight] !== WEIGHT_RANK[b.card.weight]) {
    /* Cùng chiều thì lá nhẹ hơn là hướng đỡ phải trả giá hơn. */
    side = WEIGHT_RANK[a.card.weight] > WEIGHT_RANK[b.card.weight] ? "A" : "B";
  }

  const compare = `So hai đích thì ${a.card.vi} là ${MOTION_LABEL[ma]}, còn ${b.card.vi} là ${MOTION_LABEL[mb]}.`;
  if (!side) {
    return `${compare} Hai bên ngang nhau nên bài chưa nghiêng về đâu; cái cần làm rõ trước khi chọn nằm ở lá gốc, ${cards[0]?.card.vi ?? "lá đầu"}. Bài không chọn thay bạn.`;
  }
  const win = side === "A" ? a : b;
  const lose = side === "A" ? b : a;
  const loseGist = lowerFirst(lose.card.core.split(".")[0].trim());
  return `${compare} Bài nghiêng về hướng ${side}, vì hướng đó còn chỗ để đi chứ không đứng lại. Cái giá của nó là những gì ${win.card.vi} đòi bạn mang theo; hướng còn lại không sai, chỉ là ${loseGist}. Bài không chọn thay bạn.`;
}

/**
 * Luật gom cụm của từng kiểu trải: mỗi phần tử là một đoạn, `g` là các lá
 * trong đoạn đó, `brief` là những lá chỉ nhắc một câu thay vì nói kỹ.
 */
const BODY_PLAN: Record<string, { g: number[]; brief?: number[] }[]> = {
  // Lá hai là trục; lá một chỉ giải thích vì sao chuyện đang ở đó
  "ba-la-thoi-gian": [{ g: [0] }, { g: [1] }, { g: [2] }],
  // Lá một và lá hai là cặp then chốt; lá ba và bốn gom thành cái giữ và cái kéo
  "nam-la-tinh-cam": [{ g: [0, 1] }, { g: [2, 3], brief: [2, 3] }, { g: [4] }],
  // Gom cái đang có với cái đang giữ chân; lá bốn nhắc một câu
  "nam-la-cong-viec": [
    { g: [0] },
    { g: [1, 2] },
    { g: [3], brief: [3] },
    { g: [4] },
  ],
  // Lá hai và lá ba là cặp then chốt, đi chung một đoạn
  "bon-la-tien-bac": [{ g: [0] }, { g: [1, 2] }, { g: [3] }],
};

function runPlan(
  plan: { g: number[]; brief?: number[] }[],
  cards: ReadCard[],
  topic: TopicKey,
  seed: number,
) {
  return plan
    .map(({ g, brief }) =>
      g
        .map((i) =>
          cards[i]
            ? brief?.includes(i)
              ? briefSentence(cards[i], topic)
              : buildParagraph(cards[i], topic, seed)
            : "",
        )
        .filter(Boolean)
        .join(" "),
    )
    .filter(Boolean);
}

/** Chọn cách dựng thân bài theo kiểu trải; mặc định là mỗi lá một đoạn. */
function buildBody(
  cards: ReadCard[],
  spread: Spread,
  topic: TopicKey,
  seed: number,
) {
  const plan = BODY_PLAN[spread.slug];
  if (plan) return runPlan(plan, cards, topic, seed);
  if (spread.layout === "cross" && cards.length >= 10)
    return buildCelticBody(cards, topic, seed);
  if (spread.layout === "month" && cards.length >= 5)
    return buildMonthBody(cards, topic, seed);
  if (spread.layout === "branch" && cards.length >= 5)
    return buildBranchBody(cards, topic, seed);
  return cards.map((c) => buildParagraph(c, topic, seed));
}

function buildClosing(
  cards: ReadCard[],
  spread: Spread,
  topic: TopicKey,
  seed: number,
) {
  const suitCount = new Map<Suit | "major", number>();
  for (const c of cards) {
    const k = c.card.suit ?? "major";
    suitCount.set(k, (suitCount.get(k) ?? 0) + 1);
  }
  const top = [...suitCount.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const last = cards[cards.length - 1];
  const action = pick(CLOSING_ACTION[top], seed);

  /* Chọn hướng thì kết bằng so sánh hai lá đích, không phán nhánh nào chắc ăn. */
  if (spread.layout === "branch") {
    const compared = compareBranches(cards);
    if (compared) {
      /* Việc cuối phải giúp nhìn rõ hơn trước khi chọn, không phải giục chọn. */
      const step = pick(
        [
          "Tuần này hỏi một người đang sống đúng hướng bài nghiêng về xem tháng đầu họ phải chịu gì.",
          "Tuần này thử bước nhỏ nhất của hướng đang nghiêng, bước nào rút lại được, rồi xem mình nhẹ hay nặng thêm.",
          "Tuần này viết ra cái bạn sợ mất ở mỗi hướng, từng dòng một, rồi đọc lại vào buổi sáng xem dòng nào còn đứng vững.",
        ],
        seed,
      );
      return `${compared} ${step}`;
    }
  }

  /* Tháng tới quay về lá chủ đề để nói cái nên giữ suốt cả tháng. */
  if (spread.layout === "month" && cards[4]) {
    const theme = cards[4];
    return `Giữ lấy mạch của ${theme.card.vi} cho cả tháng, đó là thứ nối bốn tuần lại với nhau chứ không phải từng tuần rời. ${action}`;
  }

  const verdict = pick(
    [
      `Bài không hứa chắc điều gì, và cũng không bảo bạn phải làm theo. Nó chỉ nói chuyện đang nghiêng theo hướng của ${last.card.vi}${last.reversed ? " ngược" : ""}, và cái quyết định phần còn lại vẫn là bạn.`,
      `Gộp lại thì bài đang chỉ về phía ${last.card.vi}${last.reversed ? " ngược" : ""}: đó là nơi mạch này dẫn tới nếu không có gì đổi.`,
    ],
    seed + cards.length,
  );

  return `${verdict} ${action}`;
}

export function composeReading(state: ReadingState): Reading | null {
  const spread = getSpread(state.spread);
  if (!spread) return null;

  const cards: ReadCard[] = [];
  const drawn = applyUprightOnly(spread, state.cards.slice(0, spread.count));
  drawn.forEach((d: DrawnCard, i) => {
    const card = getCard(d.slug);
    if (!card) return;
    cards.push({
      card,
      reversed: d.reversed,
      position: spread.positions[i] ?? {
        label: `Lá ${i + 1}`,
        meaning: "vị trí này",
      },
      index: i,
    });
  });
  if (!cards.length) return null;

  const seed = hash(
    `${state.spread}|${state.question}|${cards.map((c) => c.card.slug + (c.reversed ? "!" : "")).join(",")}`,
  );

  /* Câu hỏi chạm nhóm cấm thì bài không kết luận, chỉ đọc lá theo tâm thế. */
  const guard = detectGuard(state.question) ?? undefined;
  const topic = guard ? "mind" : state.topic;
  if (guard) {
    /* Nhóm cấm thì bỏ mọi lăng kính riêng của vị trí, chỉ đọc theo tâm thế. */
    for (const c of cards) c.position = { ...c.position, lens: undefined };
  }

  const reading: Reading = {
    spread,
    question: state.question,
    topic,
    cards,
    intro: buildIntro(cards, spread, seed),
    body: buildBody(cards, spread, topic, seed),
    closing: buildClosing(cards, spread, topic, seed),
    guard,
  };

  /* Không kết luận có hay không cho những câu thuộc nhóm cấm. */
  if (spread.yesNo && !guard) {
    const key = flipLean(cards[0].card.lean, cards[0].reversed);
    reading.lean = { key, label: LEAN_LABEL[key] };
  }

  return reading;
}

export { LEAN_LABEL };

/** Câu hỏi thêm: rút một lá làm rõ và trả lời gọn trong một đoạn. */
export function composeFollowUp(
  question: string,
  card: TarotCard,
  reversed: boolean,
  topic: TopicKey,
) {
  const seed = hash(question + card.slug + (reversed ? "!" : ""));
  const opener = pick(
    [
      `Cho câu này, bài đưa ra ${card.vi}${reversed ? " ngược" : ""}.`,
      `Lá làm rõ cho câu này là ${card.vi}${reversed ? " ngược" : ""}.`,
      `Rút thêm một lá cho câu này thì ra ${card.vi}${reversed ? " ngược" : ""}.`,
    ],
    seed,
  );
  const core = firstSentence(reversed ? card.skewed : card.core);
  const detail =
    topic === "general"
      ? `cái đọng lại là ${(reversed ? card.reversed : card.upright).slice(0, 3).join(", ")}.`
      : lowerFirst(aspectHalf(card, topic, reversed));
  const tail = pick(
    [
      "Đó là phần bạn nắm được; phần còn lại thì đợi thêm dữ kiện rồi hẵng tính.",
      "Giữ đúng một việc đó thôi, đừng ôm thêm trong tuần này.",
      "Nếu chỉ nhớ một câu từ bài này thì nhớ câu vừa rồi.",
    ],
    seed + 7,
  );
  return `${opener} ${core} Áp vào câu bạn hỏi: ${detail} ${tail}`;
}
