"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { TarotCardFace } from "@/components/TarotCardFace";
import { buttonClass } from "@/components/ui";
import { spotOf, type DeckSpot } from "./deck-spot";
import {
  autoShuffle,
  cutDeck,
  mixSeed,
  mulberry32,
  overhand,
  riffle,
  type DrawnCard,
} from "@/lib/draw";


/** Số lá vẽ trong chồng. Đủ dày để thấy bề dày cỗ, ít để còn chạy mượt. */
const STACK = 18;

/** Bề dày một lá, tính bằng px chiều sâu. */
const ZSTEP = 2.4;

/** Chồng đang cắt được nhấc khỏi mặt cỗ ngần này. */
const LIFT = 22;

/** Mặt bàn ngả đi bấy nhiêu độ, để nhìn cỗ bài chéo từ trên xuống. */
const TILT = 52;

/**
 * Kéo trên màn một px thì trong mặt bàn đi được ngần này. Bàn ngả 52° nên
 * chiều sâu bị nén còn cos(52°) ≈ 0,62 — muốn chồng bài chạy kịp ngón tay thì
 * phải bù ngược lại.
 */
const PULL_SCALE = 1 / Math.cos((TILT * Math.PI) / 180);

/**
 * Kéo dọc hết cỡ là ngần này px. Phải quá được chiều cao một lá bài thì tệp mới
 * ra khỏi hẳn bóng cỗ: 144px kéo trên màn thành 234px trong mặt bàn, hơn 192px
 * bề cao lá bài một phần năm — vừa đủ để cỗ tụt hẳn xuống và để tệp có quãng
 * mà nhấc lên trước khi quay về.
 *
 * Ra khỏi hẳn rồi mới có chỗ mà nhấc tệp lên nóc. Còn nằm đè lên nhau mà nhấc
 * thì tệp lách ngang qua giữa cỗ, nhìn thành nhét vào ruột chứ không phải
 * chồng lên trên — mà chồng lên trên mới đúng là tráo dồn.
 *
 * Trần trên là bề cao khung: tệp kéo tới đáy còn nở to ra vì đi sát mắt nhìn,
 * quá nữa là nó trùm lên dòng chữ nhắc ở dưới.
 */
const PULL_MAX = 144;

/** Bề ngang và bề cao một lá bài, đúng bằng lớp w-[128px] h-[192px] ở dưới. */
const CARD_W = 128;
const CARD_H = 192;

/**
 * Lá bài nở ra ngần này lần khi nằm ở mép dưới cỗ — chỗ gần mắt nhìn nhất trên
 * mặt bàn đang ngả. Đo trên máy: lá rộng 128 hiện ra thành 138.
 */
const CARD_MAG = 1.08;

/** Chừa lại ngần này px trước khi lá bài chạm mép màn. */
const EDGE_PAD = 8;

/**
 * Bóng cỗ bài lệch khỏi chân cỗ ngần này, tính trong mặt bàn. Cả màn chỉ có một
 * ngọn đèn, chếch trên bên trái, nên bóng phải đổ xuống chếch dưới bên phải —
 * bóng nằm đúng tâm thì thành ra cỗ bài tự phát sáng từ dưới lên.
 */
const SHADOW_X = 7;
const SHADOW_Y = 10;

/**
 * Lề trang hai bên khung cỗ bài, đúng bằng lớp px-5 bọc ngoài. Lá bài tràn ra
 * đây được — chỗ đó có gì đâu — nên nó tính vào chỗ trống để tách cỗ.
 */
const PAGE_PAD = 20;

/**
 * Kéo ngang được xa tới đâu thì tuỳ bề ngang màn, vì cỗ tách ra rộng được đến
 * đâu là do màn chứa được đến đấy. Hai chồng dạt đều hai bên nên chúng rời nhau
 * bằng hai lần quãng kéo: qua 64px là hết gối lên nhau, quá nữa thì hở hẳn ra
 * một quãng mặt bàn.
 *
 * Sàn dưới tính cho màn 320px, ở đó vừa đủ rời nhau chứ không hở được mấy. Trần
 * trên đặt ở 112 để quãng kéo còn nằm trong tầm ngón cái — màn rộng thì tách xa
 * nữa cũng chẳng thêm được gì, mà lại bắt người ta quét tay cả gang.
 */
const CUT_MIN = 70;
const CUT_CAP = 112;

/**
 * Cắt cỗ thì phần còn lại dạt ngược lại ngần này lần quãng kéo. Nó phải nhích
 * ra nhường chỗ thì chồng vừa nhấc mới có nơi đặt xuống bên cạnh — đứng ỳ một
 * chỗ để chồng kia trườn qua thì đâu phải là tách cỗ làm hai.
 *
 * Dạt đúng bằng quãng kéo, tức hai chồng rời nhau đều hai bên. Ngón tay trên
 * màn hẹp không kéo nổi trọn một bề ngang lá bài, nên muốn cỗ hở hẳn ra thì
 * phần gốc phải góp một nửa quãng đường — bù lại cỗ tách ra mà vẫn nằm giữa
 * bàn, không chồng nào bị đẩy ra sát mép màn.
 */
const CUT_SPLIT = 1;

/** Kéo chưa tới đây thì chưa đủ thành một vòng hay một nhát cắt. */
const GRIP_MIN = 26;

/**
 * Bốc một tệp thì nhiều nhất cũng chỉ ngần này lá trong chồng vẽ. Bốc nửa cỗ
 * lên tay không phải là tráo dồn, mà là cắt — hai việc khác nhau.
 */
const GRAB_MAX = 7;

/**
 * Kéo xuống thì chồng bài dạt ngang thêm một quãng bằng ngần này lần quãng
 * kéo. Kéo thẳng xuống thì chồng nhấc lên che mất cỗ còn lại, mà bốc bài ngoài
 * đời có ai kéo thẳng vào bụng mình đâu — đưa nó chếch sang bên.
 */
const PULL_DRIFT = 0.45;

/** Ngón tay phải đi được ngần này mới coi là đang kéo, chứ không phải chạm hụt. */
const LOCK_SLOP = 10;

/** Đẩy chồng bài về sát cỗ tới ngần này là coi như đã nhập xong vào cỗ. */
const BACK_PX = 8;

/** Nhịp cỗ lún xuống rồi nảy lại lúc chồng bài nhập vào. */
const PASS_MS = 340;

/** Xào ít hơn ngần này lượt thì chưa cho cắt cỗ. */
const MIN_PASSES = 3;

/**
 * Đặt chồng xuống rồi chồng phần còn lại lên: nhấc lên hết bấy nhiêu, hạ xuống
 * hết bấy nhiêu. Chia làm hai nhịp chứ không trượt một đường, vì có nhìn thấy
 * phần gốc bay qua trên đầu chồng kia rồi đè xuống thì mới ra nhát cắt — trượt
 * thẳng sang thì chỉ thấy hai chồng nhập lại, chẳng biết ai nằm trên ai.
 */
const CUT_UP_MS = 280;
const CUT_DOWN_MS = 400;

/**
 * Phần gốc nhấc cao khỏi chỗ nó sắp đặt xuống ngần này px, và tới quãng này thì
 * lên tới đỉnh. Phải cao hơn hẳn bề dày chồng kia, kẻo nhìn ra thành đẩy ngang
 * chứ không phải nhấc qua.
 */
const CUT_ARC = 34;
const CUT_ARC_AT = 0.44;

/**
 * Buông tay giữa chừng thì tệp tự bay về nhập vào nóc cỗ: nhấc tại chỗ hết bấy
 * nhiêu, rồi trườn về nóc hết bấy nhiêu. Hai nhịp, cũng một lẽ với nhát cắt —
 * nhấc xong hẵng đi thì mới không lách ngang qua giữa cỗ.
 */
const MERGE_UP_MS = 180;
const MERGE_HOME_MS = 360;

/** Kéo hụt thì chồng bài trượt về chỗ cũ trong bấy nhiêu. */
const SNAP_MS = 280;

/** Cắt xong thì vỗ cỗ về giữa bàn cho gọn, hết bấy nhiêu. */
const SETTLE_MS = 380;

/** Tắt hiệu ứng thì mọi thứ về gần như tức thì, chỉ chừa một nhịp. */
const REDUCED_MS = 220;

/**
 * Bấm sang bàn bài thì chữ nghĩa trên màn xoá đi trước, hết bấy nhiêu, rồi mới
 * chuyển màn. Cỗ bài ở lại tới phút cuối để nó là thứ duy nhất đi tiếp — sang
 * bàn bài nó bay thẳng về góc trái, một mạch không đứt đoạn.
 */
const LEAVE_MS = 300;

/**
 * Màn xào hộ: bốn nhịp nối nhau, tổng cộng gần tám giây. `dur` là thời lượng
 * của một lá, `step` là quãng lệch giữa hai lá liền nhau — giãn ra thì cả cỗ
 * chảy thành dòng chứ không nhảy cùng một lúc. `ms` là chỗ đứng của nhịp trên
 * trục thời gian: nó phải lớn hơn 17 × step + dur, phần dôi ra là nhịp nghỉ để
 * lá cuối kịp rơi xong trước khi nhịp sau mở.
 *
 * Đây là màn để ngồi xem, không phải màn chờ, nên thà chậm còn hơn vội — mỗi
 * cử động kéo dài hẳn ra mới nhìn kịp nó làm gì.
 */
const CINEMA = [
  { keyframes: "t24-auto-overhand", dur: 860, step: 44, ms: 1720, say: "Đang tráo dồn…" },
  { keyframes: "t24-auto-riffle", dur: 1140, step: 20, ms: 1620, say: "Đang chẻ bài…" },
  { keyframes: "t24-auto-swirl", dur: 2040, step: 30, ms: 2660, say: "Đang xoáy bài…" },
  { keyframes: "t24-auto-cut", dur: 1220, step: 10, ms: 1500, say: "Đang cắt cỗ…" },
] as const;

/** Cả màn xào hộ, tính cả nhịp nghỉ cuối. */
const AUTO_MS = CINEMA.reduce((n, c) => n + c.ms, 0) + 260;

/**
 * Chỗ mỗi lá bay tới trong nhịp xoáy. Góc vàng cho các lá tản đều chứ không dồn
 * cục; ba điểm cùng nằm trên một hình bầu dục nhưng lệch pha, nên cả cỗ trông
 * như đang quay quanh một trục.
 */
const swirlVars = (i: number) => {
  const a = i * 2.39996;
  /*
    Bán kính chặn bởi bề ngang màn: lá bài rộng 128, lúc bốc lên gần mắt nhìn còn
    nở thêm chừng 6%, nên nửa lá đã ngốn 89px trong 180px nửa khung.
  */
  const at = (turn: number) => ({
    x: `${(Math.cos(a + turn) * 72).toFixed(1)}px`,
    y: `${(Math.sin(a + turn) * 62).toFixed(1)}px`,
  });
  const p1 = at(0);
  const p2 = at(2.2);
  const p3 = at(4.4);
  return {
    "--x1": p1.x,
    "--y1": p1.y,
    "--r1": `${(Math.sin(a) * 26).toFixed(1)}deg`,
    "--x2": p2.x,
    "--y2": p2.y,
    "--r2": `${(Math.cos(a) * 22).toFixed(1)}deg`,
    "--x3": p3.x,
    "--y3": p3.y,
    "--r3": `${(Math.sin(a + 1) * 16).toFixed(1)}deg`,
  };
};

const prefersReduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Dấu để tìm lại từng lá lúc gắn hoạt cảnh. Phải là class chứ không phải thuộc
 * tính data-, vì TarotCardFace chỉ chuyển tiếp className xuống DOM.
 */
const CARD = "t24-deck-card";

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

/** Đường cong vào êm ra êm, để nhịp hạ chồng bài xuống bàn không cứng đơ. */
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Chỗ trống đo được đổi ra quãng kéo ngang xa nhất mà lá bài chưa lọt mép. */
const cutMaxFor = (rong: number) =>
  clamp(
    Math.round((rong / 2 - EDGE_PAD) / CARD_MAG - CARD_W / 2),
    CUT_MIN,
    CUT_CAP,
  );

/**
 * Nhát cắt nông nhất và sâu nhất, tính theo phần của cả cỗ. Cắt là chia cỗ làm
 * hai, nên hai phần đều phải ra tấm ra món: nhấc gần cả cỗ lên bỏ lại một lá
 * nằm trơ trên bàn thì đó không còn là nhát cắt.
 */
const CUT_LO = 0.26;
const CUT_HI = 0.74;

/**
 * Cái tay của một lần nắm: nhấc lên mấy lá. Gieo lúc bàn tay chạm vào cỗ, rồi
 * giữ nguyên suốt cú kéo — bốc dày mỏng bao nhiêu là quyết lúc luồn tay vào
 * giữa cỗ, chứ mang chồng bài ra xa thêm thì nó có dày thêm được đâu. Nhờ thế
 * mà kéo tới đâu hai chồng vẫn là hai chồng, không có lá nào đang yên lành lại
 * bị rút sang bên kia giữa đường.
 *
 * Chỉ để nhìn nên gieo bằng Math.random, không đụng vào chuỗi entropy quyết
 * định thứ tự cỗ bài: chỗ đi vào đó là độ sâu kéo tay và thời điểm thả.
 */
const tayCat = () =>
  clamp(
    Math.round((CUT_LO + Math.random() * (CUT_HI - CUT_LO)) * STACK),
    1,
    STACK - 1,
  );

/** Cái tay bốc của một vòng tráo dồn: rút ra mấy lá. */
const tayBoc = () => 2 + Math.floor(Math.random() * (GRAB_MAX - 1));

/** Chồng nhấc dày mấy lá thì đổi ra chỗ cắt trên cỗ bài thật. */
const cutAtFor = (chia: number, total: number) =>
  clamp(Math.round((chia / STACK) * total), 1, total - 1);

/**
 * Chỗ đứng ngang của phần gốc: lúc chưa cắt thì nó dạt ngược lại nhường chỗ,
 * nhịp nhấc lên thì đã đi được gần nửa đường qua chồng kia, nhịp hạ xuống thì
 * tới hẳn nơi. Lá bài và bóng đổ đọc chung một chỗ này để bóng khỏi đi lối
 * khác với cỗ bài.
 */
const gocXFor = (d: number, buoc: 0 | 1 | 2) =>
  buoc === 0
    ? -d * CUT_SPLIT
    : buoc === 1
      ? -d * CUT_SPLIT + d * (1 + CUT_SPLIT) * CUT_ARC_AT
      : d;

/**
 * Hai chồng cách nhau ngần này thì chồng nhấc đã hạ xuống mặt bàn được mấy
 * phần. Còn gối lên nhau quá nửa lá thì cứ giữ trên cao, hở ra được một phần tư
 * lá là đặt hẳn xuống — hạ sớm hơn thì nó cắm vào chồng kia.
 */
const datFor = (sep: number) =>
  smooth(clamp((sep - CARD_W * 0.75) / (CARD_W * 0.5), 0, 1));

/**
 * Tệp bốc lên tay đã trườn ra khỏi bóng cỗ được mấy phần: 1 là vừa vặn hết đè
 * lên nhau, hơn 1 là đã hở hẳn ra một quãng.
 */
const raFor = (deep: number) => (deep * PULL_SCALE) / CARD_H;

/**
 * Cỗ còn lại tụt xuống mặt bàn được mấy phần. Rút tệp ở đáy đi thì cỗ phải hạ
 * xuống nằm hẳn trên bàn chứ không treo lơ lửng, chừa một khoảng trống đúng
 * bằng tệp vừa đi. Chỉ tụt sau khi tệp đã ra hẳn: tụt sớm là cỗ lún vào đúng
 * chỗ tệp còn đang nằm, mấy lá đâm xuyên qua nhau.
 */
const tutFor = (deep: number) => smooth(clamp((raFor(deep) - 1) / 0.2, 0, 1));

/**
 * Kéo nông quá, tệp chưa kịp ra khỏi cỗ, thì nhấc gọn trong quãng này của
 * đường về.
 */
const RISE_MIN = 0.12;

/**
 * Đẩy về tới đâu thì tệp đã nhấc xong khỏi mặt bàn. Xong đúng lúc nó bắt đầu
 * trườn tới che lấy cỗ: sớm hơn thì thừa, muộn hơn là nó lách ngang qua giữa
 * cỗ. Tệp ở cách cỗ CARD_H thì vừa chạm mép, nên chỗ đó là 1 − 1/ra.
 */
const nhacFor = (deep: number, up: number) => {
  const ra = raFor(deep);
  return smooth(clamp(up / Math.max(ra > 1 ? 1 - 1 / ra : 0, RISE_MIN), 0, 1));
};

export interface ShuffleRitualProps {
  /** Cỗ bài lúc bắt đầu, tức là thứ tự nó nằm sau lượt đọc trước. */
  deck: DrawnCard[];
  /** Seed của lượt này: gieo chiều xuôi ngược ban đầu và chọn kiểu xào hộ. */
  seed: number;
  /** `from` là chỗ cỗ bài đang đứng trên màn, để bàn bài đón nó từ đúng đó. */
  onDone: (deck: DrawnCard[], from: DeckSpot | null) => void;
}

/**
 * Nghi thức xào bài: cỗ bài nằm nghiêng trên mặt bàn, người rút thao tác thẳng
 * lên nó, không qua nút nào.
 *
 * Hai chiều tay, hai việc, đúng như ngoài đời.
 *
 * Chồng bài trên tay dày mỏng bao nhiêu là gieo ngay lúc bàn tay chạm vào cỗ,
 * rồi giữ nguyên tới lúc buông — cả hai chiều đều thế. Bốc mấy lá là quyết lúc
 * luồn tay vào giữa cỗ, chứ mang chồng bài đi xa thêm thì nó có dày thêm được
 * đâu; kéo dài ngắn chỉ đổi chỗ đứng của chồng, không đổi ruột nó. Nhờ vậy kéo
 * tới đâu hai chồng vẫn cứ là hai chồng nguyên vẹn, không có lá nào đang nằm
 * yên trong chồng này lại bị rút sang chồng kia giữa đường.
 *
 * Kéo dọc là xào, đúng động tác tráo dồn: rút một tệp từ đáy cỗ ra, đưa lên
 * chồng vào nóc. Kéo xuống thì tệp trườn ra khỏi đáy, đẩy lên thì nó vừa về vừa
 * dâng lên trên cỗ, chạm tới nơi là xong một lượt. Mỗi lượt chạy một lần chẻ
 * bài hoặc tráo dồn thật trên chính mảng 78 lá, entropy lấy từ độ sâu vừa bốc,
 * chỗ ngón tay đặt và thời điểm. Một lần giữ tay làm được mấy vòng liền, mỗi
 * vòng một tay bốc khác.
 *
 * Kéo ngang là cắt: nhấc phần trên cỗ ra, phần còn lại dạt ngược lại đúng bấy
 * nhiêu, thành hai chồng rời hẳn nhau nằm cạnh nhau trên mặt bàn — chồng vừa
 * nhấc lên rồi cũng hạ xuống đặt cạnh chồng kia, cùng một mặt phẳng, nhìn vào
 * chẳng khác gì nhau ngoài dày mỏng. Thả tay ra thì phần gốc tự chồng lên phần
 * vừa nhấc. Vì cắt có đường riêng nên buông tay giữa chừng ở chiều dọc chẳng
 * cắt nhầm gì cả, tệp chỉ rơi trở lại vào cỗ.
 *
 * Kéo chuột và chạm ngón tay đi chung một đường qua Pointer Events. Ai không
 * kéo được thì có phím mũi tên đi đúng hai đường đó — dọc để xào, ngang để tách
 * cỗ ra rồi Enter là cắt — hoặc lối "xào giúp tôi" ở cuối màn.
 */
export function ShuffleRitual({ deck, seed, onDone }: ShuffleRitualProps) {
  const [phase, setPhase] = useState<"hand" | "auto">("hand");
  const [passes, setPasses] = useState(0);
  /**
   * Cái nắm tay đang diễn ra: `ngang` là đang cắt hay đang xào, `d` là quãng đã
   * kéo tính bằng px trên màn — chiều ngang có dấu để biết dạt sang trái hay
   * phải — và `chia` là chồng trên tay dày mấy lá. Chưa nắm gì thì null.
   */
  const [grip, setGrip] = useState<{
    ngang: boolean;
    d: number;
    /** Chồng đang cầm dày mấy lá. Gieo lúc nắm tay, giữ nguyên tới lúc buông. */
    chia: number;
    /**
     * Đang ở đâu trên nhịp đẩy về: 0 lúc còn rút tệp ra khỏi đáy cỗ, tới 1 khi
     * đã đưa nó về sát cỗ. Tệp vừa đi vừa dâng lên theo con số này, vì nó rút
     * ra từ đáy nhưng nhập lại vào nóc.
     */
    up: number;
    /**
     * Chỗ sâu nhất vòng này đã bốc tới. Độ dày tệp đọc ở đây chứ không đọc ở
     * quãng kéo hiện tại: bốc bao nhiêu lá là quyết lúc rút ra, chứ đẩy về mà
     * tệp mỏng dần đi thì hoá ra mấy lá rơi lại vào cỗ dọc đường.
     */
    deep: number;
  } | null>(null);
  /**
   * Nhịp đặt chồng bài đang ở đâu: 0 là chưa cắt, 1 là phần gốc đang nhấc lên
   * đưa qua, 2 là nó đang hạ xuống đè lên chồng vừa tách.
   */
  const [cutting, setCutting] = useState<0 | 1 | 2>(0);
  /**
   * Đã cắt ít nhất một nhát, tức là cỗ sẵn sàng cho bàn bài. Chỉ có nghĩa là
   * nút "bắt đầu rút" hiện ra chứ không khoá gì cả: cỗ bài vẫn nằm đó, xào
   * thêm hay cắt lại đều được, chừng nào người rút chưa bấm nút.
   */
  const [ready, setReady] = useState(false);
  /** Nhịp vỗ cỗ về giữa bàn ngay sau khi cắt. */
  const [settling, setSettling] = useState(false);
  /**
   * Nhịp tệp tự nhập vào nóc sau khi buông tay giữa chừng: 0 là không diễn, 1
   * là đang nhấc tại chỗ, 2 là đang trườn về nóc cỗ.
   */
  const [merging, setMerging] = useState<0 | 1 | 2>(0);
  const mergeTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  /** Kéo hụt hoặc kéo sớm thì cho chồng bài trượt về, có nhắc một câu. */
  const [snapping, setSnapping] = useState(false);
  const [tooSoon, setTooSoon] = useState(false);
  /** Nhịp thứ mấy của màn xào hộ đang chạy; -1 là không diễn gì. */
  const [cinema, setCinema] = useState(-1);
  /** Đang rời màn xào: chữ nghĩa xoá đi, chỉ cỗ bài ở lại đi tiếp. */
  const [leaving, setLeaving] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /*
    Cỗ bài và entropy nằm trong ref chứ không phải state: suốt bước này màn hình
    chỉ vẽ mười tám lá úp giống hệt nhau, thứ tự thật không ai nhìn thấy, nên
    đổi nó không đáng để dựng lại cả cây.
  */
  const deckRef = useRef(deck);
  const entropyRef = useRef(seed);

  const planeRef = useRef<HTMLDivElement>(null);
  /** Cái nắm tay dựng bằng bàn phím — bản sao có thể đọc ngay của `grip`. */
  const kb = useRef<{
    ngang: boolean;
    d: number;
    chia: number;
    deep: number;
  } | null>(null);

  /**
   * Kéo ngang xa nhất được bao nhiêu — đo thẳng bề ngang khung cỗ bài chứ không
   * hỏi bề ngang màn: khung mới là chỗ thật sự còn trống, và đo bằng
   * ResizeObserver thì xoay ngang máy, kéo cửa sổ hay đổi bố cục gì cũng bắt
   * được, không riêng lúc màn đổi khổ.
   */
  const boxRef = useRef<HTMLDivElement>(null);
  const [cutMax, setCutMax] = useState(CUT_MIN);
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const doLai = () => setCutMax(cutMaxFor(box.clientWidth + 2 * PAGE_PAD));
    doLai();
    const ro = new ResizeObserver(doLai);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  const total = deck.length;
  /** Quãng đã kéo, bỏ dấu đi. */
  const depth = grip ? Math.abs(grip.d) : 0;
  /** Số lá trong chồng đang cầm — đọc thẳng từ cái tay đã gieo lúc nắm. */
  const packet = grip?.chia ?? 0;
  /*
   * Chỗ cắt chỉ có nghĩa khi nhát cắt đó thật sự sẽ xuống: đang kéo ngang, đã
   * qua ngưỡng, và cỗ đã xào đủ. Thiếu một điều kiện là dòng nhắc hứa cắt mà
   * thả tay ra lại chẳng cắt gì.
   */
  const cutAt =
    grip?.ngang && depth >= GRIP_MIN && passes >= MIN_PASSES
      ? cutAtFor(grip.chia, total)
      : 0;

  /* ---------- Xào ---------- */

  /** Đang có hoạt cảnh chạy trên cỗ bài hay không. */
  const anim = useRef(false);

  /**
   * Gắn hoặc gỡ hoạt cảnh trên chính những lá đang có, khỏi dựng lại cả chồng.
   * Gỡ đi là chuyện bắt buộc chứ không phải dọn dẹp: hoạt cảnh đè lên transform
   * trong style, còn đang chạy mà người rút tách chồng tiếp thì bài không đi
   * theo tay được.
   */
  const setAnim = useCallback((value: string | ((i: number) => string) | null) => {
    const plane = planeRef.current;
    if (!plane) return;
    const cards = Array.from(plane.querySelectorAll<HTMLElement>(`.${CARD}`));
    for (const c of cards) c.style.animation = "none";
    anim.current = false;
    if (!value) return;
    /*
      Đọc một thuộc tính bố cục để trình duyệt chốt lại khung "không hoạt cảnh".
      Không có nhịp này thì gán lại đúng tên hoạt cảnh cũ sẽ không chạy lại, nên
      vòng thứ hai trở đi cỗ bài đứng im.
    */
    void plane.offsetWidth;
    cards.forEach((c, i) => {
      c.style.animation = typeof value === "string" ? value : value(i);
    });
    anim.current = true;
  }, []);

  /**
   * Một lượt xào, tính khi chồng bài vừa được đẩy trở lại cỗ.
   *
   * Nghiêng về tráo dồn vì đó đúng là động tác vừa làm — bốc một tệp ra rồi
   * chồng lại; thi thoảng chen một lượt chẻ bài cho cỗ khỏi trộn mãi một kiểu.
   * `deep` là chồng vừa rồi nhấc sâu bao nhiêu, đi thẳng vào entropy.
   */
  const runPass = useCallback(
    (deep: number, x: number, nhipNhap = true) => {
      const next = mixSeed(entropyRef.current, deep, x, performance.now());
      entropyRef.current = next;
      const rand = mulberry32(next);
      deckRef.current =
        rand() < 0.65
          ? overhand(deckRef.current, rand)
          : riffle(deckRef.current, rand, rand() < 0.5);
      setPasses((n) => n + 1);
      setTooSoon(false);
      /*
        Buông tay giữa chừng thì chồng bài đã có nhịp trượt về chỗ cũ lo phần
        nhìn rồi; chồng thêm hoạt cảnh nhập vào nữa là nó giật một cái, vì hoạt
        cảnh khởi đi từ chỗ cỗ đã liền chứ không phải chỗ tay đang cầm.
      */
      if (nhipNhap) setAnim(`t24-deck-merge ${PASS_MS}ms`);
    },
    [setAnim],
  );

  /* ---------- Cắt ---------- */

  /**
   * Đặt chồng vừa nhấc xuống bàn, chồng phần còn lại lên, rồi vỗ cỗ về giữa.
   * Cắt xong là dừng ở đây chứ không nhảy thẳng sang bàn bài: nhát cắt vừa rồi
   * là một nhịp của nghi thức, phải cho người rút nhìn thấy nó xong đã.
   */
  const commitCut = useCallback((at: number) => {
    kb.current = null;
    const nhanh = prefersReduced();
    /* Tắt hiệu ứng thì bỏ nhịp nhấc lên, đặt thẳng xuống chỗ cuối. */
    setCutting(nhanh ? 2 : 1);
    if (!nhanh) setTimeout(() => setCutting(2), CUT_UP_MS);
    const wait = nhanh ? REDUCED_MS : CUT_UP_MS + CUT_DOWN_MS + 140;
    setTimeout(() => {
      deckRef.current = cutDeck(deckRef.current, at);
      setCutting(0);
      setReady(true);
      setSettling(true);
      setGrip(null);
      setTimeout(() => setSettling(false), SETTLE_MS);
    }, wait);
  }, []);

  /** Kéo hụt: trả chồng bài về chỗ cũ rồi xoá dấu vết cú kéo. */
  /** Trả chồng bài về cỗ rồi xoá dấu vết cái nắm tay vừa rồi. */
  const cancelPull = useCallback(() => {
    kb.current = null;
    setSnapping(true);
    setGrip(null);
    setTimeout(() => setSnapping(false), SNAP_MS);
  }, []);

  /**
   * Sang bàn bài. Chữ nghĩa trên màn xoá đi trước, cỗ bài ở lại — rồi bàn bài
   * đón chính cỗ ấy từ đúng chỗ nó đang đứng, nên hai màn nối liền thành một
   * cử động: cỗ vừa xào xong được mang sang đặt xuống góc trái mặt bàn.
   */
  const leave = useCallback(() => {
    const box = planeRef.current;
    const spot: DeckSpot | null = box ? spotOf(box) : null;
    if (prefersReduced()) {
      onDone(deckRef.current, spot);
      return;
    }
    setLeaving(true);
    leaveTimer.current = setTimeout(() => onDone(deckRef.current, spot), LEAVE_MS);
  }, [onDone]);

  useEffect(() => () => clearTimeout(leaveTimer.current), []);

  /* ---------- Ngón tay ---------- */

  const drag = useRef<{
    id: number;
    x0: number;
    y0: number;
    /** Chiều đã chốt cho cả lần giữ tay này; chưa biết thì null. */
    ngang: boolean | null;
    /** Vòng dọc này đã bốc chồng bài sâu nhất tới đâu. */
    deep: number;
    /** Cái tay của vòng đang làm: chồng cầm trên tay dày mấy lá. */
    chia: number;
  } | null>(null);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (cutting || leaving) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      /* Cắt xong cỗ đang trượt về giữa; chạm vào là cắt ngang nhịp đó cho bài
         bám tay ngay, chứ không để nó vừa theo tay vừa còn trớn cũ. */
      setSettling(false);
      setSnapping(false);
      /* Tệp đang tự bay về nóc mà nắm lại thì bỏ nhịp đó, cho bài bám tay ngay.
         Lượt xào đã tính từ lúc buông nên chẳng mất đi đâu. */
      for (const t of mergeTimers.current) clearTimeout(t);
      mergeTimers.current = [];
      setMerging(0);
      kb.current = null;
      drag.current = {
        id: e.pointerId,
        x0: e.clientX,
        y0: e.clientY,
        ngang: null,
        deep: 0,
        /* Gieo lúc chốt chiều, vì cắt và tráo dồn bốc dày mỏng khác nhau. */
        chia: 0,
      };
    },
    [cutting, leaving],
  );

  /**
   * Chốt chiều ngay từ đoạn đầu rồi giữ nguyên tới lúc nhả tay. Không chốt thì
   * một cú kéo chéo vừa xào vừa cắt, mà cắt xong là cỗ bài khác hẳn.
   *
   * Chiều dọc: một lần giữ tay làm được mấy vòng liền — bốc ra, đẩy về là xong
   * một lượt, rồi lại bốc ra. Mốc đo neo ở chỗ đặt tay ban đầu suốt cả lần giữ,
   * nên chồng bài luôn nằm đúng nơi ngón tay đang ở.
   */
  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      const dx = e.clientX - d.x0;
      const dy = e.clientY - d.y0;

      if (d.ngang === null) {
        if (Math.abs(dx) > LOCK_SLOP && Math.abs(dx) >= Math.abs(dy)) {
          d.ngang = true;
          d.chia = tayCat();
        } else if (dy > LOCK_SLOP && Math.abs(dy) > Math.abs(dx)) {
          d.ngang = false;
          d.chia = tayBoc();
        } else {
          return;
        }
      }

      /* Nhịp nhập vào của vòng trước còn đang chạy thì gỡ, kẻo bài không theo tay. */
      if (anim.current) setAnim(null);
      setSnapping(false);
      setSettling(false);

      if (d.ngang) {
        const s = clamp(Math.abs(dx) - LOCK_SLOP, 0, cutMax);
        setGrip(
          s > 0
            ? { ngang: true, d: dx < 0 ? -s : s, chia: d.chia, up: 0, deep: s }
            : null,
        );
        /* Cỗ chưa xào mấy mà đã đòi cắt thì nhắc ngay từ lúc còn đang kéo. */
        if (s >= GRIP_MIN && passes < MIN_PASSES) setTooSoon(true);
        return;
      }

      const p = clamp(dy - LOCK_SLOP, 0, PULL_MAX);
      /* Về sát cỗ thì coi như không cầm gì nữa — số 0 và "không cầm" là hai
         chuyện khác nhau, dòng nhắc với chồng bài trên tay đều đọc chỗ này. */
      /* Đã lùi được bao nhiêu phần đường về so với chỗ sâu nhất của vòng này. */
      const deep = Math.max(d.deep, p);
      const up = deep > 0 ? clamp((deep - p) / deep, 0, 1) : 0;
      setGrip(p > 0 ? { ngang: false, d: p, chia: d.chia, up, deep } : null);
      d.deep = deep;

      /* Bốc đủ sâu rồi đẩy về sát cỗ: chồng bài đã nhập vào, xong một lượt. */
      if (d.deep >= GRIP_MIN && p <= BACK_PX) {
        const deep = d.deep;
        d.deep = 0;
        /* Vòng sau bốc bằng một tay khác, cho tệp mỗi lần một dày một mỏng. */
        d.chia = tayBoc();
        setGrip(null);
        runPass(deep, e.clientX);
      }
    },
    [cutMax, passes, runPass, setAnim],
  );

  /**
   * Buông tay ở chiều ngang là đặt hai chồng chồng lại với nhau — đó là nhát
   * cắt. Buông ở chiều dọc thì chồng bài rơi trở lại vào cỗ, tính luôn thành
   * một lượt: nó đã nhập vào cỗ thật, chẳng có cớ gì bắt làm lại.
   */
  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      drag.current = null;

      /* Chạm một cái mà không kéo đi đâu cũng là một lượt, cho ai quen gõ hơn kéo. */
      if (d.ngang === null) {
        runPass(GRIP_MIN, e.clientX);
        return;
      }

      if (!d.ngang) {
        if (d.deep < GRIP_MIN) {
          /* Bốc chưa tới nơi thì tệp chỉ rơi trở lại đáy, không tính lượt nào. */
          cancelPull();
          return;
        }
        /*
          Bốc tới nơi rồi mới buông tay thì tệp phải tự đi nốt đường của nó:
          nhấc tại chỗ, trườn về, đặt lên nóc. Trước đây chỗ này thả cho nó rơi
          thẳng về đáy — mà rơi về đáy thì có khác gì chưa xào, tệp lấy ở đáy
          thì phải trả ở nóc mới thành một lượt tráo dồn.
          Lượt xào tính ngay từ đây, còn tệp cứ việc bay nốt: bấm lại giữa
          chừng cũng không mất lượt.
        */
        runPass(d.deep, e.clientX, false);
        setMerging(1);
        /* deep kéo lên hết cỡ để cỗ tụt hẳn xuống, tệp đặt lên là vừa khít. */
        setGrip((g) => (g ? { ...g, up: 1, deep: PULL_MAX } : g));
        mergeTimers.current.push(
          setTimeout(() => {
            setMerging(2);
            setGrip((g) => (g ? { ...g, d: 0, up: 1, deep: PULL_MAX } : g));
            mergeTimers.current.push(
              setTimeout(() => {
                setMerging(0);
                setGrip(null);
              }, MERGE_HOME_MS),
            );
          }, MERGE_UP_MS),
        );
        return;
      }

      const s = clamp(Math.abs(e.clientX - d.x0) - LOCK_SLOP, 0, cutMax);
      if (s < GRIP_MIN) {
        cancelPull();
        return;
      }
      /* Cỗ chưa xào mấy mà đã đòi cắt thì nhắc một câu chứ không cắt. */
      if (passes < MIN_PASSES) {
        setTooSoon(true);
        cancelPull();
        return;
      }
      commitCut(cutAtFor(d.chia, total));
    },
    [cancelPull, commitCut, cutMax, passes, runPass, total],
  );

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLElement>) => {
      if (cutting || leaving) return;
      const k = e.key;
      const ngang = k === "ArrowLeft" || k === "ArrowRight";
      const doc = k === "ArrowDown" || k === "ArrowUp";
      /*
        Mũi tên đi đúng hai đường ngón tay đi: dọc để bốc chồng ra rồi nhập lại,
        ngang để tách cỗ làm hai. Quãng kéo giữ trong ref chứ không đọc từ state
        — giữ phím thì mấy nhịp liền nhau rơi vào cùng một lượt dựng, đọc từ
        state là nhịp sau đè nhịp trước, bấm mười cái vẫn đứng yên một chỗ.
      */
      if (ngang || doc) {
        e.preventDefault();
        /* Đổi chiều là bỏ cái nắm cũ, y như nhả tay ra rồi nắm lại. */
        const cu = kb.current?.ngang === ngang ? kb.current.d : 0;
        const max = ngang ? cutMax : PULL_MAX;
        const buoc = (k === "ArrowDown" || k === "ArrowRight" ? 1 : -1) * (max / 12);
        /* Bắt đầu một vòng mới thì gieo lại cái tay, y như bên ngón tay. */
        const chia =
          cu === 0
            ? ngang
              ? tayCat()
              : tayBoc()
            : (kb.current?.chia ?? (ngang ? tayCat() : tayBoc()));
        /*
          Nhịp đầu nhảy thẳng tới ngưỡng. Nhích từng tí từ 0 lên thì có lúc chỗ
          cắt đã hiện trên màn mà Enter lại chưa cắt được, vì quãng kéo chưa qua
          ngưỡng.
        */
        let moi =
          cu === 0
            ? buoc > 0 || ngang
              ? Math.sign(buoc) * GRIP_MIN
              : 0
            : cu + buoc;
        moi = clamp(moi, -max, max);
        if (Math.abs(moi) < GRIP_MIN) moi = 0;

        const daBoc = !ngang && Math.abs(cu) >= GRIP_MIN;
        const sau = Math.max(kb.current?.deep ?? 0, Math.abs(moi));
        const up = !ngang && sau > 0 ? clamp((sau - moi) / sau, 0, 1) : 0;
        kb.current =
          moi === 0 ? null : { ngang, d: moi, chia, deep: ngang ? 0 : sau };
        /*
          Nhịp nhập vào của lượt trước còn đang chạy thì gỡ, y như bên ngón tay:
          hoạt cảnh đè lên transform trong style, không gỡ thì bấm phím ngay sau
          một lượt xào là chồng bài đứng im mất một nhịp.
        */
        if (anim.current) setAnim(null);
        setSnapping(false);
        setSettling(false);
        setGrip(kb.current && { ...kb.current, up, deep: sau });
        /* Đẩy về sát cỗ sau khi đã bốc ra: chồng bài nhập vào, xong một lượt. */
        if (daBoc && moi === 0) runPass(GRIP_MIN, 0);
        if (ngang && Math.abs(moi) >= GRIP_MIN && passes < MIN_PASSES) {
          setTooSoon(true);
        }
        return;
      }
      if (k === "Enter" && kb.current?.ngang) {
        e.preventDefault();
        /* Cỗ chưa xào mấy mà đã đòi cắt thì nhắc một câu chứ không cắt. */
        if (passes < MIN_PASSES) {
          setTooSoon(true);
          cancelPull();
          return;
        }
        commitCut(cutAtFor(kb.current.chia, total));
        return;
      }
      if (k === "Enter" || k === " ") {
        e.preventDefault();
        runPass(GRIP_MIN, 0);
      }
    },
    [
      cancelPull,
      commitCut,
      cutMax,
      cutting,
      leaving,
      passes,
      runPass,
      setAnim,
      total,
    ],
  );

  /* ---------- Xào hộ ---------- */

  /*
    Xào hộ cũng dừng ở đúng chỗ người tự xào dừng: cỗ nằm chờ, có nút mới sang
    bàn bài. Một cửa ra cho cả hai lối, người rút không phải đoán xem lần này
    màn hình có tự nhảy hay không.
  */
  useEffect(() => {
    if (phase !== "auto") return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const xongMan = () => {
      deckRef.current = autoShuffle(deckRef.current, entropyRef.current);
      setAnim(null);
      setCinema(-1);
      setPhase("hand");
      setReady(true);
      /*
        Ghi đúng số lượt máy vừa làm: autoShuffle chạy hai lượt chẻ bài và một
        lượt tráo dồn. Không ghi thì màn hình vừa báo "đã cắt xong" vừa bảo
        "xào thêm vài lượt rồi hãy cắt" nếu người rút muốn tự cắt lại.
      */
      setPasses((n) => Math.max(n, MIN_PASSES));
    };

    /* Tắt hiệu ứng thì bỏ hẳn màn diễn, chỉ chừa một nhịp cho đỡ giật màn. */
    if (prefersReduced()) {
      timers.push(setTimeout(xongMan, REDUCED_MS));
      return () => timers.forEach(clearTimeout);
    }

    let at = 0;
    CINEMA.forEach((nhip, n) => {
      timers.push(
        setTimeout(() => {
          setCinema(n);
          setAnim(
            (i) => `${nhip.keyframes} ${nhip.dur}ms ${i * nhip.step}ms both`,
          );
        }, at),
      );
      at += nhip.ms;
    });
    timers.push(setTimeout(xongMan, AUTO_MS));
    return () => timers.forEach(clearTimeout);
  }, [phase, setAnim]);

  /* ---------- Chỗ đứng của từng lá ---------- */

  /**
   * Lá số 0 nằm đáy cỗ, lá cuối nằm trên nóc.
   *
   * Hai chiều bốc hai chỗ khác nhau, vì hai việc khác nhau. Xào là rút tệp từ
   * đáy cỗ ra rồi chồng lên nóc, nên tệp là mấy lá dưới cùng. Cắt là nhấc phần
   * trên ra đặt sang bên, nên chồng ấy là mấy lá trên nóc.
   */
  const cardTransform = (i: number) => {
    const z = i * ZSTEP;
    const ngang = grip?.ngang ?? false;
    /* Lá này có nằm trong chồng đang cầm hay không. */
    const trong = packet > 0 && (ngang ? i >= STACK - packet : i < packet);
    /*
      Chỗ lá này đứng khi chồng cắt đã thành một cỗ riêng đặt trên mặt bàn: lá
      dưới cùng của chồng nằm sát mặt bàn, đúng như cỗ gốc. Chỉ nhát cắt mới
      dùng tới, vì chỉ nó mới đặt hẳn chồng bài xuống.
    */
    const rieng = (i - (STACK - packet)) * ZSTEP;

    if (cutting) {
      const d = grip?.ngang ? grip.d : 0;
      /*
        Chồng vừa tách nằm nguyên chỗ nó đang đứng và hạ hẳn xuống bàn: nó là
        đáy cỗ mới, chẳng phải đi đâu cả.
      */
      if (trong) return `translate3d(${d.toFixed(1)}px, 0, ${rieng.toFixed(1)}px)`;
      /*
        Phần còn lại mới là phần đi: nhấc khỏi mặt bàn, đưa qua trên đầu chồng
        kia, rồi hạ xuống đè lên. Đó mới là cắt bài — phần tách ra nằm dưới,
        phần còn lại úp lên trên.
      */
      const tren = (i + packet) * ZSTEP;
      return cutting === 1
        ? `translate3d(${gocXFor(d, 1).toFixed(1)}px, 0, ${(tren + CUT_ARC).toFixed(1)}px)`
        : `translate3d(${d.toFixed(1)}px, 0, ${tren.toFixed(1)}px)`;
    }

    if (ngang) {
      /* Hai chồng dạt đều về hai phía, hở ra một quãng mặt bàn ở giữa. */
      const d = grip?.d ?? 0;
      const x = trong ? d : gocXFor(d, 0);
      if (!trong) return `translate3d(${x.toFixed(1)}px, 0, ${z.toFixed(1)}px)`;
      /*
        Chồng cắt nhấc lên khỏi mặt cỗ trong quãng kéo đầu, lúc ngón tay còn
        đang lách vào; mang ra khỏi chồng kia rồi thì hạ xuống đặt lên bàn. Đặt
        xuống là hai chồng nằm cùng một mặt phẳng, dày mỏng nhìn thấy như nhau,
        đúng một cỗ bài vừa bị chia làm hai — chứ không phải một chồng cứ bay lơ
        lửng bên trên mãi.
      */
      const tren = z + LIFT * clamp(Math.abs(d) / GRIP_MIN, 0, 1);
      const dat = datFor(Math.abs(d) * (1 + CUT_SPLIT));
      return `translate3d(${x.toFixed(1)}px, 0, ${(tren + (rieng - tren) * dat).toFixed(1)}px)`;
    }

    /* Cỗ còn lại tụt xuống bấy nhiêu khi tệp đã rút khỏi gầm nó. */
    const tut = grip && !ngang ? packet * ZSTEP * tutFor(grip.deep) : 0;

    if (trong) {
      /*
        Tệp rút ra từ đáy, nên chừng nào còn dưới gầm cỗ thì nó cứ nằm nguyên
        chỗ cũ, dưới cùng. Rút hẳn ra khỏi cỗ rồi, đẩy về là nhấc nó lên khỏi
        mặt bàn — nhấc xong trước lúc nó trườn tới che lấy cỗ — rồi đưa về đặt
        lên nóc. Đó mới là tráo dồn: tệp lấy ở đáy, trả lại ở nóc.
        Về tới nơi thì tệp trên nóc và cỗ đã tụt xuống khớp lại vừa in thành
        một cỗ liền, nên lúc tính xong lượt xào chẳng có cú giật nào.
      */
      const noc = (STACK + i) * ZSTEP - tut;
      const len = nhacFor(grip?.deep ?? 0, grip?.up ?? 0);
      const x = depth * PULL_DRIFT;
      const y = depth * PULL_SCALE;
      return `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${(z + (noc - z) * len).toFixed(1)}px)`;
    }
    return `translate3d(0, 0, ${(z - tut).toFixed(1)}px)`;
  };

  const moving = cutting > 0 || merging > 0 || snapping || settling;
  const moveMs =
    cutting === 1
      ? CUT_UP_MS
      : cutting === 2
        ? CUT_DOWN_MS
        : merging === 1
          ? MERGE_UP_MS
          : merging === 2
            ? MERGE_HOME_MS
            : settling
              ? SETTLE_MS
              : SNAP_MS;
  const dienMan = phase === "auto";

  /** Câu dưới cỗ bài: đang diễn thì xướng tên nhịp, còn lại thì nhắc việc. */
  const hint = (() => {
    /* Nhịp đầu chưa kịp gắn thì vẫn xướng tên nó, kẻo loé một khung chữ khác. */
    if (dienMan) return CINEMA[Math.max(cinema, 0)].say;
    if (cutting) return "Đang cắt cỗ…";
    if (cutAt) return `Cắt ở lá thứ ${cutAt} · thả tay ra là chồng lại`;
    if (grip?.ngang) {
      return passes < MIN_PASSES
        ? "Xào thêm vài lượt rồi hãy cắt"
        : "Kéo ngang thêm chút nữa để cắt";
    }
    if (grip && !merging) return "Đẩy lên để nhập lại · một vòng là một lượt xào";
    if (ready) {
      return `Đã xào ${passes} lượt và cắt xong · làm tiếp hoặc bắt đầu rút`;
    }
    if (tooSoon) return "Xào thêm vài lượt rồi hãy cắt";
    if (passes === 0) return "Kéo cỗ bài xuống phía bạn để tách một chồng ra";
    if (passes < MIN_PASSES) {
      return `Đã xào ${passes} lượt · làm thêm ${MIN_PASSES - passes} vòng nữa`;
    }
    return `Đã xào ${passes} lượt · kéo ngang để cắt cỗ`;
  })();

  /*
    Rời màn: chữ nghĩa mờ đi hết, cỗ bài không. Cỗ là thứ duy nhất có mặt ở cả
    hai màn nên nó phải đi liền một mạch, còn chữ thì thuộc về màn xào, xong
    việc là xoá.
  */
  const xoaChu = `transition-opacity duration-300 ${leaving ? "opacity-0" : ""}`;

  return (
    /*
      Máy rộng thì cả nghi thức đứng giữa khung nhìn. Neo lên mép trên thì dưới
      cỗ bài hụt xuống một mảng trống bằng nửa màn, mà trang này chẳng có gì
      dưới đó cả. 77px là chiều cao thanh đầu trang từ md trở lên — h-[76px] cộng
      một vạch viền, xem SiteHeader.

      min-h chứ không phải h: màn thấp hơn nội dung thì khung tự nở ra, không có
      chuyện canh giữa rồi phần trên trôi khỏi màn mà không kéo tới được.
    */
    <div className="mx-auto flex w-full max-w-[720px] flex-col px-5 pt-6 pb-10 md:min-h-[calc(100svh-77px)] md:justify-center md:px-0">
      {/*
        Căn phòng quanh cái bàn: viền tối bốn phía và nến hắt vào từ ngoài khung.

        Phủ cả khung nhìn chứ không riêng cột chữ, vì góc phòng là góc màn hình
        chứ không phải góc của cột 720px — neo vào cột thì hai ngọn nến rơi vào
        giữa màn, thành hai vệt sáng lửng lơ chẳng của ai.

        -z-10 đặt nó xuống dưới mọi thứ: nến là thứ ở sau lưng, không phải tấm
        kính trước mặt. Nằm dưới nên nó không rửa trôi mặt bài, mà thanh đầu
        trang trong mờ thì vẫn thấy được chút hơi ấm thấm qua.
      */}
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden ${xoaChu}`}
      >
        {/* Viền tối: mắt dồn về giữa bàn, bốn góc phòng chìm đi. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 76% 66% at 50% 46%,transparent 36%,rgba(3,5,11,0.34) 72%,rgba(3,5,11,0.72) 100%)",
          }}
        />
        {/*
          Ngọn nến chính, ngoài khung phía trên bên trái — đúng chiều đèn mà cả
          màn này đang theo: vũng sáng trên mặt bàn lệch về trái, bóng cỗ bài đổ
          xuống chếch dưới phải. Nó xuyên qua được viền tối vì đèn gần thì vẫn
          sáng ở góc, chứ viền tối là chuyện của ống kính.

          Tâm ngọn nến đặt sát mép, vòng sáng thì to hơn cả màn: nhìn vào chỉ
          thấy quãng tản ra, không thấy cái lõi. Có lõi trong khung thì nó thành
          một đốm nâu nằm chình ình ở góc chứ không phải ánh sáng của một ngọn
          nến đứng ngoài khung.
        */}
        <div
          className="animate-candle absolute top-[12%] left-[4%] h-[155vmin] w-[155vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle,rgba(222,170,100,0.15),rgba(214,152,84,0.05) 26%,rgba(214,152,84,0) 58%)",
          }}
        />
        {/* Ngọn thứ hai ở xa, góc dưới bên phải, mờ hơn hẳn — nó chỉ hắt lại
            chút hơi ấm cho góc kia khỏi chết hẳn, không tranh phần đổ bóng. */}
        <div
          className="animate-candle-far absolute right-[7%] bottom-[10%] h-[125vmin] w-[125vmin] translate-x-1/2 translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle,rgba(222,170,100,0.065),rgba(214,152,84,0.022) 28%,rgba(214,152,84,0) 58%)",
          }}
        />
      </div>

      {/*
        Máy rộng thì cả màn này là một vật duy nhất — cái bàn có cỗ bài nằm
        giữa — nên dòng chữ canh giữa theo nó. Canh trái như các trang khác thì
        tiêu đề dạt hẳn sang một bên trong khi cỗ bài nằm chính giữa, nhìn ra
        hai thứ rời nhau chứ không phải một cảnh.
      */}
      <h1
        className={`font-serif text-xl text-ink md:text-center md:text-2xl ${xoaChu}`}
      >
        Xào bài
      </h1>
      <p
        className={`mt-1.5 text-[13.5px]/[1.65] text-pretty text-muted md:mx-auto md:max-w-[54ch] md:text-center ${xoaChu}`}
      >
        {phase === "auto"
          ? "Đang xào và cắt hộ bạn. Ngồi yên một nhịp."
          : "Giữ câu hỏi trong đầu. Kéo cỗ xuống rồi đẩy lên là một lượt xào, kéo ngang cho cỗ tách làm hai rồi thả tay là cắt."}
      </p>

      <div
        ref={boxRef}
        role="button"
        tabIndex={cutting || leaving || phase === "auto" ? -1 : 0}
        /* Nhãn kể cả đường bàn phím, vì dòng nhắc dưới màn chỉ nói tới ngón tay. */
        aria-label={`Cỗ bài. Kéo xuống rồi đẩy lên là một lượt xào, kéo ngang rồi thả tay là cắt cỗ. Bằng bàn phím: mũi tên xuống bốc chồng ra, mũi tên lên nhập lại, mũi tên trái phải tách cỗ ra rồi Enter là cắt. Đã xào ${passes} lượt${
          ready ? ", đã cắt" : ""
        }.`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        /*
          touch-none vì ở đây cả hai chiều đều là thao tác: ngang thì xào, dọc
          thì cắt. Bù lại cả bước này gói trong một màn, không có gì để cuộn.
        */
        /*
          Màn xào hộ nới cao thêm và đẩy cỗ xuống một quãng: nhịp xoáy hất cả cỗ
          bốc khỏi mặt bàn, không chừa khoảng trên là lá bay trèo lên dòng chữ.
        */
        /*
          Máy rộng thì nới khung ra: mặt bàn rộng theo nó, và khoảng chừa cho cú
          kéo tay không còn là một mảng trống giữa cỗ bài với dòng nhắc. Quãng
          kéo ngang vốn đã chạm trần CUT_CAP từ khổ hẹp nên nới ra không đổi tay
          nào cả, chỉ đổi chỗ cho mắt nhìn.
        */
        /*
          --deck-top là chỗ cỗ bài đứng, và mọi thứ khác trong khung đều đo từ
          nó: mặt bàn, quầng sáng, đều là calc trên biến này. Trước đây mỗi thứ
          giữ một con số riêng, dịch cỗ bài đi một nhịp là phải nhớ sửa cả ba.
          Máy rộng thì hạ cỗ xuống một quãng cho nó ngồi vào giữa bàn chứ không
          dán lên mép trên.
        */
        className={`relative mx-auto mt-6 w-full max-w-[360px] touch-none select-none md:max-w-[520px] ${
          phase === "auto"
            ? "h-[384px] [--deck-top:78px] md:h-[432px] md:[--deck-top:104px]"
            : "h-[352px] [--deck-top:10px] md:h-[400px] md:[--deck-top:36px]"
        } ${
          cutting || leaving || phase === "auto"
            ? "cursor-default"
            : "cursor-grab active:cursor-grabbing"
        }`}
      >
        {/*
          Mặt bàn. Nằm đúng mặt phẳng nghiêng của cỗ bài, cùng một điểm tụ, nên
          bóng cỗ có chỗ mà rơi và khoảng trống chừa sẵn cho cú kéo tay thành
          mặt bàn chứ không phải chỗ hụt.

          Vẽ bằng chính ngôn ngữ của lá bài — vân chéo, sắc vàng, mép tan dần
          vào nền — chứ không phải một tấm ảnh chụp. Ảnh chụp có phối cảnh và
          chiều sáng riêng của nó, đặt cỗ bài vẽ tay lên trên thì lá bài thành
          miếng dán.

          Lớp bọc cắt phần thừa: mặt bàn nghiêng thì mép gần mắt nở to ra, quá
          bề ngang màn là sinh thanh cuộn ngang. Điểm tụ đặt lại đúng chỗ cũ vì
          lớp bọc trùng khít khung ngoài, nên cắt mà mặt bàn vẫn ăn khớp với cỗ.
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden [perspective:1100px]"
        >
          <div
            className="absolute left-1/2 h-[680px] w-[118%] -translate-x-1/2"
            style={{
              /* Tâm bàn trùng tâm cỗ bài: nửa bề cao bàn là 340. */
              top: `calc(var(--deck-top) + ${CARD_H / 2}px - 340px)`,
              transform: `rotateX(${TILT}deg)`,
              backgroundImage: [
                /* Vũng đèn chếch trên trái, hắt xuống mặt bàn chứ không bọc quanh cỗ. */
                "radial-gradient(ellipse 54% 40% at 43% 46%,rgba(201,169,97,0.21),rgba(201,169,97,0.08) 44%,transparent 76%)",
                /* Vân khăn trải bàn, cùng nét chéo với mặt lưng lá bài. */
                "repeating-linear-gradient(45deg,rgba(201,169,97,0.05) 0 1px,transparent 1px 13px)",
                "repeating-linear-gradient(-45deg,rgba(201,169,97,0.05) 0 1px,transparent 1px 13px)",
                /* Nền bàn ấm hơn nền trang, xa dần thì tối lại về đúng màu nền. */
                "radial-gradient(ellipse 80% 64% at 45% 47%,#221d24,#191722 36%,#111320 66%,rgba(11,15,26,0) 100%)",
              ].join(","),
              /* Mép bàn không có đường viền, nó chỉ mờ dần đi cho tới hết. */
              maskImage:
                "radial-gradient(ellipse 44% 52% at 50% 48%,#000 44%,rgba(0,0,0,0.5) 76%,transparent 100%)",
            }}
          />
        </div>

        {/* Chút hơi sáng còn vương trong không khí ngay trên cỗ, nhẹ thôi: sáng
            thật nằm ở vũng đèn trên mặt bàn rồi. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 mx-auto h-[140px] w-[300px] rounded-[50%]"
          style={{
            top: "calc(var(--deck-top) + 16px)",
            background:
              "radial-gradient(ellipse,rgba(201,169,97,0.07),rgba(201,169,97,0) 70%)",
          }}
        />

        <div className="absolute inset-0 [perspective:1100px]">
          <div
            ref={planeRef}
            /*
              Căn giữa bằng lớp -translate-x-1/2, mà Tailwind v4 dựng bằng thuộc
              tính `translate` riêng chứ không phải `transform` — nên đừng lặp
              lại translateX ở dưới, kẻo cỗ bài dịch sang trái hai lần.
            */
            className="absolute left-1/2 h-[192px] w-[128px] -translate-x-1/2 [transform-style:preserve-3d]"
            style={
              {
                "--dir": "1",
                top: "var(--deck-top)",
                transform: `rotateX(${TILT}deg)`,
              } as CSSProperties
            }
          >
            {/*
              Bóng đổ trên mặt bàn, nằm ngay dưới lá đáy: mỗi chồng một vệt. Cỗ
              còn liền thì vệt của chồng nhấc nằm chồng đúng lên vệt kia mà mờ
              hẳn đi, nên vẫn chỉ thấy một bóng; tách ra tới đâu nó rõ lên tới
              đó, để hai chồng rời nhau rồi thì khoảng hở giữa chúng là mặt bàn
              trống chứ không phải một vệt bóng chẳng của ai. Đặt chồng bài
              xuống thì bóng đi theo, kẻo cỗ sang chỗ mới mà bóng nằm lại.
            */}
            {(["goc", "nhac"] as const).map((ai) => {
              const nhac = ai === "nhac";
              const d = grip?.ngang ? grip.d : 0;
              const x = nhac ? d : gocXFor(d, cutting);
              const mo = !nhac
                ? 1
                : cutting
                  ? 0
                  : clamp(Math.abs(d) / GRIP_MIN, 0, 1);
              return (
                <div
                  key={ai}
                  aria-hidden
                  className="absolute -inset-x-6 -inset-y-4 rounded-[40px]"
                  style={{
                    background:
                      "radial-gradient(ellipse,rgba(0,0,0,0.6),rgba(0,0,0,0) 72%)",
                    opacity: mo,
                    transform: `translate3d(${(x + SHADOW_X).toFixed(1)}px, ${SHADOW_Y}px, -1px)`,
                    transition: moving
                      ? `transform ${moveMs}ms cubic-bezier(0.32,0.72,0.2,1), opacity ${moveMs}ms linear`
                      : undefined,
                  }}
                />
              );
            })}
            {Array.from({ length: STACK }, (_, i) => (
              <TarotCardFace
                key={i}
                face="down"
                className={`${CARD} absolute inset-0 will-change-transform`}
                style={
                  {
                    "--z": `${(i * ZSTEP).toFixed(1)}px`,
                    /* Hai nửa cỗ đan vào nhau, nên lá chẵn lá lẻ đi ngược chiều. */
                    "--s": i % 2 ? "1" : "-1",
                    /* Chỗ đứng của lá trong nhịp cắt của màn xào hộ. */
                    "--cx": i >= STACK / 2 ? "92px" : "-40px",
                    "--cz": i >= STACK / 2 ? "26px" : "0px",
                    ...swirlVars(i),
                    transform: cardTransform(i),
                    transition: moving
                      ? `transform ${moveMs}ms cubic-bezier(0.32,0.72,0.2,1)`
                      : undefined,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </div>
      </div>

      <div className={`mt-1 flex flex-col items-center gap-2.5 ${xoaChu}`}>
        {phase === "auto" ? null : (
          <div className="flex h-4 items-center gap-2">
            {Array.from({ length: MIN_PASSES }, (_, i) => (
              <span
                key={i}
                className={`size-1.5 rounded-full transition-colors duration-200 ${
                  i < passes ? "bg-gold" : "bg-line"
                }`}
              />
            ))}
            {passes > MIN_PASSES ? (
              <span className="text-[12px] font-medium text-gold">
                +{passes - MIN_PASSES}
              </span>
            ) : null}
          </div>
        )}
        <p
          role="status"
          className={`text-center text-[13px] ${
            dienMan
              ? "text-gold"
              : cutAt
                ? "text-gold"
                : tooSoon || (grip?.ngang && passes < MIN_PASSES)
                  ? "text-rust"
                  : "text-muted"
          }`}
        >
          {hint}
        </p>
      </div>

      {/*
        Cắt xong mới hiện nút. Chỗ này cố ý là một cái nút thật: xào và cắt là
        việc của bàn tay, còn rời bàn xào sang bàn bài là một quyết định, nên để
        người rút tự bấm khi thấy sẵn sàng.
      */}
      {phase === "auto" ? null : ready ? (
        /*
          Nút nằm trong một lớp bọc riêng: animate-rise giữ độ mờ ở mức 1 cho
          tới hết, mờ đi thì phải mờ ở lớp ngoài chứ đặt lên chính nó thì hoạt
          cảnh đè mất.
        */
        <div className={`mt-8 self-center ${xoaChu}`}>
          <button
            type="button"
            onClick={leave}
            disabled={leaving}
            className={buttonClass("primary", "md", "animate-rise")}
          >
            Bắt đầu rút bài
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPhase("auto")}
          disabled={cutting > 0}
          className={`mt-8 self-center text-[13.5px] text-muted underline underline-offset-4 transition-colors hover:text-gold-hi disabled:opacity-50 ${xoaChu}`}
        >
          Xào và cắt giúp tôi
        </button>
      )}
    </div>
  );
}
