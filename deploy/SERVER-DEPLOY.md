# راهنمای دیپلوی روی سرور اختصاصی (VPS)

این مسیر بهترین گزینه برای نرم‌افزار بایگانی است چون SQLite و فایل‌های آپلودی **واقعاً ماندگار** می‌شوند.

## پیش‌نیازها
- یک سرور لینوکس (Ubuntu 22.04+ پیشنهادی) با دسترسی `sudo`
- حداقل ۱ گیگابایت RAM
- (اختیاری) یک دامنه

## مرحله ۱: نصب پیش‌نیازها (یک‌بار)

```bash
# نصب Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx

# نصب bun
curl -fsSL https://bun.sh/install | bash
echo 'export BUN_INSTALL="$HOME/.bun"; export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# نصب pm2 برای اجرای پایدار
sudo npm install -g pm2
```

## مرحله ۲: کلون و راه‌اندازی

```bash
# یک کاربر اختصاصی بساز (اختیاری ولی توصیه‌شده)
sudo useradd -r -m -d /opt/kaman -s /bin/bash kaman

# به کاربر سوئیچ کن
sudo -u kaman bash
cd /opt/kaman

# کلون کد
git clone https://github.com/vahidaskari1365/KAMAN.git app
cd app

# فایل .env بساز
cp deploy/.env.example .env
nano .env   # مسیرها را تأیید کن
```

محتوای `.env`:
```env
DATABASE_URL=file:/var/lib/kaman/custom.db
UPLOAD_DIR=/var/lib/kaman/uploads
NODE_ENV=production
PORT=3000
```

ایجاد پوشه‌های دائمی:
```bash
sudo mkdir -p /var/lib/kaman/uploads
sudo chown -R kaman:kaman /var/lib/kaman
```

نصب وابستگی‌ها و build:
```bash
bun install
bun run build
```

## مرحله ۳: اجرا با pm2 (پایدار)

```bash
# از پوشه‌ی app
pm2 start ecosystem.config.cjs
pm2 save

# اجرای خودکار هنگام بوت سرور
exit   # برگشت به کاربر sudo
sudo pm2 startup
# دستوری که pm2 نمایش می‌دهد را کپی و اجرا کن
sudo pm2 save
```

بررسی وضعیت:
```bash
pm2 status
pm2 logs kaman
```

حالا برنامه روی `http://localhost:3000` در حال اجراست.

## مرحله ۴: nginx (reverse proxy + HTTPS)

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/kaman
sudo nano /etc/nginx/sites-available/kaman
# در خط server_name، دامنه یا IP خود را بگذار
sudo ln -s /etc/nginx/sites-available/kaman /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

برای HTTPS (پیشنهادی):
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d archive.yourdomain.com
```

## مرحله ۵: اولین داده‌ها

مرورگر را روی `http://<سرور-یا-دامنه>` باز کنید. اولین ریکوئست داشبورد، جدول‌ها را
خودکار می‌سازد و داده‌های نمونه (۴ سازمان + ۹ قرارداد شامل علوم پزشکی اصفهان) را
ایجاد می‌کند.

کاربری ادمین پیش‌فرض: `admin` / `admin123`

## به‌روزرسانی بعدی

وقتی کد جدیدی push شد:
```bash
cd /opt/kaman/app
git pull
bun install
bun run build
pm2 restart kaman
```

## پشتیبان‌گیری (پیشنهادی: روزانه)

دو مسیر مهم: دیتابیس و فایل‌های آپلودی.
```bash
# در crontab:
0 3 * * * tar czf /backups/kaman-$(date +\%F).tar.gz /var/lib/kaman
# نگه‌داری ۳۰ روز آخر
0 4 * * * find /backups -name "kaman-*.tar.gz" -mtime +30 -delete
```

## رفع مشکل
- اگر داشبورد خالی بود: `pm2 logs kaman` را ببینید.
- اگر فایل آپلود نشد: دسترسی پوشه‌ی `/var/lib/kaman/uploads` را چک کنید `sudo chown -R kaman:kaman /var/lib/kaman`.
- اگر پورت ۳۰۰۰ اشغال بود: در `.env` مقدار `PORT` را تغییر دهید و nginx را هم هماهنگ کنید.
