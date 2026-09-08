export interface LegalSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

export interface LegalDoc {
  slug: string;
  title: string;
  /** Nhãn ngắn dùng ở chân trang và ở dải liên kết cuối mỗi trang. */
  label: string;
  excerpt: string;
  intro: string;
  sections: LegalSection[];
}

export const LEGAL_EMAIL = "damdinhhuy@gmail.com";

/** Ngày sửa gần nhất của cả ba văn bản. Sửa nội dung thì sửa luôn ngày này. */
export const LEGAL_UPDATED = "2026-09-08";

/** Trong nội dung, {email} được thay bằng liên kết thư. */
export const EMAIL_TOKEN = "{email}";

export function formatLegalDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${Number(d)} tháng ${Number(m)}, ${y}`;
}

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "dieu-khoan",
    label: "Điều khoản dịch vụ",
    title: "Điều khoản dịch vụ",
    excerpt:
      "Điều kiện dùng Tarot24: dịch vụ gồm những gì, bạn được và không được làm gì, bản quyền nội dung, và giới hạn trách nhiệm.",
    intro:
      "Đây là thoả thuận giữa bạn và Tarot24 khi bạn mở trang này. Dùng trang tức là bạn đồng ý với những điều dưới đây. Không đồng ý thì đừng dùng, đơn giản vậy thôi.",
    sections: [
      {
        heading: "Tarot24 là gì",
        paragraphs: [
          "Tarot24 là một trang web rút bài tarot bằng tiếng Việt. Bạn đặt một câu hỏi, chọn kiểu trải, rút bài, và nhận một bài luận. Trang còn có thư viện nghĩa 78 lá, mô tả 11 kiểu trải và một mục kiến thức.",
          "Bài luận do một mô hình ngôn ngữ viết ra, không phải do người xem bài viết. Đọc thêm ở trang Miễn trừ trách nhiệm.",
          "Dịch vụ hiện miễn phí, không cần đăng ký, không cần tài khoản. Chúng tôi không hứa nó sẽ miễn phí mãi, nhưng nếu đổi thì sẽ báo trước trên trang.",
        ],
      },
      {
        heading: "Ai được dùng",
        paragraphs: [
          "Trang dành cho người từ 18 tuổi trở lên. Người dưới 18 tuổi chỉ nên dùng khi có cha mẹ hoặc người giám hộ biết và đồng ý.",
          "Bạn tự chịu trách nhiệm với mọi việc bạn làm trên trang và với mọi quyết định bạn đưa ra sau khi đọc bài.",
        ],
      },
      {
        heading: "Những việc không được làm",
        paragraphs: [
          "Trang mở cho tất cả mọi người, nên có vài giới hạn để nó còn chạy được cho người khác.",
        ],
        list: [
          "Dội lượt gọi, quét dữ liệu hàng loạt, hoặc dùng công cụ tự động vượt quá mức một người dùng bình thường",
          "Tìm cách phá, dò lỗ hổng, hoặc truy cập phần không dành cho công chúng",
          "Nhập vào ô câu hỏi thông tin định danh của người khác, hoặc dữ liệu nhạy cảm về sức khoẻ, tài chính, đời tư của bất kỳ ai",
          "Dùng bài đọc để doạ dẫm, thao túng, hay ép buộc người khác",
          "Lấy nội dung của trang đăng lại ở nơi khác cho mục đích thương mại khi chưa hỏi",
          "Mạo danh Tarot24, hoặc để người khác hiểu nhầm rằng bài luận do một nhà tarot người thật viết",
        ],
      },
      {
        heading: "Câu hỏi bạn nhập vào",
        paragraphs: [
          "Câu hỏi bạn gõ vẫn là của bạn. Nhưng để trả về bài luận, bạn cho phép Tarot24 xử lý câu đó: gửi sang nhà cung cấp mô hình ngôn ngữ, và lưu lại cùng bài luận trên máy chủ. Chi tiết ở trang Chính sách riêng tư.",
          "Đừng gõ vào ô câu hỏi những gì bạn không muốn người khác đọc được. Khi bạn bấm chia sẻ, câu hỏi và các lá bài nằm ngay trong đường dẫn, nên ai cầm được đường dẫn là xem được cả bài.",
        ],
      },
      {
        heading: "Bản quyền nội dung",
        paragraphs: [
          "Phần chữ trên trang gồm nghĩa 78 lá, mô tả kiểu trải, bài kiến thức và cách trình bày là của Tarot24. Bạn được đọc, được lưu về xem riêng, được dẫn lại kèm nguồn. Chép nguyên khối để đăng ở nơi khác hoặc để bán thì cần chúng tôi đồng ý bằng văn bản.",
          "Ảnh 78 lá là bản quét bộ Rider–Waite–Smith in năm 1909, nay thuộc phạm vi công cộng.",
          "Bài luận trả về cho riêng bạn thì bạn dùng thoải mái, kể cả đăng lại. Chúng tôi không đòi quyền gì trên bài luận của bạn.",
        ],
      },
      {
        heading: "Trang chạy tới đâu thì chạy",
        paragraphs: [
          "Dịch vụ được cung cấp nguyên trạng. Chúng tôi không cam kết trang luôn chạy, luôn đúng, hay luôn có mặt. Máy chủ có thể ngưng, mô hình có thể lỗi, bài luận có thể không sinh ra được.",
          "Có giới hạn số lượt rút bài theo từng địa chỉ mạng để một người không chiếm hết tài nguyên của người khác. Chạm trần thì bạn đợi một lúc rồi thử lại.",
          "Chúng tôi có thể sửa, tạm ngưng hoặc dừng hẳn bất kỳ phần nào của trang, bất cứ lúc nào, mà không cần báo trước.",
        ],
      },
      {
        heading: "Giới hạn trách nhiệm",
        paragraphs: [
          "Trong phạm vi pháp luật cho phép, Tarot24 không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh từ việc bạn dùng trang hoặc tin theo bài đọc, bao gồm thiệt hại về tiền bạc, công việc, quan hệ hay sức khoẻ.",
          "Bài đọc không phải lời khuyên chuyên môn. Quyết định là của bạn, hệ quả cũng là của bạn.",
        ],
      },
      {
        heading: "Liên kết ra ngoài",
        paragraphs: [
          "Trang có dẫn sang lenormand24.online và có thể dẫn sang vài nơi khác. Chúng tôi không kiểm soát nội dung ở đó và không chịu trách nhiệm về những trang ấy.",
        ],
      },
      {
        heading: "Sửa điều khoản",
        paragraphs: [
          "Điều khoản này có thể được sửa. Bản mới đăng lên trang là bản có hiệu lực, kèm ngày sửa ở đầu trang. Bạn tiếp tục dùng trang sau khi bản mới đăng nghĩa là bạn đồng ý với nó.",
        ],
      },
      {
        heading: "Luật áp dụng và liên hệ",
        paragraphs: [
          "Điều khoản này chịu sự điều chỉnh của pháp luật Việt Nam. Có gì vướng, hãy viết thư trước cho chúng tôi để cùng giải quyết.",
          `Thư về ${EMAIL_TOKEN}.`,
        ],
      },
    ],
  },
  {
    slug: "rieng-tu",
    label: "Chính sách riêng tư",
    title: "Chính sách riêng tư",
    excerpt:
      "Tarot24 lưu gì, gửi đi đâu, giữ bao lâu và bạn xoá bằng cách nào. Không tài khoản, không cookie, không công cụ theo dõi.",
    intro:
      "Trang này nói thật về dữ liệu, không vòng vo. Tarot24 không có tài khoản, không đặt cookie, không gắn công cụ đo lường hay quảng cáo. Nhưng để viết được bài luận thì câu hỏi của bạn phải đi qua vài chỗ, và dưới đây là đúng những chỗ đó.",
    sections: [
      {
        heading: "Chúng tôi lưu gì",
        paragraphs: [
          "Chỉ hai thứ, và không thứ nào là thông tin định danh do chúng tôi hỏi bạn.",
        ],
        list: [
          "Bài đọc: câu hỏi bạn gõ, kiểu trải, các lá đã rút, bài luận, cùng những câu hỏi thêm và câu trả lời. Cụm này được lưu trên máy chủ của chúng tôi để mở lại đường dẫn bài đọc lần sau vẫn ra đúng bài cũ",
          "Địa chỉ mạng (IP): chỉ dùng để đếm lượt rút bài, giữ tạm trong bộ nhớ máy chủ và tự xoá sau khoảng một giờ. Chúng tôi không ghi IP vào cơ sở dữ liệu và không gắn nó với bài đọc nào",
        ],
      },
      {
        heading: "Chúng tôi không lưu gì",
        paragraphs: [
          "Không tên, không email, không số điện thoại, không ngày sinh, không vị trí. Trang không có chỗ để đăng ký nên đơn giản là không có những dữ liệu đó, trừ khi chính bạn viết thư cho chúng tôi.",
          "Trang không đặt cookie và không lưu gì trong trình duyệt của bạn. Không có Google Analytics, không có mã quảng cáo, không có pixel theo dõi.",
          "Phông chữ được đóng gói và phục vụ ngay từ máy chủ của trang, nên trình duyệt của bạn không phải gọi sang máy chủ của bên thứ ba khi tải trang.",
        ],
      },
      {
        heading: "Câu hỏi của bạn nằm ngay trong đường dẫn",
        paragraphs: [
          "Điểm này quan trọng, đọc kỹ. Khi có bài đọc, đường dẫn dạng /doc/… chứa chính câu hỏi và các lá bài của bạn, ở dạng mã hoá đơn giản chứ không phải mã hoá bảo mật. Ai giải mã cũng đọc ra được.",
          "Nghĩa là: đường dẫn đó là một bí mật chỉ khi bạn giữ riêng. Gửi cho ai là người đó xem được cả câu hỏi. Dán vào nhóm chat, đăng lên mạng xã hội, hay để lộ trong lịch sử trình duyệt dùng chung đều là công khai nó.",
          "Vì vậy đừng gõ vào ô câu hỏi tên thật của người khác, bệnh án, chuyện tiền bạc cụ thể, hay bất cứ gì bạn không muốn bị đọc. Hỏi bằng cách gọi tên vai trò cũng đủ để bài luận nói đúng chuyện.",
        ],
      },
      {
        heading: "Dữ liệu đi qua những bên nào",
        paragraphs: [
          "Để sinh bài luận, câu hỏi và các lá bài của bạn được gửi tới nhà cung cấp mô hình ngôn ngữ. Đây là chuyển dữ liệu ra ngoài lãnh thổ Việt Nam, nên chúng tôi nói rõ ở đây.",
        ],
        list: [
          "DeepSeek (Trung Quốc) là nơi xử lý chính hiện nay",
          "Anthropic và OpenAI (Hoa Kỳ) là phương án dự phòng khi nơi trên không phản hồi",
          "Nhà cung cấp máy chủ và mạng phân phối nội dung, có nhật ký truy cập kỹ thuật theo mặc định gồm địa chỉ mạng, thời điểm và đường dẫn được gọi",
        ],
      },
      {
        heading: "Chúng tôi không bán, không đổi chác",
        paragraphs: [
          "Chúng tôi không bán dữ liệu, không cho thuê, không trao đổi với bên quảng cáo, và không dùng bài đọc của bạn để huấn luyện mô hình của riêng mình.",
          "Chúng tôi chỉ cung cấp dữ liệu khi cơ quan nhà nước có thẩm quyền yêu cầu theo đúng trình tự pháp luật.",
        ],
      },
      {
        heading: "Giữ bao lâu, xoá thế nào",
        paragraphs: [
          "Bài đọc được giữ đến khi bạn yêu cầu xoá. Địa chỉ mạng dùng đếm lượt thì tự xoá trong vòng một giờ.",
          `Muốn xoá một bài đọc, gửi thư tới ${EMAIL_TOKEN} kèm đường dẫn /doc/… của bài đó. Chúng tôi xoá trong vòng 7 ngày làm việc và trả lời lại cho bạn. Vì không có tài khoản nên đường dẫn chính là thứ duy nhất xác định được bài của bạn.`,
          "Bạn cũng có quyền hỏi chúng tôi đang giữ gì về một bài đọc cụ thể, và quyền phản đối việc xử lý. Cách làm giống hệt: gửi thư kèm đường dẫn.",
        ],
      },
      {
        heading: "Trẻ em",
        paragraphs: [
          "Trang không dành cho người dưới 18 tuổi và chúng tôi không cố ý thu thập dữ liệu của trẻ em. Nếu bạn là cha mẹ và phát hiện con mình đã gửi thông tin qua trang, hãy viết thư cho chúng tôi để xoá.",
        ],
      },
      {
        heading: "Sửa chính sách",
        paragraphs: [
          "Chính sách này có thể được sửa khi cách trang hoạt động thay đổi. Ngày sửa gần nhất luôn nằm ở đầu trang. Thay đổi lớn về việc dữ liệu đi đâu sẽ được nêu rõ ngay trong phần đầu.",
          `Có gì chưa rõ, cứ hỏi thẳng qua thư ${EMAIL_TOKEN}.`,
        ],
      },
    ],
  },
  {
    slug: "mien-tru",
    label: "Miễn trừ trách nhiệm",
    title: "Miễn trừ trách nhiệm và minh bạch về AI",
    excerpt:
      "Bài luận trên Tarot24 do máy viết, dùng để tham khảo, không thay lời khuyên y tế, pháp lý, tài chính hay tâm lý.",
    intro:
      "Tarot24 không giấu chuyện này: bài luận bạn đọc do một mô hình ngôn ngữ viết ra, và tarot không phải một phương pháp có bằng chứng khoa học. Biết rõ hai điều đó rồi thì bạn dùng trang đúng cách hơn nhiều.",
    sections: [
      {
        heading: "Bài luận do máy viết, không phải người",
        paragraphs: [
          "Không có nhà tarot nào ngồi sau màn hình đọc bài cho bạn. Câu hỏi và các lá bài của bạn được đưa vào một mô hình ngôn ngữ, mô hình viết ra bài luận, và trang hiển thị lại nguyên văn.",
          "Mô hình ngôn ngữ có thể viết sai, viết mâu thuẫn, hoặc nói chắc chắn về những chuyện nó không thể biết. Nó không nhớ bạn, không biết hoàn cảnh của bạn ngoài những gì bạn gõ, và không theo dõi chuyện gì xảy ra sau đó.",
          "Chúng tôi có bước soát tự động để chặn những bài luận đi quá xa, nhưng không có bước nào là hoàn hảo. Đọc bằng con mắt của người tỉnh táo.",
        ],
      },
      {
        heading: "Tarot dùng để soi, không dùng để đoán",
        paragraphs: [
          "Tarot không có cơ sở khoa học trong việc dự đoán tương lai. Cái nó làm được là đặt chuyện của bạn ra thành hình để bạn nhìn từ ngoài vào, và gợi ra những câu hỏi bạn đang tránh.",
          "Không lá bài nào quyết định chuyện gì sẽ xảy ra. Bài luận nói về việc bạn đang đứng ở đâu và làm được gì tiếp theo, chứ không phải một bản tin dự báo.",
          "Coi trang này như một cách để nghĩ cho rõ, hoặc như một thú vui. Đừng coi nó là căn cứ để quyết những chuyện lớn.",
        ],
      },
      {
        heading: "Không thay lời khuyên chuyên môn",
        paragraphs: [
          "Bài đọc không phải và không thay thế được ý kiến của người có chuyên môn. Với những chuyện dưới đây, hãy tìm đúng người:",
        ],
        list: [
          "Sức khoẻ thân thể hoặc tinh thần: bác sĩ, nhà tâm lý, cơ sở y tế",
          "Pháp lý, hợp đồng, tranh chấp: luật sư",
          "Tiền bạc, đầu tư, vay nợ: chuyên viên tài chính có giấy phép",
          "Chuyện gia đình nghiêm trọng, bạo lực, an toàn: cơ quan chức năng và các tổ chức hỗ trợ",
        ],
      },
      {
        heading: "Khi chuyện đã khẩn cấp",
        paragraphs: [
          "Nếu bạn đang nghĩ tới việc làm hại bản thân hoặc người khác, hoặc đang ở trong tình huống nguy hiểm, đừng rút bài. Hãy gọi cấp cứu 115, hoặc tới cơ sở y tế gần nhất, hoặc nói với một người bạn tin.",
          "Với trẻ em đang bị xâm hại hoặc bỏ rơi, Tổng đài quốc gia bảo vệ trẻ em 111 nhận cuộc gọi miễn phí suốt ngày đêm.",
        ],
      },
      {
        heading: "Từ 18 tuổi trở lên",
        paragraphs: [
          "Nội dung trên trang dành cho người trưởng thành. Một số lá bài nói tới mất mát, đổ vỡ và cái chết theo nghĩa biểu tượng; người đang trong giai đoạn khó khăn về tâm lý nên cân nhắc trước khi đọc.",
        ],
      },
      {
        heading: "Quyết định vẫn là của bạn",
        paragraphs: [
          "Bạn là người duy nhất chịu trách nhiệm với những gì bạn làm sau khi đọc bài. Tarot24 không chịu trách nhiệm về bất kỳ mất mát hay thiệt hại nào phát sinh từ việc bạn tin theo hay làm theo bài đọc.",
          "Không dùng bài đọc trên trang để khuyên, doạ hay quyết thay cho người khác.",
        ],
      },
      {
        heading: "Về hình ảnh bộ bài",
        paragraphs: [
          "Mọi mô tả hình vẽ và nghĩa lá trên trang dựa trên bộ Rider–Waite–Smith xuất bản năm 1909. Ảnh dùng trên trang là bản quét bộ in gốc, nay thuộc phạm vi công cộng. Tarot24 không có liên kết với bất kỳ nhà xuất bản bài tarot nào.",
          `Thấy chỗ nào sai hoặc cần gỡ, viết thư cho chúng tôi ở ${EMAIL_TOKEN}.`,
        ],
      },
    ],
  },
];

export function getLegalDoc(slug: string) {
  return LEGAL_DOCS.find((d) => d.slug === slug);
}
