/**
 * Chỗ một lá bài đang đứng trên màn.
 *
 * Bài trong ứng dụng này hay đi từ màn này sang màn khác — cỗ vừa xào xong sang
 * bàn bài, lá vừa rút sang ô của nó — và lần nào cũng phải đi từ đúng chỗ mắt
 * vừa nhìn thấy nó, chứ hiện ra ở nơi khác thì đứt mạch. Nên chỗ ấy được đo lúc
 * rời đi rồi trao cho bên nhận.
 */
export interface DeckSpot {
  /** Tâm lá bài, tính theo khung nhìn. */
  x: number;
  y: number;
  /** Bề ngang thật của lá, chưa tính xoay, để bên nhận co giãn cho khớp. */
  w: number;
}

/**
 * Đo chỗ một lá bài đang đứng.
 *
 * Tâm đọc từ khung bao ngoài nên lá có nghiêng cũng vẫn đúng, còn bề ngang đọc
 * từ bố cục: khung bao của lá nghiêng rộng hơn chính lá cả tấc, lấy nó làm khổ
 * thì lá bên kia phình to ra một cách vô cớ.
 */
export function spotOf(el: HTMLElement): DeckSpot {
  const r = el.getBoundingClientRect();
  return {
    x: r.left + r.width / 2,
    y: r.top + r.height / 2,
    w: el.offsetWidth || r.width,
  };
}
