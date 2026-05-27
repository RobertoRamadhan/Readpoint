<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$ebooks = \App\Models\Ebook::all();
echo "Total Ebooks: " . $ebooks->count() . "\n";
echo "Active Ebooks: " . \App\Models\Ebook::where('is_active', true)->count() . "\n\n";

foreach($ebooks as $e) {
    echo $e->title . " - is_active: " . ($e->is_active ? 'true' : 'false') . "\n";
}
