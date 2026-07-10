<?php
/**
 * Test Script untuk Test API Backend
 * Cara pakai: php test-api.php
 */

$baseUrl = 'http://127.0.0.1:8000/api';
$results = [];

function apiCall($method, $endpoint, $data = null, $token = null) {
    global $baseUrl;
    
    $url = $baseUrl . $endpoint;
    $ch = curl_init($url);
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    $headers = ['Content-Type: application/json', 'Accept: application/json'];
    if ($token) {
        $headers[] = "Authorization: Bearer $token";
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'status' => $httpCode,
        'body' => json_decode($response, true),
        'raw' => $response
    ];
}

function test($name, $method, $endpoint, $data = null, $token = null) {
    global $results;
    
    echo "\n🧪 Testing: $name\n";
    echo "   $method $endpoint\n";
    
    $result = apiCall($method, $endpoint, $data, $token);
    $success = $result['status'] >= 200 && $result['status'] < 300;
    
    $results[] = [
        'name' => $name,
        'success' => $success,
        'status' => $result['status'],
    ];
    
    if ($success) {
        echo "   ✅ Success ({$result['status']})\n";
    } else {
        echo "   ❌ Failed ({$result['status']})\n";
        if (isset($result['body']['message'])) {
            echo "   Error: {$result['body']['message']}\n";
        }
    }
    
    return $result;
}

echo "╔══════════════════════════════════════════════════════════╗\n";
echo "║  🚀 Readpoint API Testing Script                         ║\n";
echo "╚══════════════════════════════════════════════════════════╝\n";

// 1. Setup - Create default users
echo "\n📋 STEP 1: Setup Default Users\n";
echo str_repeat("─", 60) . "\n";
$setup = test('Setup Init', 'GET', '/setup/init');

// 2. Login as Admin
echo "\n📋 STEP 2: Authentication Tests\n";
echo str_repeat("─", 60) . "\n";
$adminLogin = test('Admin Login', 'POST', '/auth/login', [
    'email' => 'admin@gmail.com',
    'password' => 'password'
]);
$adminToken = $adminLogin['body']['token'] ?? null;

$guruLogin = test('Guru Login', 'POST', '/auth/login', [
    'email' => 'guru@gmail.com',
    'password' => 'password'
]);
$guruToken = $guruLogin['body']['token'] ?? null;

$siswaLogin = test('Siswa Login', 'POST', '/auth/login', [
    'email' => 'siswa@gmail.com',
    'password' => 'password'
]);
$siswaToken = $siswaLogin['body']['token'] ?? null;

if (!$adminToken || !$guruToken || !$siswaToken) {
    echo "\n❌ Login failed! Cannot continue tests.\n";
    exit(1);
}

echo "\n✅ All users logged in successfully!\n";
echo "   Admin Token: " . substr($adminToken, 0, 20) . "...\n";
echo "   Guru Token: " . substr($guruToken, 0, 20) . "...\n";
echo "   Siswa Token: " . substr($siswaToken, 0, 20) . "...\n";

// 3. Test Protected Endpoints
echo "\n📋 STEP 3: User Profile Tests\n";
echo str_repeat("─", 60) . "\n";
test('Get Admin Profile', 'GET', '/user/profile', null, $adminToken);
test('Get Guru Profile', 'GET', '/user/profile', null, $guruToken);
test('Get Siswa Profile', 'GET', '/user/profile', null, $siswaToken);

// 4. Test Dashboard Endpoints
echo "\n📋 STEP 4: Dashboard Tests\n";
echo str_repeat("─", 60) . "\n";
test('Admin Stats', 'GET', '/dashboard/admin/stats', null, $adminToken);
test('Admin Top Students', 'GET', '/dashboard/admin/top-students', null, $adminToken);
test('Guru Stats', 'GET', '/dashboard/guru/stats', null, $guruToken);
test('Siswa Stats', 'GET', '/dashboard/siswa/stats', null, $siswaToken);

// 5. Test Ebook Endpoints
echo "\n📋 STEP 5: Ebook Tests\n";
echo str_repeat("─", 60) . "\n";
test('List Ebooks', 'GET', '/ebooks', null, $siswaToken);

// 6. Test Reward Endpoints
echo "\n📋 STEP 6: Reward Tests\n";
echo str_repeat("─", 60) . "\n";
test('List Rewards', 'GET', '/rewards', null, $siswaToken);

// 7. Test User Management
echo "\n📋 STEP 7: User Management Tests\n";
echo str_repeat("─", 60) . "\n";
test('List All Users (Admin)', 'GET', '/users', null, $adminToken);
test('List Users (Guru - Should Fail)', 'GET', '/users', null, $guruToken);

// Summary
echo "\n\n╔══════════════════════════════════════════════════════════╗\n";
echo "║  📊 Test Summary                                          ║\n";
echo "╚══════════════════════════════════════════════════════════╝\n\n";

$total = count($results);
$passed = count(array_filter($results, fn($r) => $r['success']));
$failed = $total - $passed;

echo "Total Tests: $total\n";
echo "✅ Passed: $passed\n";
echo "❌ Failed: $failed\n";
echo "\nSuccess Rate: " . round(($passed / $total) * 100, 1) . "%\n";

if ($failed > 0) {
    echo "\nFailed Tests:\n";
    foreach ($results as $result) {
        if (!$result['success']) {
            echo "  - {$result['name']} (HTTP {$result['status']})\n";
        }
    }
}

echo "\n" . str_repeat("═", 60) . "\n";
echo "🎯 Use these tokens to test frontend:\n\n";
echo "Admin Token:\n$adminToken\n\n";
echo "Guru Token:\n$guruToken\n\n";
echo "Siswa Token:\n$siswaToken\n\n";
echo str_repeat("═", 60) . "\n";
