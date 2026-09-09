# Ảnh hero trang chủ

Hero chạy vòng **ba ảnh** mờ chồng lên nhau. Danh sách nằm ở `HERO_IMAGES`
trong `src/components/HeroBanner.tsx`:

| Thứ tự | Tệp | Vai trò |
| --- | --- | --- |
| 1 | `banner-tarot-mystic.webp` | Ảnh nền, luôn đục, cũng là ảnh LCP |
| 2 | `banner-2.webp` | Ảnh nến, sách cũ, lọ thảo mộc, deck Mặt Trời |
| 3 | `banner-3.webp` | Ảnh cửa sổ sáng, hoa trắng, deck mặt trăng |

Ghi đè đúng tên tệp là đổi được ảnh, không phải sửa code. Muốn đổi tên hoặc thứ
tự thì sửa `HERO_IMAGES`.

## Yêu cầu ảnh

- Kích thước: **2400 × 1400 px** (tỉ lệ ~12:7), tối thiểu 1920 px bề ngang.
- Định dạng WebP. Cả ba ảnh đều tải về máy người xem nên **nhắm dưới ~250 KB
  mỗi ảnh**; ba ảnh 470 KB là 1,4 MB cho một lần vào trang.
- Tông tối, chi tiết chính lệch sang **phải** — nửa trái là chỗ đặt tiêu đề và nút.
- Ba ảnh nên cùng tông sáng và cùng gam màu, vì chúng mờ chồng lên nhau; lệch
  tông quá thì lúc chuyển cảnh sẽ thấy giật.
- Ảnh bị cắt theo khung nên đừng đặt chi tiết quan trọng sát mép.

## Chỉnh thêm

Trong `src/components/HeroBanner.tsx`:

- `CYCLE_MS` (21 giây) là một vòng chạy hết ba ảnh. Đổi thì phải sửa cả
  `--animate-hero-fade` trong `globals.css` cho khớp.
- `position` (mặc định `"50% 45%"`) là điểm neo chung khi ảnh bị cắt — đổi thành
  `"50% 30%"` nếu chủ thể nằm cao, `"70% 50%"` nếu nằm lệch phải.
- Chiều cao hero nằm ở các lớp `min-h-…` trong cùng tệp.
- Người tắt hiệu ứng chuyển động trong hệ điều hành chỉ thấy ảnh thứ nhất đứng yên.
