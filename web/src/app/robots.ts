import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    /*
      /doc/ và /rut-bai/ đều không muốn lên Google, nhưng chỗ để nói điều đó
      là thẻ noindex trên trang chứ không phải dòng Disallow ở đây. Hai trang
      đó đã mang sẵn noindex, mà noindex chỉ có tác dụng khi bot đọc được
      trang: cấm ở robots.txt thì Google không vào đọc, không thấy thẻ, và
      link vẫn có thể lọt vào chỉ mục dưới dạng URL trần nếu có ai trỏ tới.

      Quan trọng hơn với hai trang này: crawler dựng thẻ xem trước của
      Facebook, Messenger và Zalo đều nghe theo robots.txt. Bị cấm là chúng
      không quét, không quét thì link dán vào khung chat ra mỗi dòng URL,
      không ảnh không tiêu đề — trong khi opengraph-image.tsx vẫn vẽ ảnh
      đúng. Muốn giấu khỏi kết quả tìm kiếm mà vẫn có ảnh khi chia sẻ thì
      phải cho vào, rồi để thẻ noindex làm việc của nó.

      /soat là trang nội bộ và /api/ không trả HTML, không có gì để xem
      trước, nên hai chỗ đó cấm tiếp.
    */
    rules: [{ userAgent: "*", allow: "/", disallow: ["/soat", "/api/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
