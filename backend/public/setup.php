<?php
// SECURITY: Delete this file immediately after use!
// Hapus file ini segera setelah digunakan!

$basePath = dirname(__DIR__);
$output = [];

function runCommand($cmd) {
    $output = [];
    exec($cmd . ' 2>&1', $output);
    return implode("\n", $output);
}

echo '<pre style="background:#1a1a1a;color:#00ff00;padding:20px;font-family:monospace;">';
echo "=== ReadPoint Setup Script ===\n\n";

// 1. Check PHP version
echo "PHP Version: " . PHP_VERSION . "\n";
echo "Base Path: $basePath\n\n";

// 2. Composer install
echo "--- Running composer install ---\n";
$result = runCommand("cd $basePath && composer install --no-dev --optimize-autoloader --no-interaction");
echo $result . "\n\n";

// 3. Generate APP_KEY if empty
echo "--- Generating APP_KEY ---\n";
$result = runCommand("cd $basePath && php artisan key:generate --force");
echo $result . "\n\n";

// 4. Run migrations
echo "--- Running migrations ---\n";
$result = runCommand("cd $basePath && php artisan migrate --force");
echo $result . "\n\n";

// 5. Storage link
echo "--- Creating storage link ---\n";
$result = runCommand("cd $basePath && php artisan storage:link");
echo $result . "\n\n";

// 6. Cache config
echo "--- Caching config ---\n";
$result = runCommand("cd $basePath && php artisan config:cache");
echo $result . "\n\n";

// 7. Cache routes
echo "--- Caching routes ---\n";
$result = runCommand("cd $basePath && php artisan route:cache");
echo $result . "\n\n";

echo "=== DONE! DELETE THIS FILE NOW! ===\n";
echo '</pre>';
