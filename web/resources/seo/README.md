# Bài SEO cho trang lá bài

78 bài dài, mỗi bài khoảng 900–1000 tiếng, viết tay từ KB (không crawl).
Chúng nằm dưới các khối tra nhanh ở `/la-bai/<slug>` và là phần mang từ khoá
dài về cho trang đó.

- `BAI_SEO.md` — bản đọc cho người, để soát nội dung và bàn với nhau.
- `../../data/seo.source.json` — **bản duy nhất app đọc**, được commit.
  Sửa nội dung thì sửa thẳng ở đó rồi cập nhật lại `BAI_SEO.md` cho khớp;
  bộ này không có bước build Python như `kb/`.

Cấu trúc mỗi bài: `title`, `meta_description`, `h1`, `mo_dau[]`,
`muc[]` (6 mục, `key` là `noi_gi|nguoc|tinh_cam|cong_viec|tien_bac|dung_nham`)
và `hoi_dap[]`.

Soát lại sau khi sửa:

    npm run check:seo
