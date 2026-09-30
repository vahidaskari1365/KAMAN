#!/usr/bin/env bash
# اسکریپت نصب یک‌مرحله‌ای نرم‌افزار بایگانی روی سرور اختصاصی
# استفاده:  bash deploy/install.sh
# روی سرور با کاربر دارای sudo اجرا کنید.

set -e

APP_NAME="kaman"
APP_DIR="/opt/kaman"
APP_USER="kaman"

echo "=== نصب نرم‌افزار بایگانی ==="

# ۱) نصب وابستگی‌های سیستمی (Node.js + bun + nginx + git)
if ! command -v node &> /dev/null; then
  echo "[+] نصب Node.js 20 ..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

if ! command -v bun &> /dev/null; then
  echo "[+] نصب bun ..."
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
  # اضافه کردن به PATH برای دفعات بعد
  grep -qxF 'export BUN_INSTALL="$HOME/.bun"' "$HOME/.bashrc" 2>/dev/null || \
    echo 'export BUN_INSTALL="$HOME/.bun"; export PATH="$BUN_INSTALL/bin:$PATH"' >> "$HOME/.bashrc"
fi

if ! command -v nginx &> /dev/null; then
  echo "[+] نصب nginx ..."
  sudo apt-get install -y nginx
fi

if ! command -v pm2 &> /dev/null; then
  echo "[+] نصب pm2 ..."
  sudo npm install -g pm2
fi

# ۲) ایجاد کاربر و مسیر برنامه (در صورت نیاز)
if ! id -u "$APP_USER" &> /dev/null; then
  echo "[+] ایجاد کاربر $APP_USER ..."
  sudo useradd -r -m -d "$APP_DIR" -s /bin/bash "$APP_USER"
else
  sudo mkdir -p "$APP_DIR"
  sudo chown "$APP_USER:$APP_USER" "$APP_DIR"
fi

echo ""
echo "=== پیش‌نیازها نصب شد. مراحل بعد را به‌صورت دستی انجام دهید: ==="
echo ""
echo "1) کد را در $APP_DIR کلون کنید:"
echo "   sudo -u $APP_USER git clone https://github.com/vahidaskari1365/KAMAN.git $APP_DIR/app"
echo ""
echo "2) فایل .env بسازید (الگوی deploy/.env.example):"
echo "   sudo -u $APP_USER cp $APP_DIR/app/deploy/.env.example $APP_DIR/app/.env"
echo "   sudo -u $APP_USER nano $APP_DIR/app/.env   # مقادیر را تنظیم کنید"
echo ""
echo "3) نصب وابستگی‌ها و build:"
echo "   cd $APP_DIR/app"
echo "   sudo -u $APP_USER bun install"
echo "   sudo -u $APP_USER bun run build"
echo ""
echo "4) اجرا با pm2:"
echo "   sudo -u $APP_USER pm2 start ecosystem.config.cjs"
echo "   sudo -u $APP_USER pm2 save"
echo "   sudo pm2 startup   # برای اجرای خودکار هنگام بوت"
echo ""
echo "5) تنظیم nginx (الگو در deploy/nginx.conf):"
echo "   sudo cp deploy/nginx.conf /etc/nginx/sites-available/kaman"
echo "   sudo nano /etc/nginx/sites-available/kaman   # دامنه را تنظیم کنید"
echo "   sudo ln -s /etc/nginx/sites-available/kaman /etc/nginx/sites-enabled/"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "=== نصب اولیه کامل شد ==="
