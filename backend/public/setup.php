<?php
/**
 * ReadPoint Setup Script
 * Run once via browser or cPanel deployment
 * DELETE this file after successful setup!
 */

$basePath = dirname(__DIR__);
echo '<pre style="background:#1a1a1a;color:#00ff00;padding:20px;font-size:13px;">';
echo "=== ReadPoint Server Setup ===\n";
echo "PHP: " . PHP_VERSION . "\n";
echo "Base: $basePath\n\n";

// Find PHP binary
$phpBin = PHP_BINARY ?: '/usr/local/bin/php';
echo "PHP Binary: $phpBin\n\n";

// Find Composer
$composerPaths = [
    '/usr/local/bin/composer',
    '/usr/bin/composer',
    '/opt/cpanel/composer/bin/composer',
    $basePath . '/composer.phar',
];

$composerBin = null;
foreach ($composerPaths as $path) {
    if (file_exists($path)) {
        $composerBin = $path;
        break;
    }
}

// Download composer if not found
if (!$composerBin) {
    echo "Downloading Composer...\n";
    $composerSetup = file_get_contents('https://getcomposer.org/installer');
    file_put_contents($basePath . '/composer-setup.php', $composerSetup);
    exec("$phpBin $basePath/composer-setup.php --install-dir=$basePath --filename=composer.phar 2>&1", $out);
    echo implode("\n", $out) . "\n";
    @unlink($basePath . '/composer-setup.php');
    $composerBin = $basePath . '/composer.phar';
}

echo "Composer: $composerBin\n\n";

// Run composer install
echo "--- Running composer install ---\n";
$cmd = "$phpBin $composerBin install --no-dev --optimize-autoloader --no-interaction --working-dir=$basePath 2>&1";
exec($cmd, $out);
echo implode("\n", $out) . "\n\n";

// Check if vendor exists
if (!is_dir($basePath . '/vendor')) {
    echo "ERROR: vendor folder still missing after composer install!\n";
    echo "Exiting...\n</pre>";
    exit;
}

echo "vendor/ folder exists!\n\n";

// Run artisan commands
$commands = [
    'key:generate --force',
    'config:clear',
    'config:cache',
    'route:clear',
    'route:cache',
    'view:clear',
    'migrate --force',
    'storage:link',
];

foreach ($commands as $cmd) {
    echo "--- php artisan $cmd ---\n";
    exec("$phpBin $basePath/artisan $cmd 2>&1", $out, $code);
    echo implode("\n", $out) . "\n\n";
    $out = [];
}

echo "=== SETUP COMPLETE! DELETE THIS FILE NOW! ===\n";
echo "Delete: $basePath/public/setup.php\n";
echo '</pre>';
