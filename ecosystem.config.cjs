// پیکربندی PM2 برای نرم‌افزار بایگانی
// استفاده: pm2 start ecosystem.config.cjs
// راهنما: deploy/SERVER-DEPLOY.md

module.exports = {
  apps: [
    {
      name: "kaman",
      script: "node_modules/.bin/next",
      args: "start -p 3000",
      cwd: __dirname + "/..",
      env: {
        NODE_ENV: "production",
      },
      env_file: ".env",
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      watch: false,
      max_memory_restart: "512M",
      error_file: "./logs/kaman-error.log",
      out_file: "./logs/kaman-out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      kill_timeout: 5000,
    },
  ],
}
