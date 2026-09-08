/**
 * Cấu hình PM2 cho backend Tarot24.
 * Chạy:  npm run build && pm2 start ecosystem.config.cjs
 * Bí mật đọc từ .env qua @nestjs/config, không để trong tệp này.
 */
module.exports = {
  apps: [
    {
      name: "tarot24-backend",
      cwd: __dirname,
      script: "dist/main.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 10,
      max_memory_restart: "400M",
      env: { NODE_ENV: "production" },
    },
  ],
};
