# Use PHP-FPM instead of CLI for better performance
FROM php:8.2-fpm

# Install system dependencies and Nginx
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    curl \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql zip mbstring exif pcntl bcmath gd xml

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy application files
COPY . /var/www/html

# Install PHP dependencies (no dev, optimised autoloader)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set file permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache || true

# Copy nginx config
COPY docker/nginx.conf /etc/nginx/sites-available/default

# Copy supervisor config
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose port (Railway will set PORT env var)
EXPOSE 8000

# Startup script: run migrations, create storage symlink, then start supervisor
CMD sh -c "\
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan migrate --force && \
    php artisan storage:link --force || true && \
    /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf"
