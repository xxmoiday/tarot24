/**
 * Căn phòng quanh cỗ bài: viền tối bốn phía và hai ngọn nến hắt vào từ ngoài
 * khung.
 *
 * Nến ở đây là ánh nến, không phải cây nến. Vẽ một cây nến bằng CSS là dựng
 * thêm một thứ ngôn ngữ mà cả trang không có ở đâu khác; thứ duy nhất mang được
 * không khí ấy mà vẫn nói cùng một giọng với cỗ bài là ánh sáng của nó.
 *
 * Phòng phủ cả khung nhìn chứ không riêng cột chữ, vì góc phòng là góc màn hình
 * chứ không phải góc của cột 720px — neo vào cột thì hai ngọn nến rơi vào giữa
 * màn, thành hai vệt sáng lửng lơ chẳng của ai.
 *
 * -z-10 đặt nó xuống dưới mọi thứ: nến là thứ ở sau lưng, không phải tấm kính
 * trước mặt. Nằm dưới nên viền tối không phủ lên cỗ bài hay lá đã rút — nó chỉ
 * làm tối cái nền — mà thanh đầu trang trong mờ thì vẫn thấy chút hơi ấm thấm
 * qua.
 *
 * Cùng một căn phòng ấy đứng suốt từ màn xào sang bàn bài. Hai màn dựng lại nó
 * chứ không truyền tay nhau, nhưng vì phòng nào cũng y hệt phòng nào nên lúc
 * đổi màn chẳng ai thấy gì; đổi lại là mỗi màn tự lo lúc nào phòng tắt.
 */
export function RitualRoom({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden ${className}`}
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
        nghi thức đang theo: vũng sáng trên mặt bàn lệch về trái, bóng cỗ bài đổ
        xuống chếch dưới phải. Nó xuyên qua được viền tối vì đèn gần thì vẫn
        sáng ở góc, chứ viền tối là chuyện của ống kính.

        Tâm ngọn nến đặt sát mép, vòng sáng thì to hơn cả màn: nhìn vào chỉ thấy
        quãng tản ra, không thấy cái lõi. Có lõi trong khung thì nó thành một
        đốm nâu nằm chình ình ở góc chứ không phải ánh sáng của một ngọn nến
        đứng ngoài khung.
      */}
      <div
        className="animate-candle absolute top-[12%] left-[4%] h-[155vmin] w-[155vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle,rgba(222,170,100,0.15),rgba(214,152,84,0.05) 26%,rgba(214,152,84,0) 58%)",
        }}
      />
      {/* Ngọn thứ hai ở xa, góc dưới bên phải, mờ hơn hẳn — nó chỉ hắt lại chút
          hơi ấm cho góc kia khỏi chết hẳn, không tranh phần đổ bóng. */}
      <div
        className="animate-candle-far absolute right-[7%] bottom-[10%] h-[125vmin] w-[125vmin] translate-x-1/2 translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle,rgba(222,170,100,0.065),rgba(214,152,84,0.022) 28%,rgba(214,152,84,0) 58%)",
        }}
      />
    </div>
  );
}
