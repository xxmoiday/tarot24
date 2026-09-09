#!/usr/bin/env bash
#
# Đưa backend lên VPS. Chạy từ máy dev, không cần chạy gì trên VPS trước.
#
#   npm run deploy:vps            triển khai
#   npm run deploy:vps -- --thu   xem sẽ đồng bộ những gì, không đụng vào VPS
#
# Build hỏng hoặc backend không sống lại thì script tự trả về bản dist cũ.
#
set -euo pipefail

VPS_HOST=${VPS_HOST:-45.76.161.193}
VPS_USER=${VPS_USER:-root}
VPS_KEY=${VPS_KEY:-$HOME/.ssh/tarot24_vps}
VPS_DIR=${VPS_DIR:-/var/www/tarot24-backend}
PM2_NAME=${PM2_NAME:-tarot24-backend}
HEALTH_URL=${HEALTH_URL:-https://api.tarot24.online/api/health}

DRY=""
[[ "${1:-}" == "--thu" || "${1:-}" == "--dry-run" ]] && DRY=1

API_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$API_DIR"

SSH=(ssh -i "$VPS_KEY" -o ConnectTimeout=15 "$VPS_USER@$VPS_HOST")

buoc() { printf '\n\033[1m▸ %s\033[0m\n' "$*"; }
xong() { printf '  ✓ %s\n' "$*"; }
hong() { printf '\033[31m  ✗ %s\033[0m\n' "$*" >&2; }

# ---------------------------------------------------------------- kiểm tại chỗ
buoc "Kiểm tại máy dev"

if [[ -n $(git status --porcelain 2>/dev/null) ]]; then
  echo "  ! cây làm việc còn thay đổi chưa commit, sẽ đẩy nguyên trạng đĩa lên"
fi

npm run sync:kb >/dev/null
npm run check:kb >/dev/null && xong "dữ liệu KB khớp"

# Build ở đây trước để lỗi biên dịch lộ ra khi VPS còn chưa bị đụng tới.
npm run build >/dev/null 2>&1 || { hong "build ở máy dev hỏng, dừng lại"; exit 1; }
xong "build ở máy dev đạt"

# ------------------------------------------------------------------- đồng bộ
# .env ở lại trên VPS: khoá và mật khẩu database chỉ nằm ở đó.
RSYNC=(
  rsync -az --delete
  --exclude node_modules --exclude dist --exclude .git
  --exclude '.env*' --exclude '*.tsbuildinfo'
  -e "ssh -i $VPS_KEY -o ConnectTimeout=15"
  ./ "$VPS_USER@$VPS_HOST:$VPS_DIR/"
)

if [[ -n $DRY ]]; then
  buoc "Thử: những tệp sẽ đồng bộ"
  "${RSYNC[@]}" --dry-run --itemize-changes | grep -v '^\.d\.\.t' || true
  echo
  echo "Chưa đụng gì tới VPS. Bỏ --thu để triển khai thật."
  exit 0
fi

buoc "Đồng bộ mã nguồn sang $VPS_USER@$VPS_HOST:$VPS_DIR"
"${RSYNC[@]}"
xong "đã đồng bộ"

# ------------------------------------------------- cài, build và khởi động lại
buoc "Cài, build và khởi động lại trên VPS"

# npm trên VPS cũ hơn máy dev nên `npm ci` báo thiếu gói dù lock hợp lệ,
# xem api/DEPLOY.md. Dùng `npm install` là đủ và không đụng npm toàn cục.
"${SSH[@]}" bash -s <<REMOTE
set -euo pipefail
cd "$VPS_DIR"

# Giữ bản dist đang chạy để còn đường lùi. Máy mới chưa có dist thì bỏ qua.
rm -rf dist.truoc
if [ -d dist ]; then cp -a dist dist.truoc; fi

npm install --no-audit --no-fund --silent
npm run build >/dev/null

[ -f dist/main.js ] || { echo "  ✗ build xong mà không có dist/main.js"; exit 1; }
pm2 restart "$PM2_NAME" --update-env >/dev/null
REMOTE
xong "đã build và khởi động lại"

# ------------------------------------------------------------------ soát sống
buoc "Soát backend"

song=""
for i in $(seq 1 20); do
  if "${SSH[@]}" "curl -fsS -m 5 http://127.0.0.1:3210/api/health" 2>/dev/null | grep -q '"ok":true'; then
    song=1
    break
  fi
  sleep 2
done

if [[ -z $song ]]; then
  hong "backend không sống lại sau 40 giây, trả về bản cũ"
  "${SSH[@]}" bash -s <<REMOTE
set -euo pipefail
cd "$VPS_DIR"
if [ -d dist.truoc ]; then
  rm -rf dist && mv dist.truoc dist
  pm2 restart "$PM2_NAME" --update-env >/dev/null
  echo "  đã quay về bản dist trước đó"
else
  echo "  không có bản cũ để lùi về"
fi
REMOTE
  echo
  echo "Xem log:  ssh -i $VPS_KEY $VPS_USER@$VPS_HOST 'pm2 logs $PM2_NAME --lines 60 --nostream'"
  exit 1
fi

"${SSH[@]}" "rm -rf $VPS_DIR/dist.truoc"

suc_khoe=$(curl -fsS -m 20 "$HEALTH_URL" || echo '')
if [[ "$suc_khoe" != *'"ok":true'* ]]; then
  hong "qua $HEALTH_URL chưa thấy ok (backend trong máy thì sống), soát lại nginx hoặc DNS"
  echo "  nhận được: ${suc_khoe:-không có phản hồi}"
  exit 1
fi
xong "$HEALTH_URL → $suc_khoe"

# Cổng chặn phải còn đóng sau mỗi lần triển khai.
ma=$(curl -s -o /dev/null -m 20 -w '%{http_code}' -X POST "${HEALTH_URL%/api/health}/api/readings" \
  -H 'content-type: application/json' -d '{"id":"x"}')
if [[ "$ma" == "403" ]]; then
  xong "gọi không kèm x-api-key vẫn bị chặn (403)"
else
  hong "gọi không kèm x-api-key trả $ma, đáng lẽ phải 403 — kiểm API_KEY trong .env trên VPS"
  exit 1
fi

buoc "Xong"
"${SSH[@]}" "pm2 describe $PM2_NAME | grep -E 'status|uptime|restarts' | head -3"
