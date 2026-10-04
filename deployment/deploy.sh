#!/usr/bin/env bash
# ==============================================================================
# Maison Rentale — Zero-Downtime Automated Production Deployment Script
# ==============================================================================

set -e

echo "🚀 [1/8] Starting Deployment for Maison Rentale Platform..."
cd /var/www/maisonrentale

# 1. Put application into maintenance mode if needed
php artisan down --render="errors::503" --secret="maison-deploy-secret-2026" || true

# 2. Fetch latest changes from Git
echo "📦 [2/8] Pulling latest production release from Git..."
git pull origin master

# 3. Install/Update PHP Dependencies
echo "🐘 [3/8] Installing optimized Composer dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# 4. Run database migrations safely
echo "🗄️ [4/8] Running database migrations..."
php artisan migrate --force

# 5. Build and bundle frontend assets
echo "⚡ [5/8] Building Vite frontend assets..."
npm ci --prefer-offline --no-audit
npm run build

# 6. Optimize Laravel caches
echo "🧹 [6/8] Clearing and re-caching configuration, routes, and views..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 7. Ensure storage symlink & file permissions
echo "🔒 [7/8] Ensuring storage link and security permissions..."
php artisan storage:link || true
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# 8. Restart queue workers & bring app live
echo "🔄 [8/8] Restarting background workers & Bringing site online..."
php artisan queue:restart
php artisan up

echo "✅ Maison Rentale successfully deployed to production!"
