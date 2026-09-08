export interface ArticleSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  updated: string;
  minutes: number;
  intro: string;
  sections: ArticleSection[];
  faq: { q: string; a: string }[];
}

export const ARTICLES: Article[] = [
  {
    slug: "tarot-la-gi",
    title: "Tarot là gì và bộ bài 78 lá gồm những gì",
    excerpt:
      "Nguồn gốc bộ bài, cấu trúc 78 lá, và cách hiểu tarot cho đúng: một công cụ soi chuyện, không phải máy đoán tương lai.",
    updated: "2026-01-12",
    minutes: 6,
    intro:
      "Tarot là một bộ bài 78 lá dùng để soi một chuyện đang xảy ra, bằng cách rút ngẫu nhiên vài lá rồi đọc chúng theo vị trí đã định trước. Bài không biết tương lai; cái nó làm được là đặt chuyện của bạn ra thành hình để bạn nhìn từ ngoài vào.",
    sections: [
      {
        heading: "Bộ bài gồm những gì",
        paragraphs: [
          "78 lá chia làm hai phần. Hai mươi hai lá Ẩn Chính, đánh số từ 0 tới 21, nói về những mạch lớn của một đời người: bắt đầu, chọn lựa, đổ vỡ, hồi phục, kết thúc. Năm mươi sáu lá Ẩn Phụ chia thành bốn bộ, mỗi bộ mười bốn lá, nói về chuyện thường ngày.",
          "Bốn bộ là Gậy, Cốc, Kiếm, Tiền. Mỗi bộ có mười lá số từ Át tới Mười, cộng bốn lá hình: Tiểu Đồng, Hiệp Sĩ, Hoàng Hậu, Vua.",
        ],
        list: [
          "Ẩn Chính · 22 lá · mạch lớn, chuyện không hoàn toàn nằm trong tay bạn",
          "Bộ Gậy · 14 lá · hành động, ý chí, nghề nghiệp, lửa",
          "Bộ Cốc · 14 lá · cảm xúc, quan hệ, nước",
          "Bộ Kiếm · 14 lá · suy nghĩ, lời nói, xung đột, khí",
          "Bộ Tiền · 14 lá · tiền bạc, công việc, thân thể, đất",
        ],
      },
      {
        heading: "Bộ bài này từ đâu ra",
        paragraphs: [
          "Những bộ bài kiểu tarot xuất hiện ở Ý từ khoảng thế kỷ mười lăm, ban đầu để chơi chứ không để bói. Việc dùng bài để soi chuyện phổ biến từ cuối thế kỷ mười tám ở Pháp.",
          "Bộ hình được dùng nhiều nhất hiện nay là Rider–Waite–Smith, xuất bản năm 1909, do Pamela Colman Smith vẽ theo hướng dẫn của Arthur Edward Waite. Điểm khác biệt lớn của bộ này là 56 lá Ẩn Phụ đều có tranh kể chuyện, nên người mới nhìn hình cũng đoán được nghĩa. Toàn bộ nghĩa trên Tarot24 dựa trên bộ hình này.",
        ],
      },
      {
        heading: "Tarot làm được gì và không làm được gì",
        paragraphs: [
          "Bài làm tốt việc mô tả: chuyện đang ở trạng thái nào, cái gì đang chặn, bạn đang đứng ở tư thế nào trong đó. Nó cũng làm tốt việc gọi tên thứ bạn đã biết mà chưa chịu nói ra.",
          "Bài không nói được ngày giờ chính xác, không thay chẩn đoán y tế, không thay tư vấn pháp lý hay tài chính, và không quyết thay bạn. Một bài đọc tử tế bao giờ cũng kết thúc bằng một việc bạn làm được trong tuần này, chứ không phải một lời hứa.",
        ],
      },
    ],
    faq: [
      {
        q: "Người mới nên bắt đầu từ đâu",
        a: "Bắt đầu bằng trải một lá mỗi ngày. Rút một lá, đọc nghĩa, rồi tối nhìn lại xem ngày hôm đó có ăn khớp không. Làm đều một tháng thì 78 lá sẽ tự vào đầu.",
      },
      {
        q: "Có cần thuộc lòng nghĩa của cả 78 lá không",
        a: "Không. Nhớ mạch của bốn bộ và ý của các con số là đã đọc được phần lớn. Nghĩa chi tiết tra lại khi cần.",
      },
    ],
  },
  {
    slug: "an-chinh-an-phu",
    title: "Ẩn Chính và Ẩn Phụ khác nhau ra sao",
    excerpt:
      "Khi nào một chuyện là mạch lớn của đời, khi nào chỉ là việc trong tuần — 22 lá Ẩn Chính và 56 lá Ẩn Phụ trả lời khác nhau.",
    updated: "2026-01-20",
    minutes: 5,
    intro:
      "Trong một trải bài, tỉ lệ Ẩn Chính so với Ẩn Phụ nói cho bạn biết chuyện này lớn cỡ nào và bạn nắm được bao nhiêu phần của nó.",
    sections: [
      {
        heading: "Ẩn Chính: mạch lớn, ít nằm trong tay bạn",
        paragraphs: [
          "Hai mươi hai lá Ẩn Chính là những chặng lớn: Chàng Khờ bước đi, Toà Tháp sập, Cái Chết kết thúc một chương, Thế Giới khép một vòng. Khi chúng xuất hiện nhiều, chuyện bạn hỏi không phải là việc xử trong một cuộc họp.",
          "Ẩn Chính thường mô tả lực đang tác động lên bạn hơn là việc bạn nên làm. Gặp ba, bốn lá Ẩn Chính trong một trải ba lá, cách đọc đúng là chậm lại và nhìn cho hết, thay vì tìm ngay một hành động.",
        ],
      },
      {
        heading: "Ẩn Phụ: chuyện thường ngày, sửa được",
        paragraphs: [
          "Năm mươi sáu lá Ẩn Phụ nói chuyện cụ thể: cãi nhau với đồng nghiệp, tiền tháng này, một tin nhắn chưa gửi. Đây là phần bạn can thiệp được.",
          "Trong Ẩn Phụ, lá số nói tình huống, lá hình nói người: một người trong chuyện, hoặc một tư thế bạn đang mang. Tiểu Đồng là người mới học, Hiệp Sĩ là người đang lao đi, Hoàng Hậu là người giữ và nuôi, Vua là người cầm trịch.",
        ],
      },
      {
        heading: "Đọc tỉ lệ trong một trải bài",
        paragraphs: [
          "Toàn Ẩn Phụ nghĩa là chuyện đang ở tầm xử lý được, làm đúng vài việc là chuyển. Nhiều Ẩn Chính nghĩa là có một mạch lớn đang chạy và bạn đang ở giữa nó.",
          "Trộn đều thì đọc theo thứ tự: Ẩn Chính đặt bối cảnh, Ẩn Phụ nói việc cần làm trong bối cảnh đó.",
        ],
      },
    ],
    faq: [
      {
        q: "Ẩn Chính có mạnh hơn Ẩn Phụ không",
        a: "Không mạnh hơn, chỉ ở tầm khác. Ẩn Chính nói về mạch, Ẩn Phụ nói về việc. Một lá Ẩn Phụ đặt đúng vị trí vẫn quyết định cách đọc cả trải.",
      },
    ],
  },
  {
    slug: "bon-bo-tarot",
    title: "Bốn bộ Gậy, Cốc, Kiếm, Tiền đọc thế nào",
    excerpt:
      "Mỗi bộ là một cách chuyện vận hành: lửa làm, nước cảm, khí nghĩ, đất giữ. Nắm bốn mạch này là đọc được 56 lá.",
    updated: "2026-02-02",
    minutes: 6,
    intro:
      "Bốn bộ Ẩn Phụ ứng với bốn nguyên tố. Biết bộ nào trội trong một trải bài là biết chuyện đang chạy bằng cái gì, và vì thế biết nên can thiệp bằng cái gì.",
    sections: [
      {
        heading: "Gậy · Hoả · làm",
        paragraphs: [
          "Bộ Gậy nói về ý chí, nghề nghiệp, khởi sự, cạnh tranh. Khi Gậy trội, chuyện đang đòi bạn hành động chứ không đòi bạn phân tích thêm. Nhiều Gậy ngược thường là hết lửa, hoặc lửa dùng sai chỗ.",
        ],
      },
      {
        heading: "Cốc · Thuỷ · cảm",
        paragraphs: [
          "Bộ Cốc nói về tình cảm, quan hệ, mối nối giữa người với người. Cốc trội nghĩa là lý lẽ sẽ không giải quyết được chuyện này; phải xử ở tầng cảm xúc. Cốc ngược nhiều là cảm xúc bị chặn, hoặc bị đổ quá nhiều vào một chỗ.",
        ],
      },
      {
        heading: "Kiếm · Khí · nghĩ",
        paragraphs: [
          "Bộ Kiếm nói về suy nghĩ, lời nói, sự thật, xung đột. Kiếm là bộ nhiều lá khó nhất, vì phần lớn nỗi khổ trong đó do chính đầu mình tạo ra. Kiếm trội thì việc cần làm thường là nói ra một câu, hoặc thôi kể cho mình một câu chuyện.",
        ],
      },
      {
        heading: "Tiền · Thổ · giữ",
        paragraphs: [
          "Bộ Tiền nói về tiền bạc, công việc, sức khoẻ, nhà cửa — những thứ đo được. Tiền trội là chuyện rất cụ thể, và cách xử cũng phải cụ thể: một con số, một cuộc hẹn, một hồ sơ.",
        ],
      },
      {
        heading: "Con số trong bộ",
        paragraphs: [
          "Trong mỗi bộ, con số cho nhịp: Át là hạt giống, Hai là cặp đôi và cân nhắc, Ba là nhóm và thành hình lần đầu, Bốn là ổn định, Năm là mất mát và va chạm, Sáu là hồi phục và cho nhận, Bảy là đánh giá và giằng co, Tám là chuyển động và luyện tay, Chín là gần trọn, Mười là hết một vòng.",
        ],
      },
    ],
    faq: [
      {
        q: "Nếu trải bài chia đều bốn bộ thì sao",
        a: "Chia đều nghĩa là chuyện đang bị kéo bởi nhiều lực cùng lúc và chưa có một nguyên nhân chính. Lúc đó đọc theo vị trí thay vì đọc theo bộ.",
      },
    ],
  },
  {
    slug: "la-nguoc-tarot",
    title: "Lá ngược nghĩa là gì và có nên dùng không",
    excerpt:
      "Lá ngược không phải là điềm xấu. Nó là mạch của lá bị chặn, bị vặn, hoặc quay vào bên trong.",
    updated: "2026-02-15",
    minutes: 5,
    intro:
      "Lá ngược là lá rơi ra ở chiều xoay 180 độ so với người đọc. Có người dùng, có người không, và cả hai cách đều đọc được — miễn là chọn một cách rồi giữ nguyên.",
    sections: [
      {
        heading: "Ba cách hiểu lá ngược",
        paragraphs: [
          "Cách thứ nhất: mạch của lá bị chặn. Ngôi Sao xuôi là hy vọng đang chảy; Ngôi Sao ngược là hy vọng vẫn còn nhưng đang tắc lại.",
          "Cách thứ hai: mạch quay vào trong. Sức Mạnh xuôi là làm chủ được cơn nóng với người khác; Sức Mạnh ngược là trận đó đang diễn ra bên trong bạn.",
          "Cách thứ ba: quá liều. Điều Độ ngược không phải là thiếu điều độ chung chung, mà là thứ gì đó đang bị đẩy quá tay.",
        ],
      },
      {
        heading: "Khi nào nên bỏ lá ngược",
        paragraphs: [
          "Người mới nên bỏ, ít nhất trong vài tháng đầu. Bảy mươi tám nghĩa đã đủ nhiều, thêm bảy mươi tám nghĩa ngược thì dễ đọc thành đoán mò.",
          "Khi đã quen, bật lá ngược lên sẽ cho bài đọc sắc hơn, vì nó phân biệt được giữa một chuyện đang chạy và một chuyện đang bị kẹt.",
        ],
      },
      {
        heading: "Đừng đọc ngược là xấu",
        paragraphs: [
          "Nhiều lá xuôi đã khó rồi: Toà Tháp, Ba Kiếm, Mười Kiếm. Ngược lại, vài lá ngược là tin tốt: Ác Quỷ ngược là gỡ được xích, Tám Kiếm ngược là nhìn ra dây trói vốn lỏng.",
          "Cách đọc an toàn là hỏi mạch của lá này đang chảy hay đang tắc, thay vì hỏi lá này tốt hay xấu.",
        ],
      },
    ],
    faq: [
      {
        q: "Tarot24 có dùng lá ngược không",
        a: "Có. Mỗi lần rút, khoảng một phần ba số lá rơi ngược, và bài đọc sẽ nói rõ lá nào ngược cùng cách nó đổi nghĩa.",
      },
    ],
  },
  {
    slug: "cach-dat-cau-hoi-tarot",
    title: "Cách đặt câu hỏi cho một lần rút bài",
    excerpt:
      "Chín phần mười chất lượng bài đọc nằm ở câu hỏi. Câu hỏi mở, có bạn trong đó, và giới hạn thời gian.",
    updated: "2026-03-01",
    minutes: 5,
    intro:
      "Bài chỉ trả lời đúng cái được hỏi. Một câu hỏi mơ hồ sẽ cho ra một bài đọc mơ hồ, và người ta hay đổ lỗi cho bài trong khi lỗi nằm ở câu.",
    sections: [
      {
        heading: "Ba thứ làm câu hỏi tốt",
        paragraphs: [
          "Thứ nhất, câu hỏi mở. Thay vì hỏi có hay không cho mọi chuyện, hãy hỏi chuyện này đang đi về đâu, hoặc mình đang kẹt ở chỗ nào.",
          "Thứ hai, có bạn trong câu hỏi. Hỏi người ta nghĩ gì về mình thì bài chỉ nói được phần bạn quan sát được; hỏi mình nên làm gì với chuyện này thì bài trả lời được thẳng.",
          "Thứ ba, có mốc thời gian. Trong ba tháng tới, trong năm nay — có mốc thì tương lai gần mới đọc được cụ thể.",
        ],
      },
      {
        heading: "Những câu nên tránh",
        paragraphs: [
          "Tránh hỏi thay người khác về chuyện riêng của họ. Tránh hỏi lại cùng một câu vì không thích câu trả lời lần trước; rút lại năm lần thì đến lần thứ năm bạn chỉ đang chọn kết quả bạn muốn.",
          "Tránh những câu mà câu trả lời cần đến bác sĩ, luật sư hoặc chuyên gia tài chính. Bài không thay được họ.",
        ],
        list: [
          "Không nên: Bao giờ mình lấy chồng",
          "Nên: Mình đang mang gì vào các mối quan hệ khiến chúng không đi xa",
          "Không nên: Anh ấy có yêu mình không",
          "Nên: Giữa mình và anh ấy đang có gì và mình nên làm gì tiếp",
        ],
      },
      {
        heading: "Viết câu hỏi trước khi rút",
        paragraphs: [
          "Viết ra rồi hãy xào bài. Chỉ riêng việc viết đã làm rõ được một nửa vấn đề, và nó giữ cho bạn không đổi câu hỏi giữa chừng khi thấy lá không như ý.",
        ],
      },
    ],
    faq: [
      {
        q: "Một ngày rút được mấy lần",
        a: "Không có giới hạn cứng, nhưng đừng rút lại cùng một câu trong ngày. Nếu muốn hỏi thêm, hãy hỏi một câu khác, hẹp hơn, dựa trên bài đọc vừa rồi.",
      },
    ],
  },
  {
    slug: "chon-kieu-trai",
    title: "Chọn kiểu trải nào cho chuyện của bạn",
    excerpt:
      "Một lá cho câu hỏi nhanh, ba lá cho một mạch, năm lá cho một mối, mười lá cho một chuyện lớn.",
    updated: "2026-03-18",
    minutes: 4,
    intro:
      "Số lá không nói lên chất lượng bài đọc. Trải mười lá cho một câu hỏi nhỏ chỉ làm loãng, còn trải một lá cho một chuyện lớn thì hụt.",
    sections: [
      {
        heading: "Một lá",
        paragraphs: [
          "Dùng cho câu hỏi trong ngày, hoặc khi bạn chỉ cần một cú nhắc. Trải một lá có hay không thì thêm phần nghiêng về có hay nghiêng về không, kèm lý do.",
        ],
      },
      {
        heading: "Ba lá",
        paragraphs: [
          "Kiểu trải hữu dụng nhất. Ba lá quá khứ, hiện tại, tương lai gần cho bạn một mạch thời gian. Ba lá tình huống, trở ngại, lời khuyên cho bạn một chỗ kẹt và một hướng ra.",
        ],
      },
      {
        heading: "Bốn tới năm lá",
        paragraphs: [
          "Dùng khi chuyện có nhiều bên: một mối quan hệ có hai phía, một quyết định có hai hướng, một tháng có bốn tuần. Số lá ở đây là để tách các phần ra chứ không phải để nói nhiều hơn.",
        ],
      },
      {
        heading: "Mười lá · Thập tự Celtic",
        paragraphs: [
          "Dùng cho một chuyện lớn mỗi vài tháng một lần, không dùng hằng ngày. Mười vị trí cho bạn cả bối cảnh, gốc rễ, cái người ngoài nhìn vào, và kết cục nếu không đổi gì.",
        ],
      },
    ],
    faq: [
      {
        q: "Rút xong thấy chưa đủ thì làm sao",
        a: "Rút thêm một lá làm rõ cho một vị trí cụ thể, thay vì trải lại từ đầu. Hỏi hẹp hơn thì lá mới có chỗ để nói.",
      },
    ],
  },
  {
    slug: "doc-trai-ba-la",
    title: "Đọc một trải ba lá từng bước",
    excerpt:
      "Từ lúc lật lá tới lúc rút ra một việc làm được trong tuần: sáu bước, có ví dụ thật.",
    updated: "2026-04-05",
    minutes: 7,
    intro:
      "Đây là quy trình Tarot24 dùng để viết mọi bài luận. Bạn làm theo được cho bộ bài riêng của mình.",
    sections: [
      {
        heading: "Bước 1 · Nhìn cả ba lá trước khi đọc từng lá",
        paragraphs: [
          "Đếm Ẩn Chính, đếm lá ngược, xem bộ nào trội. Ba lá Tiền là chuyện vật chất; hai Kiếm một Cốc là chuyện đang bị cái đầu chi phối. Ấn tượng đầu tiên này định giọng cho cả bài.",
        ],
      },
      {
        heading: "Bước 2 · Đọc lá theo vị trí, không đọc rời",
        paragraphs: [
          "Cùng một lá Bốn Tiền, ở vị trí quá khứ là một thói quen giữ đã có từ lâu; ở vị trí lời khuyên lại là hãy giữ cái đang có, đừng buông vội. Vị trí quyết định nghĩa.",
        ],
      },
      {
        heading: "Bước 3 · Nối ba lá thành một câu chuyện",
        paragraphs: [
          "Hỏi lá một dẫn tới lá hai bằng cách nào, và lá hai đẻ ra lá ba ra sao. Nếu không nối được thì thường là bạn đang đọc nghĩa từ điển chứ chưa đọc trải bài.",
        ],
      },
      {
        heading: "Bước 4 · Tìm lá nặng nhất",
        paragraphs: [
          "Trong ba lá thường có một lá mang phần lớn sức nặng. Đó là lá bài muốn bạn nhìn. Bài luận nên xoay quanh nó.",
        ],
      },
      {
        heading: "Bước 5 · Nói thẳng cái khó",
        paragraphs: [
          "Nếu bài nói bạn đang sợ chứ không phải hoàn cảnh khó, thì phải nói ra. Một bài đọc chỉ toàn lời an ủi là một bài đọc vô dụng.",
        ],
      },
      {
        heading: "Bước 6 · Kết bằng một việc làm được",
        paragraphs: [
          "Kết thúc bằng một hành động có ngày giờ trong tuần này: viết ra một danh sách, gửi một tin nhắn, hỏi thẳng một người. Bài đọc không có bước này thì chỉ là mô tả.",
        ],
      },
    ],
    faq: [
      {
        q: "Nếu ba lá mâu thuẫn nhau thì sao",
        a: "Mâu thuẫn thường chính là câu trả lời: chuyện của bạn đang bị hai lực kéo ngược nhau. Gọi tên hai lực đó ra là đã đọc đúng.",
      },
    ],
  },
];

export const ARTICLE_BY_SLUG = new Map(ARTICLES.map((a) => [a.slug, a]));

export function getArticle(slug: string) {
  return ARTICLE_BY_SLUG.get(slug);
}
