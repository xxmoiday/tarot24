/**
 * Cấu hình PM2 cho Tarot24.
 * Chạy:  pm2 start ecosystem.config.cjs && pm2 save
 * Biến môi trường bí mật đọc từ .env.local, không để trong tệp này.
 */
module.exports = {
  apps: [
    {
      name: "tarot24",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start --port 3111",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 10,
      max_memory_restart: "600M",
      env: {
        NODE_ENV: "production",
        PORT: "3111",
      },
    },
  ],
};
