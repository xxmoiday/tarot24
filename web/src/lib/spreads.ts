import type { AspectKey } from "./cards";

/**
 * Cách bày lá. "row" và "single" xếp theo dòng, các kiểu còn lại đặt lá theo
 * toạ độ để giữ đúng hình mà kiểu trải quy định.
 */
export type LayoutKind =
  | "single" | "row" | "pair" | "love" | "plus" | "branch"
  | "month" | "cross" | "horseshoe" | "week" | "year";

export type TopicKey = AspectKey | "general";

export const TOPICS: { key: TopicKey; label: string }[] = [
  { key: "love", label: "Tình cảm" },
  { key: "work", label: "Công việc" },
  { key: "money", label: "Tiền bạc" },
  { key: "mind", label: "Tâm lý" },
  { key: "study", label: "Học hành" },
  { key: "general", label: "Chung" },
];

export const TOPIC_LABEL: Record<TopicKey, string> = Object.fromEntries(
  TOPICS.map((t) => [t.key, t.label]),
) as Record<TopicKey, string>;

export interface SpreadPosition {
  /** Tên chính thức của vị trí, dùng ở trang kiểu trải và trong bài luận */
  label: string;
  /**
   * Lăng kính nên đọc lá ở vị trí này. Không có nghĩa là đọc theo lĩnh vực
   * của câu hỏi; có thì vị trí đó luôn đọc theo lăng kính này bất kể câu hỏi.
   */
  lens?: AspectKey;
  /** Nhãn rút gọn hiện dưới lá khi chỗ hẹp; không có thì dùng label */
  short?: string;
  /** Vị trí này trả lời cái gì, dùng khi viết bài luận */
  meaning: string;
}

export interface Spread {
  slug: string;
  name: string;
  /** Tên tiếng Anh, dùng cho thẻ meta và dữ liệu có cấu trúc */
  nameEn: string;
  count: number;
  /** Khoảng độ dài bài luận, tính bằng tiếng */
  length: { min: number; max: number };
  group: "basic" | "topic";
  /** Kiểu bày lá trên màn, theo đúng cách đặt lá của kiểu trải */
  layout: LayoutKind;
  /** Một câu ngắn cho thẻ kiểu trải ở trang chủ */
  blurb: string;
  /** Ảnh cover riêng cho trang chi tiết kiểu trải */
  coverImage?: { src: string; alt: string; position?: string };
  /** Đoạn mô tả đầy đủ cho trang kiểu trải */
  about: string;
  /** Cách rút và cách bày lá */
  how: string;
  placeholder: string;
  /** Câu hỏi kiểu trải này trả lời tốt */
  fits: string[];
  /** Câu hỏi nên hỏi bằng kiểu trải khác */
  notFor: string[];
  defaultTopic: TopicKey;
  positions: SpreadPosition[];
  /** Trải này trả lời câu hỏi có/không */
  yesNo?: boolean;
  /**
   * Chỉ số những lá luôn đọc xuôi dù rút ra ngược, ví dụ lá nằm ngang trong
   * Thập tự Celtic thì không có chiều nên không có nghĩa ngược.
   */
  uprightOnly?: number[];
  seo: { title: string; description: string };
}

export const SPREADS: Spread[] = [
  {
    slug: "mot-la-hom-nay",
    name: "Một lá cho hôm nay",
    nameEn: "One Card Daily",
    count: 1,
    length: { min: 120, max: 180 },
    group: "basic",
    layout: "single",
    blurb:
      "Rút một lá cho ngày hôm nay hoặc cho một chuyện đang vướng trong đầu. Nhanh, gọn, đủ để biết mình đang đứng ở đâu.",
    coverImage: {
      src: "/spreads/mot-la-hom-nay-cover.webp",
      alt: "Một lá tarot cho hôm nay trên bàn gỗ trong ánh sáng buổi sáng",
      position: "66% 50%",
    },
    about:
      "Rút một lá cho ngày hôm nay hoặc cho một chuyện đang vướng trong đầu. Nhanh, gọn, đủ để biết mình đang đứng ở đâu.",
    how: "Xào bài, nghĩ tới hôm nay hoặc chuyện đang vướng, rút một lá và đặt ngửa trước mặt.",
    placeholder: "Hôm nay bạn đang nghĩ về chuyện gì",
    fits: [
      "Hôm nay mình nên để ý chuyện gì",
      "Dạo này mình đang bị kẹt ở đâu",
      "Chuyện với người đó, mình đang ở chỗ nào",
      "Tuần này đi làm cần giữ cái gì",
    ],
    notFor: [
      "Có nên nhận offer bên kia không, hay ở lại",
      "Anh ấy có đang nghĩ đến mình không",
      "Tháng sau tiền nong có ổn không",
    ],
    defaultTopic: "general",
    positions: [
      {
        label: "Lá hôm nay",
        short: "Hôm nay",
        meaning:
          "hôm nay, hoặc trong chuyện đang hỏi, cái gì đang chi phối và bạn nên để ý điều gì",
      },
    ],
    seo: {
      title: "Rút một lá tarot cho hôm nay",
      description:
        "Rút một lá tarot cho ngày hôm nay và nhận một bài đọc ngắn, nói thẳng bạn đang đứng ở đâu.",
    },
  },
  {
    slug: "co-hay-khong",
    name: "Một lá có hay không",
    nameEn: "One Card Yes or No",
    count: 1,
    length: { min: 120, max: 180 },
    group: "basic",
    layout: "single",
    yesNo: true,
    blurb:
      "Một câu hỏi có hoặc không, một lá trả lời. Bài chỉ nói đang nghiêng về phía nào và vì sao, không hứa chắc.",
    coverImage: {
      src: "/spreads/mot-la-hom-nay-cover.webp",
      alt: "Một lá tarot trên bàn gỗ trong ánh sáng buổi sáng",
      position: "66% 50%",
    },
    about:
      "Một câu hỏi có hoặc không, một lá trả lời. Bài chỉ nói đang nghiêng về phía nào và vì sao, không hứa chắc.",
    how: "Đặt câu hỏi ở dạng có hoặc không thật rõ trong đầu, xào bài, rút một lá và đặt ngửa.",
    placeholder: "Có nên… không",
    fits: [
      "Có nên nhắn cho người đó trước không",
      "Tuần này có nên nộp đơn vào chỗ đó không",
      "Mình có nên nói thẳng với sếp chuyện này không",
      "Đi chuyến này có hợp không",
    ],
    notFor: [
      "Có thắng kiện không",
      "Có nên mua mảnh đất đó không",
      "Bệnh này có khỏi không",
      "Có bầu chưa",
    ],
    defaultTopic: "general",
    positions: [
      {
        label: "Lá trả lời",
        short: "Câu trả lời",
        meaning:
          "với câu hỏi này, bài đang nghiêng về có hay về không, và vì sao",
      },
    ],
    seo: {
      title: "Bói tarot có hay không · một lá",
      description:
        "Đặt một câu hỏi có hoặc không, rút một lá tarot và xem bài đang nghiêng về phía nào cùng lý do.",
    },
  },
  {
    slug: "ba-la-thoi-gian",
    name: "Ba lá quá khứ, hiện tại, tương lai gần",
    nameEn: "Three Card Past Present Future",
    count: 3,
    length: { min: 220, max: 300 },
    group: "basic",
    layout: "row",
    blurb:
      "Ba lá xếp theo dòng thời gian của một chuyện, để thấy nó từ đâu tới, đang ở đâu và nếu giữ đà thì đi về đâu.",
    coverImage: {
      src: "/spreads/ba-la-thoi-gian-cover.webp",
      alt: "Ba lá tarot quá khứ hiện tại tương lai trong ánh nắng ấm",
      position: "64% 50%",
    },
    about:
      "Ba lá xếp theo dòng thời gian của một chuyện, để thấy nó từ đâu tới, đang ở đâu và nếu giữ đà thì đi về đâu.",
    how: "Xào bài, rút ba lá và đặt thành hàng ngang từ trái sang phải theo thứ tự quá khứ, hiện tại, tương lai gần.",
    placeholder: "Bạn đang vướng chuyện gì",
    fits: [
      "Chuyện giữa mình và người đó đang đi về đâu",
      "Việc ở công ty này rồi sẽ ra sao",
      "Chuyện tiền nong của mình đang chuyển thế nào",
      "Mấy tháng nay mình lận đận, có sáng hơn không",
    ],
    notFor: [
      "Nên chọn A hay chọn B",
      "Bao giờ có kết quả",
      "Người đó có đang nghĩ đến mình không",
    ],
    defaultTopic: "general",
    positions: [
      {
        label: "Quá khứ",
        meaning:
          "chuyện này từ đâu mà ra, cái gì đã xảy ra và vẫn còn đè lên hiện tại",
      },
      {
        label: "Hiện tại",
        meaning: "ngay lúc này chuyện đang ở đâu, cái gì đang chi phối bạn",
      },
      {
        label: "Tương lai gần",
        meaning:
          "nếu giữ đà hiện tại thì vài tuần tới chuyện này nghiêng về đâu",
      },
    ],
    seo: {
      title: "Trải bài tarot ba lá quá khứ, hiện tại, tương lai",
      description:
        "Trải ba lá theo dòng thời gian để thấy chuyện của bạn từ đâu tới, đang ở đâu và sẽ đi về đâu nếu giữ đà.",
    },
  },
  {
    slug: "ba-la-tinh-huong",
    name: "Ba lá tình huống, trở ngại, lời khuyên",
    nameEn: "Three Card Situation Obstacle Advice",
    count: 3,
    length: { min: 220, max: 300 },
    group: "basic",
    layout: "row",
    blurb: "Cho một chuyện đang kẹt và muốn biết kẹt ở đâu.",
    coverImage: {
      src: "/spreads/ba-la-tinh-huong-cover.webp",
      alt: "Ba lá tarot tình huống trở ngại lời khuyên trên bàn gỗ trong ánh nến",
      position: "66% 52%",
    },
    about:
      "Cho một chuyện đang kẹt và muốn biết kẹt ở đâu. Ba lá gọi tên tình huống, chỉ cái đang cản và đưa một hướng gỡ.",
    how: "Xào bài, rút ba lá đặt hàng ngang từ trái sang phải theo thứ tự tình huống, trở ngại, lời khuyên.",
    placeholder: "Chuyện gì đang kẹt",
    fits: [
      "Mình đang kẹt với dự án này, gỡ thế nào",
      "Chuyện với người yêu cứ cãi hoài, tại đâu",
      "Sao mãi không để dành được tiền",
      "Học mãi không vào, mình đang vướng cái gì",
    ],
    notFor: [
      "Chuyện này rồi có thành không",
      "Nên chọn hướng nào trong hai hướng",
      "Người kia đang nghĩ gì về mình",
    ],
    defaultTopic: "general",
    positions: [
      {
        label: "Tình huống",
        meaning: "chuyện này thật ra đang là chuyện gì, gốc của nó ở đâu",
      },
      {
        label: "Trở ngại",
        meaning: "cái gì đang cản, từ bên ngoài hay từ chính bạn",
      },
      {
        label: "Lời khuyên",
        meaning: "bạn nên làm gì hoặc giữ tâm thế nào để qua cái cản ở lá hai",
      },
    ],
    seo: {
      title: "Trải bài tarot tình huống, trở ngại, lời khuyên",
      description:
        "Ba lá cho một chuyện đang kẹt: chuyện đang ra sao, cái gì chặn nó, và nên làm gì tiếp.",
    },
  },
  {
    slug: "nam-la-tinh-cam",
    name: "Năm lá chuyện tình cảm",
    nameEn: "Five Card Relationship",
    count: 5,
    length: { min: 280, max: 380 },
    group: "basic",
    layout: "love",
    blurb:
      "Cho một mối đang có hoặc đang tìm hiểu. Năm lá nhìn phía mình, phía người kia, cái đang nối, cái đang cản và hướng mối này đang đi.",
    coverImage: {
      src: "/spreads/nam-la-tinh-cam-cover.webp",
      alt: "Năm lá tarot tình cảm trên bàn gỗ trong ánh nắng ấm",
      position: "64% 52%",
    },
    about:
      "Cho một mối đang có hoặc đang tìm hiểu. Năm lá nhìn phía mình, phía người kia, cái đang nối, cái đang cản và hướng mối này đang đi.",
    how: "Xào bài, rút năm lá; hai lá đầu đặt cạnh nhau như hai người đối diện, lá ba đặt giữa, lá bốn đặt dưới, lá năm đặt trên cùng.",
    placeholder: "Chuyện tình cảm nào bạn muốn hỏi",
    fits: [
      "Mối này có đi xa được không",
      "Mình với người đó đang ở đâu, có nên tiếp tục tìm hiểu không",
      "Hai đứa dạo này lạnh nhạt, tại đâu",
      "Mình còn nên chờ người này không",
    ],
    notFor: [
      "Người đó có đang ngoại tình không",
      "Có nên cưới hay chia tay, chọn giúp mình",
      "Bao giờ mình gặp được người yêu",
    ],
    defaultTopic: "love",
    positions: [
      {
        label: "Bạn trong chuyện này",
        short: "Phía bạn",
        meaning:
          "bạn đang đứng trong mối này với tâm thế gì, đang cho đi và đang giữ lại cái gì",
        lens: "love",
      },
      {
        label: "Người kia trong chuyện này",
        short: "Phía người kia",
        meaning:
          "trong mối này, bài đang cho thấy gì về phía người kia, cách người đó đang đứng và đang cho đi",
        lens: "love",
      },
      {
        label: "Cái đang nối hai người",
        short: "Cái đang nối",
        meaning:
          "cái gì đang giữ hai người lại với nhau lúc này, thứ đó chắc hay mỏng",
        lens: "love",
      },
      {
        label: "Cái đang cản",
        meaning: "cái gì đang kéo hai người ra xa hoặc làm mối này khó đi tiếp",
        lens: "love",
      },
      {
        label: "Hướng đi",
        meaning:
          "nếu giữ đà này thì mối này nghiêng về đâu, và bạn làm được gì để nó đi theo hướng tốt hơn",
        lens: "love",
      },
    ],
    seo: {
      title: "Trải bài tarot tình cảm năm lá",
      description:
        "Năm lá nhìn phía bạn, phía người kia, cái đang nối, cái đang cản và hướng mối quan hệ đang đi.",
    },
  },
  {
    slug: "bay-la-mong-ngua",
    name: "Bảy lá móng ngựa",
    nameEn: "Seven Card Horseshoe",
    count: 7,
    length: { min: 380, max: 460 },
    group: "basic",
    layout: "horseshoe",
    blurb:
      "Bảy lá xếp thành vòng cung, cho một chuyện đang rối mà chưa đủ lớn để bày cả Thập tự Celtic.",
    coverImage: {
      src: "/spreads/bay-la-mong-ngua-cover.webp",
      alt: "Bảy lá tarot xếp thành vòng móng ngựa trên nền vải tối",
      position: "66% 52%",
    },
    about:
      "Bảy lá xếp thành vòng cung như hình móng ngựa, cho một chuyện đang rối mà chưa đủ lớn để bày cả Thập tự Celtic. Nhìn được cả gốc, cả chỗ đang cản, cả cái còn khuất và người xung quanh.",
    how: "Xào bài, rút bảy lá và đặt thành một vòng cung mở lên như hình móng ngựa, từ trái sang phải theo thứ tự một tới bảy.",
    placeholder: "Chuyện nào bạn muốn nhìn cho hết một lượt",
    fits: [
      "Chuyện ở chỗ làm của mình đang thế nào",
      "Mối này đang vướng ở đâu, nhìn giúp mình một lượt",
      "Mình đang kẹt mà chưa biết kẹt chỗ nào",
      "Chuyện này còn gì mình chưa nhìn ra không",
    ],
    notFor: [
      "Nên chọn bên này hay bên kia",
      "Hôm nay có nên nhắn cho người đó không",
      "Bao giờ chuyện này xong",
    ],
    defaultTopic: "general",
    positions: [
      {
        label: "Quá khứ",
        meaning:
          "chuyện này từ đâu mà ra, cái gì đã xảy ra và còn để dấu lên hôm nay",
      },
      {
        label: "Hiện tại",
        meaning: "ngay lúc này chuyện đang ở đâu và cái gì đang chi phối bạn",
      },
      {
        label: "Cái còn khuất",
        short: "Còn khuất",
        meaning: "cái gì đang tác động vào chuyện này mà bạn chưa nhìn ra",
      },
      {
        label: "Cái đang cản",
        short: "Đang cản",
        meaning: "cái gì đang chặn chuyện này lại, và nó chặn bằng cách nào",
      },
      {
        label: "Người và hoàn cảnh xung quanh",
        short: "Xung quanh",
        meaning:
          "người khác và hoàn cảnh bên ngoài đang đẩy chuyện này theo hướng nào",
      },
      {
        label: "Việc nên làm",
        short: "Nên làm",
        meaning: "với bàn bài này, bạn nên làm gì",
      },
      {
        label: "Kết cục nếu giữ đà",
        short: "Kết cục",
        meaning: "nếu mọi thứ giữ nguyên như bàn bài này thì chuyện đi tới đâu",
      },
    ],
    seo: {
      title: "Trải bài tarot móng ngựa bảy lá",
      description:
        "Bảy lá móng ngựa cho một chuyện đang rối: gốc rễ, hiện tại, cái còn khuất, cái đang cản, việc nên làm và kết cục nếu giữ đà.",
    },
  },
  {
    slug: "thap-tu-celtic",
    name: "Thập tự Celtic",
    nameEn: "Celtic Cross",
    count: 10,
    length: { min: 450, max: 550 },
    group: "basic",
    layout: "cross",
    uprightOnly: [1],
    blurb:
      "Trải mười lá cổ điển cho một chuyện lớn, muốn nhìn từ gốc tới ngọn, từ trong ra ngoài.",
    coverImage: {
      src: "/spreads/thap-tu-celtic-cover.webp",
      alt: "Mười lá tarot xếp theo bố cục Thập tự Celtic trong ánh nến ấm",
      position: "65% 50%",
    },
    about:
      "Trải mười lá cổ điển cho một chuyện lớn, muốn nhìn từ gốc tới ngọn, từ trong ra ngoài. Mất thời gian hơn nhưng thấy đủ mọi phía.",
    how: "Rút mười lá theo thứ tự; lá một đặt giữa, lá hai đặt nằm ngang chéo lên lá một, lá ba dưới, lá bốn bên trái, lá năm trên, lá sáu bên phải, rồi bốn lá còn lại xếp thành cột dọc bên phải từ dưới lên.",
    placeholder: "Chuyện lớn nào bạn muốn nhìn cho hết",
    fits: [
      "Cả chuyện tình cảm này của mình, nhìn toàn cảnh",
      "Con đường sự nghiệp của mình đang thế nào, nên hiểu sao cho đúng",
      "Năm nay mình cứ lận đận, nhìn giúp mình toàn bộ chuyện này",
      "Mình đang định đổi hẳn cách sống, chuyện đó ra sao",
    ],
    notFor: [
      "Hôm nay có nên nhắn cho người đó không",
      "Câu hỏi nhanh có hoặc không",
      "Chọn A hay B",
    ],
    defaultTopic: "general",
    positions: [
      {
        label: "Hoàn cảnh",
        meaning: "tâm điểm của chuyện này là gì, bạn đang đứng giữa cái gì",
      },
      {
        label: "Cái cắt ngang",
        meaning: "cái gì đang cắt ngang hoàn cảnh, giúp hay cản, mạnh tới đâu",
      },
      {
        label: "Gốc rễ",
        meaning:
          "nền của chuyện này nằm ở đâu, cái gì bên dưới đã tạo ra hoàn cảnh hiện tại",
        lens: "mind",
      },
      {
        label: "Quá khứ gần",
        meaning:
          "chuyện gì vừa qua và đang lùi lại, nhưng còn để dấu lên hiện tại",
      },
      {
        label: "Trên đầu",
        meaning:
          "khả năng tốt nhất của chuyện này là gì, hoặc điều bạn đang nghĩ tới và đang nhắm tới",
      },
      {
        label: "Tương lai gần",
        meaning:
          "nếu giữ đà hiện tại thì vài tuần tới chuyện này chuyển sang đâu",
      },
      {
        label: "Bản thân người hỏi",
        short: "Bản thân bạn",
        meaning:
          "bạn đang mang tâm thế gì vào chuyện này, đang tự thấy mình ra sao",
        lens: "mind",
      },
      {
        label: "Xung quanh",
        meaning:
          "người khác và hoàn cảnh bên ngoài đang tác động thế nào lên chuyện này",
      },
      {
        label: "Hy vọng và nỗi sợ",
        meaning:
          "bạn đang mong gì và đang sợ gì ở chuyện này, hai thứ đó có phải là một không",
        lens: "mind",
      },
      {
        label: "Kết cục nếu giữ đà",
        meaning: "nếu mọi thứ giữ nguyên như bàn bài này thì chuyện đi tới đâu",
      },
    ],
    seo: {
      title: "Trải bài tarot Thập tự Celtic mười lá",
      description:
        "Trải mười lá Thập tự Celtic cho một chuyện lớn: hoàn cảnh, trở ngại, gốc rễ, quá khứ, tương lai và kết cục.",
    },
  },
  {
    slug: "nam-la-cong-viec",
    name: "Năm lá công việc",
    nameEn: "Five Card Career",
    count: 5,
    length: { min: 280, max: 380 },
    group: "topic",
    layout: "plus",
    blurb: "Cho chuyện đi làm và đường sự nghiệp.",
    coverImage: {
      src: "/spreads/nam-la-cong-viec-cover.webp",
      alt: "Năm lá tarot công việc trên bàn làm việc cạnh laptop và sổ tay",
      position: "66% 52%",
    },
    about:
      "Cho chuyện đi làm và đường sự nghiệp. Năm lá nhìn chỗ đứng hiện tại, cái mình đang có, cái đang cản, yếu tố bên ngoài và hướng nên đi.",
    how: "Xào bài, rút năm lá; lá một đặt giữa, lá hai bên trái, lá ba bên phải, lá bốn phía trên, lá năm phía dưới.",
    placeholder: "Chuyện công việc nào bạn muốn hỏi",
    fits: [
      "Mình có nên xin nghỉ chỗ này không",
      "Sao ở công ty mãi không lên được",
      "Đường đi tiếp trong nghề của mình là gì",
      "Mình đang định chuyển ngành, chuyện đó ra sao",
      "Dự án này của mình đang ở đâu",
    ],
    notFor: [
      "Có nên nhận offer A hay offer B",
      "Nên góp vốn mở quán với bạn không",
      "Bao giờ được tăng lương",
    ],
    defaultTopic: "work",
    positions: [
      {
        label: "Chỗ đứng hiện tại",
        short: "Chỗ đứng",
        meaning:
          "ở chỗ làm hoặc trên đường nghề, bạn đang đứng ở đâu, vững hay chông chênh",
        lens: "work",
      },
      {
        label: "Điểm mạnh đang có",
        short: "Điểm mạnh",
        meaning:
          "bạn đang có cái vốn gì để dùng, tay nghề, uy tín, quan hệ hay sức bền",
        lens: "work",
      },
      {
        label: "Cái đang cản",
        meaning: "cái gì đang giữ chân, trong chính bạn hay trong chỗ làm",
        lens: "work",
      },
      {
        label: "Người hoặc yếu tố bên ngoài",
        short: "Bên ngoài",
        meaning:
          "sếp, đồng nghiệp, thị trường hay hoàn cảnh bên ngoài đang tác động thế nào lên chuyện này",
        lens: "work",
      },
      {
        label: "Hướng đi",
        meaning:
          "với bàn bài này, hướng nên đi là gì và việc đầu tiên nên làm là gì",
        lens: "work",
      },
    ],
    seo: {
      title: "Trải bài tarot công việc năm lá",
      description:
        "Năm lá cho chuyện đi làm: hiện trạng, điểm mạnh, cái cản, việc nên làm và hướng đi của sự nghiệp.",
    },
  },
  {
    slug: "bon-la-tien-bac",
    name: "Bốn lá tiền bạc",
    nameEn: "Four Card Money",
    count: 4,
    length: { min: 280, max: 380 },
    group: "topic",
    layout: "row",
    blurb: "Cho chuyện tiền nong hằng ngày, thu, chi, giữ.",
    coverImage: {
      src: "/spreads/bon-la-tien-bac-cover.webp",
      alt: "Bốn lá tarot tiền bạc trên bàn tròn trắng cạnh tách cà phê và tinh thể vàng",
      position: "66% 52%",
    },
    about:
      "Cho chuyện tiền nong hằng ngày, thu, chi, giữ. Bốn lá nhìn tình hình hiện tại, nếp đang tạo ra nó, cái nên giữ hay bỏ và hướng đi. Không phải chỗ hỏi mua bán, đầu tư.",
    how: "Xào bài, rút bốn lá và đặt hàng ngang từ trái sang phải theo thứ tự tình hình, nguyên nhân, giữ hay bỏ, hướng đi.",
    placeholder: "Chuyện tiền bạc nào bạn muốn hỏi",
    fits: [
      "Sao tiền cứ vào rồi ra hết",
      "Tình hình tiền nong của mình mấy tháng tới thế nào",
      "Mình có đang tiêu sai chỗ không",
      "Nguồn thu của mình đang ổn hay đang mỏng",
    ],
    notFor: [
      "Có nên mua vàng lúc này không",
      "Nên bán đất hay giữ",
      "Mã này có lên không",
      "Có nên cho người ta vay tiền để họ đầu tư không",
    ],
    defaultTopic: "money",
    positions: [
      {
        label: "Tình hình hiện tại",
        short: "Tình hình",
        meaning:
          "tiền nong của bạn đang ở trạng thái nào, đủ, thiếu, hay đang lúc lắc",
        lens: "money",
      },
      {
        label: "Nguyên nhân hoặc thói quen",
        short: "Nếp đang có",
        meaning:
          "nếp tiêu, nếp làm hay nếp nghĩ nào đang tạo ra tình hình ở lá một",
        lens: "money",
      },
      {
        label: "Cái nên giữ hoặc bỏ",
        short: "Giữ hay bỏ",
        meaning:
          "trong cách xoay tiền hiện tại, cái gì nên giữ lại và cái gì nên bỏ đi",
        lens: "money",
      },
      {
        label: "Hướng đi",
        meaning:
          "nếu sửa được theo lá ba thì tiền nong nghiêng về đâu trong vài tháng tới, và việc đầu tiên nên làm là gì",
        lens: "money",
      },
    ],
    seo: {
      title: "Trải bài tarot tiền bạc bốn lá",
      description:
        "Bốn lá cho dòng tiền: đang vào, đang ra, đang giữ và điều nên chỉnh.",
    },
  },
  {
    slug: "ba-la-giua-hai-nguoi",
    name: "Ba lá giữa hai người",
    nameEn: "Three Card Between Two People",
    count: 3,
    length: { min: 220, max: 300 },
    group: "topic",
    layout: "pair",
    blurb: "Khi đang vướng một người và muốn biết giữa hai bên đang có gì.",
    coverImage: {
      src: "/spreads/ba-la-giua-hai-nguoi-cover.webp",
      alt: "Ba lá tarot giữa hai người trên bàn gỗ cạnh hai tách trà",
      position: "66% 52%",
    },
    about:
      "Khi đang vướng một người và muốn biết giữa hai bên đang có gì. Ba lá cho phía mình, phía người kia và cái đang diễn ra ở giữa.",
    how: "Xào bài, rút ba lá; lá một đặt bên trái cho phía mình, lá hai bên phải cho phía người kia, lá ba đặt giữa hai lá.",
    placeholder: "Bạn đang vướng ai",
    fits: [
      "Người ấy đang nghĩ gì về mình",
      "Giữa mình với người đó đang có gì",
      "Mình với đứa bạn thân dạo này xa cách, tại sao",
      "Mình với sếp có đang hiểu lầm nhau không",
    ],
    notFor: [
      "Người đó có đang lừa mình không",
      "Có nên tỏ tình hay không",
      "Người đó có quay lại không",
    ],
    defaultTopic: "love",
    positions: [
      {
        label: "Bạn",
        meaning:
          "bạn đang mang gì tới mối này, đang nghĩ và đang cư xử với người kia ra sao",
      },
      {
        label: "Người kia",
        meaning:
          "trong mối này, bài đang cho thấy gì về phía người kia, cách người đó đang đứng với bạn",
      },
      {
        label: "Giữa hai người",
        short: "Ở giữa",
        meaning:
          "cái đang diễn ra ở khoảng giữa hai người là gì, đang nối hay đang kéo xa",
      },
    ],
    seo: {
      title: "Trải bài tarot ba lá giữa hai người",
      description:
        "Ba lá nhìn phía bạn, phía người kia và cái đang nằm giữa hai người.",
    },
  },
  {
    slug: "nam-la-chon-huong",
    name: "Năm lá chọn giữa hai hướng",
    nameEn: "Five Card Two Paths Decision",
    count: 5,
    length: { min: 280, max: 380 },
    group: "topic",
    layout: "branch",
    blurb: "Khi đang phân vân giữa hai hướng.",
    coverImage: {
      src: "/spreads/nam-la-chon-huong-cover.webp",
      alt: "Năm lá tarot chọn hướng xếp thành hai nhánh trên bàn gỗ",
      position: "66% 52%",
    },
    about:
      "Khi đang phân vân giữa hai hướng. Năm lá nhìn gốc của phân vân, rồi mỗi hướng một cặp lá cho thấy nó là gì và dẫn tới đâu.",
    how: "Định rõ trong đầu hướng A và hướng B, xào bài, rút năm lá; lá một đặt giữa, lá hai và lá ba xếp dọc bên trái cho hướng A, lá bốn và lá năm xếp dọc bên phải cho hướng B.",
    placeholder: "Bạn đang phải chọn giữa hai gì",
    fits: [
      "Có nên nhận offer bên kia không, hay ở lại chỗ cũ",
      "Về quê hay ở lại thành phố",
      "Nói thẳng với người đó hay im để yên chuyện",
      "Học tiếp lên cao hay đi làm luôn",
    ],
    notFor: [
      "Nên mua nhà bây giờ hay chờ giá xuống",
      "Nên bán cổ phiếu hay giữ",
      "Nên chọn bệnh viện nào để chữa",
    ],
    defaultTopic: "general",
    positions: [
      {
        label: "Gốc của phân vân",
        short: "Gốc phân vân",
        meaning:
          "bạn đang đứng ở đâu và cái gì thật sự làm chuyện này khó chọn",
      },
      {
        label: "Hướng A",
        meaning:
          "chọn hướng A thì bạn đang bước vào cái gì, được gì và phải mang gì",
      },
      {
        label: "Hướng A dẫn tới đâu",
        short: "A dẫn tới",
        meaning: "nếu đi hướng A và giữ đà thì vài tháng tới nó dẫn tới đâu",
      },
      {
        label: "Hướng B",
        meaning:
          "chọn hướng B thì bạn đang bước vào cái gì, được gì và phải mang gì",
      },
      {
        label: "Hướng B dẫn tới đâu",
        short: "B dẫn tới",
        meaning: "nếu đi hướng B và giữ đà thì vài tháng tới nó dẫn tới đâu",
      },
    ],
    seo: {
      title: "Trải bài tarot chọn giữa hai hướng",
      description:
        "Năm lá cho một lựa chọn khó: bạn đang ở đâu, và mỗi hướng cho gì, lấy đi gì.",
    },
  },
  {
    slug: "ba-la-nhin-lai-minh",
    name: "Ba lá nhìn lại mình",
    nameEn: "Three Card Self Reflection",
    count: 3,
    length: { min: 220, max: 300 },
    group: "topic",
    layout: "row",
    blurb: "Khi thấy mình lửng lơ, mệt, hoặc không rõ mình đang muốn gì.",
    coverImage: {
      src: "/spreads/ba-la-nhin-lai-minh-cover.webp",
      alt: "Ba lá tarot nhìn lại mình trên bàn gỗ cạnh gương và ánh nến",
      position: "66% 52%",
    },
    about:
      "Khi thấy mình lửng lơ, mệt, hoặc không rõ mình đang muốn gì. Ba lá cho tâm thế hiện tại, cái đang bị tránh nhìn và cái nên nuôi. Trải này nhìn vào chính bạn, không nhìn chuyện bên ngoài.",
    how: "Xào bài, nghĩ về chính mình chứ không nghĩ về ai khác, rút ba lá và đặt thành hàng ngang từ trái sang phải.",
    placeholder: "Dạo này bạn thấy mình thế nào",
    fits: [
      "Dạo này mình thấy mình lửng lơ, mình đang ở đâu",
      "Mình đang mệt mà không biết mệt vì cái gì",
      "Có cái gì mình đang tránh không dám nhìn không",
      "Giờ mình nên nuôi cái gì trong mình",
    ],
    notFor: [
      "Người đó đang nghĩ gì về mình",
      "Mình có nên nghỉ việc không",
      "Bao giờ mình hết chuỗi ngày này",
    ],
    defaultTopic: "mind",
    positions: [
      {
        label: "Bạn lúc này",
        meaning:
          "bạn đang mang tâm thế gì, đang là người thế nào trong quãng này",
        lens: "mind",
      },
      {
        label: "Cái bạn đang tránh nhìn",
        short: "Đang tránh nhìn",
        meaning:
          "điều gì bạn biết mà không muốn nhìn thẳng, và nó đang giữ bạn lại ra sao",
        lens: "mind",
      },
      {
        label: "Cái nên nuôi",
        short: "Nên nuôi",
        meaning: "sức nào bạn đang có mà chưa dùng tới, nên đổ công vào đâu",
        lens: "mind",
      },
    ],
    seo: {
      title: "Trải bài tarot ba lá nhìn lại mình",
      description:
        "Ba lá cho chính bạn: tâm thế lúc này, cái bạn đang tránh nhìn và cái nên nuôi.",
    },
  },
  {
    slug: "bay-la-tuan-nay",
    name: "Bảy lá tuần này",
    nameEn: "Seven Card Week Ahead",
    count: 7,
    length: { min: 380, max: 460 },
    group: "topic",
    layout: "week",
    blurb: "Bảy lá cho bảy ngày tới, tính từ hôm rút chứ không theo lịch.",
    coverImage: {
      src: "/spreads/bay-la-tuan-nay-cover.webp",
      alt: "Bảy lá tarot cho tuần này xếp cạnh sổ kế hoạch và cà phê",
      position: "64% 52%",
    },
    about:
      "Bảy lá cho bảy ngày tới, tính từ hôm rút chứ không theo lịch. Để biết tuần này dồn ở đoạn nào, thưa ở đoạn nào, ngày nào nên dồn sức và ngày nào nên giữ sức.",
    how: "Xào bài, rút bảy lá và đặt thành hàng ngang từ trái sang phải, mỗi lá một ngày, lá đầu tiên là ngày hôm nay.",
    placeholder: "Bạn muốn nhìn trước tuần này ở mặt nào",
    fits: [
      "Tuần này của mình thế nào",
      "Tuần này đi làm có căng không",
      "Mấy hôm tới mình nên để ý chuyện gì",
      "Tuần này nên dồn sức vào đoạn nào",
    ],
    notFor: [
      "Thứ mấy thì nên ký hợp đồng",
      "Tuần này có gặp chuyện gì xui không",
      "Tuần này người đó có nhắn cho mình không",
    ],
    defaultTopic: "general",
    positions: [
      {
        label: "Ngày đầu",
        meaning: "ngày mở tuần, cái gì đang chi phối và bạn nên để ý điều gì",
      },
      {
        label: "Ngày hai",
        meaning: "sang ngày sau, nhịp chuyển sang đâu so với ngày mở tuần",
      },
      {
        label: "Ngày ba",
        meaning: "đoạn đầu tuần khép lại thế nào, cái gì nổi lên ở đây",
      },
      {
        label: "Ngày bốn",
        meaning: "giữa tuần, đà đang lên hay đang chững",
      },
      {
        label: "Ngày năm",
        meaning: "sang nửa sau tuần, cái gì mở ra hoặc đòi bạn làm gì",
      },
      {
        label: "Ngày sáu",
        meaning: "gần cuối tuần, cái gì dễ bị bỏ lỡ hoặc dễ hỏng",
      },
      {
        label: "Ngày cuối",
        meaning: "tuần khép lại thế nào, đà nào mang sang tuần sau",
      },
    ],
    seo: {
      title: "Trải bài tarot tuần này bảy lá",
      description:
        "Bảy lá cho bảy ngày tới: tuần này dồn ở đoạn nào, ngày nào nên dồn sức và ngày nào nên giữ sức.",
    },
  },
  {
    slug: "nam-la-thang-toi",
    name: "Năm lá tháng tới",
    nameEn: "Five Card Month Ahead",
    count: 5,
    length: { min: 280, max: 380 },
    group: "topic",
    layout: "month",
    blurb:
      "Nhìn trước tháng tới theo bốn tuần, cộng một lá chủ đề bao trùm cả tháng.",
    coverImage: {
      src: "/spreads/nam-la-thang-toi-cover.webp",
      alt: "Năm lá tarot tháng tới xếp cạnh lịch trắng và biểu tượng chu kỳ trăng",
      position: "66% 52%",
    },
    about:
      "Nhìn trước tháng tới theo bốn tuần, cộng một lá chủ đề bao trùm cả tháng. Để biết đoạn nào nên dồn sức, đoạn nào nên giữ sức.",
    how: "Xào bài, rút năm lá; bốn lá đầu đặt hàng ngang từ trái sang phải cho bốn tuần, lá năm đặt trên hàng đó làm chủ đề của tháng.",
    placeholder: "Bạn muốn nhìn trước tháng tới ở mặt nào",
    fits: [
      "Tháng tới của mình thế nào",
      "Tháng sau đi làm có êm không",
      "Tháng này chuyện tình cảm có chuyển gì không",
      "Tháng tới mình nên dồn sức vào đoạn nào",
    ],
    notFor: [
      "Ngày nào trong tháng nên ký hợp đồng",
      "Tháng tới có gặp tai nạn gì không",
      "Tháng tới có nên mua vàng không",
    ],
    defaultTopic: "general",
    positions: [
      {
        label: "Tuần đầu",
        meaning: "đoạn đầu tháng, cái gì đang chi phối và bạn nên để ý điều gì",
      },
      {
        label: "Tuần hai",
        meaning: "sang đoạn thứ hai, chuyện chuyển sang đâu so với tuần đầu",
      },
      {
        label: "Tuần ba",
        meaning: "đoạn sau giữa tháng, cái gì nổi lên và bạn cần làm gì",
      },
      {
        label: "Tuần cuối",
        meaning: "cuối tháng khép lại thế nào, đà nào mang sang tháng sau",
      },
      {
        label: "Chủ đề của tháng",
        short: "Chủ đề tháng",
        meaning:
          "cả tháng này xoay quanh chuyện gì, bài học hay tâm thế nào bao trùm bốn tuần",
      },
    ],
    seo: {
      title: "Trải bài tarot tháng tới năm lá",
      description:
        "Bốn lá cho bốn tuần và một lá chủ đề, nhìn trước cả tháng sắp tới.",
    },
  },
  {
    slug: "muoi-hai-la-nam-toi",
    name: "Mười hai lá năm tới",
    nameEn: "Twelve Card Year Ahead",
    count: 12,
    length: { min: 520, max: 620 },
    group: "topic",
    layout: "year",
    blurb:
      "Mười hai lá cho mười hai tháng tới, tính từ tháng bạn rút chứ không theo lịch.",
    coverImage: {
      src: "/spreads/muoi-hai-la-nam-toi-cover.webp",
      alt: "Mười hai lá tarot năm tới xếp thành vòng quanh biểu tượng mặt trời mặt trăng",
      position: "66% 52%",
    },
    about:
      "Mười hai lá xếp thành vòng tròn cho mười hai tháng tới, tính từ tháng bạn rút chứ không theo lịch. Để nhìn đường đi của cả năm, quý nào nặng, quý nào mở ra, và cái gì đọng lại khi năm khép.",
    how: "Xào bài, rút mười hai lá và đặt thành một vòng tròn theo chiều kim đồng hồ, lá một ở đỉnh vòng, mỗi lá là một tháng kể từ tháng bạn đang rút.",
    placeholder: "Bạn muốn nhìn trước năm tới ở mặt nào",
    fits: [
      "Năm tới của mình thế nào",
      "Sang năm chuyện đi làm của mình chuyển ra sao",
      "Năm tới mình nên dồn sức vào quãng nào",
      "Nhìn giúp mình cả năm tới một lượt",
    ],
    notFor: [
      "Tháng nào trong năm thì nên cưới",
      "Năm tới có gặp hạn gì không",
      "Năm tới có nên mua nhà không",
    ],
    defaultTopic: "general",
    positions: [
      {
        label: "Tháng thứ nhất",
        meaning: "năm này mở ra bằng cái gì, tháng đầu đặt bạn vào tâm thế nào",
      },
      {
        label: "Tháng thứ hai",
        meaning: "sang tháng sau, cái mở ra ở tháng đầu chuyển thế nào",
      },
      {
        label: "Tháng thứ ba",
        meaning: "quý mở khép lại thế nào, cái gì còn kẹt lại từ đoạn này",
      },
      {
        label: "Tháng thứ tư",
        meaning: "quý hai mở ra bằng gì, có gì khác quý đầu",
      },
      {
        label: "Tháng thứ năm",
        meaning: "giữa quý hai, cái gì đang lớn lên và cái gì đang chậm",
      },
      {
        label: "Tháng thứ sáu",
        meaning: "nửa năm đầu khép lại ở đâu, bạn đang đứng chỗ nào",
      },
      {
        label: "Tháng thứ bảy",
        meaning: "nửa sau năm mở ra bằng gì",
      },
      {
        label: "Tháng thứ tám",
        meaning: "cái gì thành hình hoặc được nhìn thấy ở quãng này",
      },
      {
        label: "Tháng thứ chín",
        meaning: "quý ba khép lại thế nào, cái gì đang qua đi",
      },
      {
        label: "Tháng thứ mười",
        meaning: "quý cuối mở ra bằng gì, bạn cần đổi cách nào",
      },
      {
        label: "Tháng thứ mười một",
        meaning: "gần cuối năm, cái gì tới tay và cái gì dễ bị bỏ lỡ",
      },
      {
        label: "Tháng thứ mười hai",
        meaning: "năm này khép lại ở đâu, cái gì đọng lại mang sang năm sau",
      },
    ],
    seo: {
      title: "Trải bài tarot năm tới mười hai lá",
      description:
        "Mười hai lá cho mười hai tháng tới: quý nào nặng, quý nào mở ra, và cái gì đọng lại khi năm khép.",
    },
  },
];

export const SPREAD_BY_SLUG = new Map(SPREADS.map((s) => [s.slug, s]));

/** Từ bấy nhiêu lá trở lên thì một lần rút đã thành chuyện dài. */
export const TRAI_DAI_TU = 7;

/**
 * Ba tầng để bày ra danh sách.
 *
 * Ngoài đời phần lớn ca dùng trải nhỏ: một lá, ba lá, năm lá. Thập tự Celtic
 * được nhắc nhiều nhưng ít dùng vì tốn thời gian và dễ loãng. Bày cả mười lăm
 * kiểu ngang hàng là nói sai chuyện đó, nên trải dài tách hẳn ra một tầng
 * riêng thay vì đứng cạnh trải một lá.
 */
export const SPREAD_TIERS = {
  /** Trải nhỏ, dùng chung, hợp phần lớn câu hỏi */
  start: SPREADS.filter((s) => s.group === "basic" && s.count < TRAI_DAI_TU),
  /** Trải nhỏ nhưng khoá vào một chủ đề */
  topic: SPREADS.filter((s) => s.group === "topic" && s.count < TRAI_DAI_TU),
  /** Trải dài, xếp từ ít lá tới nhiều lá */
  long: SPREADS.filter((s) => s.count >= TRAI_DAI_TU).sort((a, b) => a.count - b.count),
};

export function getSpread(slug: string) {
  return SPREAD_BY_SLUG.get(slug);
}

/** Một vị trí trên bàn: tâm lá tính theo phần trăm khung. */
export interface LayoutPoint {
  x: number;
  y: number;
  z?: number;
  rotate?: number;
}

export interface SpreadLayout {
  /** Tỉ lệ khung, dùng cho aspect-ratio */
  ratio: [number, number];
  /** Bề ngang một lá, theo phần trăm bề ngang khung */
  cardWidth: number;
  /** Tâm từng lá, xếp theo đúng thứ tự vị trí của kiểu trải */
  points: LayoutPoint[];
}

/**
 * Hình của từng kiểu trải, dựng theo đúng phần "cách rút" trong tài liệu.
 * Toạ độ là phần trăm nên bàn bài co giãn theo bề ngang màn.
 */
export const SPREAD_LAYOUTS: Record<
  Exclude<LayoutKind, "single" | "row">,
  SpreadLayout
> = {
  /** Lá một trái, lá hai phải, lá ba nằm giữa hai lá */
  pair: {
    ratio: [100, 52],
    cardWidth: 26,
    points: [
      { x: 15, y: 50 },
      { x: 85, y: 50 },
      { x: 50, y: 50, z: 2 },
    ],
  },
  /** Hai lá đầu đối diện nhau, lá ba giữa, lá bốn dưới, lá năm trên cùng */
  love: {
    ratio: [100, 128],
    cardWidth: 24,
    points: [
      { x: 20, y: 50 },
      { x: 80, y: 50 },
      { x: 50, y: 50, z: 2 },
      { x: 50, y: 82 },
      { x: 50, y: 18 },
    ],
  },
  /** Lá một giữa, hai trái, ba phải, bốn trên, năm dưới */
  plus: {
    ratio: [100, 128],
    cardWidth: 24,
    points: [
      { x: 50, y: 50, z: 2 },
      { x: 20, y: 50 },
      { x: 80, y: 50 },
      { x: 50, y: 18 },
      { x: 50, y: 82 },
    ],
  },
  /** Lá một giữa, cặp hướng A dọc bên trái, cặp hướng B dọc bên phải */
  branch: {
    ratio: [100, 100],
    cardWidth: 24,
    points: [
      { x: 50, y: 50, z: 2 },
      { x: 16, y: 26 },
      { x: 16, y: 74 },
      { x: 84, y: 26 },
      { x: 84, y: 74 },
    ],
  },
  /** Bốn tuần hàng ngang, lá chủ đề nằm trên hàng đó */
  month: {
    ratio: [100, 78],
    cardWidth: 20,
    points: [
      { x: 12.5, y: 72 },
      { x: 37.5, y: 72 },
      { x: 62.5, y: 72 },
      { x: 87.5, y: 72 },
      { x: 50, y: 24, z: 2 },
    ],
  },
  /** Móng ngựa: bảy lá xoè thành vòng cung mở lên, lá bốn ở đỉnh cung */
  horseshoe: {
    ratio: [100, 46],
    cardWidth: 12.5,
    points: [
      { x: 11.9, y: 68.2, z: 1, rotate: -21 },
      { x: 21.7, y: 45.1, z: 2, rotate: -14 },
      { x: 34.9, y: 29.9, z: 3, rotate: -7 },
      { x: 50, y: 24.7, z: 4 },
      { x: 65.1, y: 29.9, z: 5, rotate: 7 },
      { x: 78.3, y: 45.1, z: 6, rotate: 14 },
      { x: 88.1, y: 68.2, z: 7, rotate: 21 },
    ],
  },
  /** Bảy ngày xếp một hàng ngang, ngày đầu bên trái */
  week: {
    ratio: [100, 22],
    cardWidth: 12,
    points: [
      { x: 7.5, y: 50 },
      { x: 21.7, y: 50 },
      { x: 35.8, y: 50 },
      { x: 50, y: 50 },
      { x: 64.2, y: 50 },
      { x: 78.3, y: 50 },
      { x: 92.5, y: 50 },
    ],
  },
  /** Mười hai tháng thành một vòng tròn, tháng đầu ở đỉnh rồi đi theo chiều kim đồng hồ */
  year: {
    ratio: [100, 100],
    cardWidth: 12.5,
    points: [
      { x: 50, y: 11.5 },
      { x: 69.3, y: 16.7 },
      { x: 83.3, y: 30.8 },
      { x: 88.5, y: 50 },
      { x: 83.3, y: 69.3 },
      { x: 69.3, y: 83.3 },
      { x: 50, y: 88.5 },
      { x: 30.8, y: 83.3 },
      { x: 16.7, y: 69.3 },
      { x: 11.5, y: 50 },
      { x: 16.7, y: 30.8 },
      { x: 30.8, y: 16.7 },
    ],
  },
  /** Thập tự Celtic: sáu lá dựng thành thập tự, bốn lá còn lại thành cột bên phải */
  cross: {
    ratio: [350, 440],
    cardWidth: 16.6,
    points: [
      { x: 32, y: 47.6, z: 3 },
      { x: 32, y: 47.6, z: 4, rotate: 90 },
      { x: 32, y: 70.3, z: 2 },
      { x: 11.4, y: 47.6, z: 2 },
      { x: 32, y: 24.9, z: 2 },
      { x: 52.6, y: 47.6, z: 2 },
      { x: 79.7, y: 84, z: 2 },
      { x: 79.7, y: 60.8, z: 2 },
      { x: 79.7, y: 37.6, z: 2 },
      { x: 79.7, y: 14.4, z: 2 },
    ],
  },
};

export function getLayout(kind: LayoutKind): SpreadLayout | null {
  if (kind === "single" || kind === "row") return null;
  return SPREAD_LAYOUTS[kind];
}
