<?php
/**
 * Comprehensive API Test - Test All Endpoints
 * Usage: php test-comprehensive.php
 */

$baseUrl = 'http://127.0.0.1:8000/api';
$results = ['passed' => 0, 'failed' => 0, 'details' => []];

function test($name, $method, $endpoint, $data = null, $token = null, $expectStatus = 200) {
    global $baseUrl, $results;
    
    $url = $baseUrl . $endpoint;
    $ch = curl_init($url);
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    $headers = ['Content-Type: application/json', 'Accept: application/json'];
    if ($token) $headers[] = "Authorization: Bearer $token";
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $passed = ($httpCode == $expectStatus);
    $results[$passed ? 'passed' : 'failed']++;
    $results['details'][] = compact('name', 'passed', 'httpCode', 'expectStatus');
    
    $status = $passed ? "✅" : "❌";
    echo "$status $name (HTTP $httpCode)\n";
    
    return ['status' => $httpCode, 'body' => json_decode($response, true)];
}

echo "╔════════════════════════════════════════════════════════════╗\n";
echo "║  🧪 Readpoint - Comprehensive API Test Suite              ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n\n";

// Get tokens
echo "🔑 Getting authentication tokens...\n";
$adminLogin = test('Admin Login', 'POST', '/auth/login', ['email' => 'admin@gmail.com', 'password' => 'password']);
$guruLogin = test('Guru Login', 'POST', '/auth/login', ['email' => 'guru@gmail.com', 'password' => 'password']);
$siswaLogin = test('Siswa Login', 'POST', '/auth/login', ['email' => 'siswa@gmail.com', 'password' => 'password']);

$adminToken = $adminLogin['body']['token'] ?? null;
$guruToken = $guruLogin['body']['token'] ?? null;
$siswaToken = $siswaLogin['body']['token'] ?? null;

if (!$adminToken || !$guruToken || !$siswaToken) {
    echo "\n❌ Login failed! Cannot continue.\n";
    exit(1);
}

// Test Categories
echo "\n📚 Testing Ebook Endpoints\n" . str_repeat("─", 60) . "\n";
test('List Ebooks (Siswa)', 'GET', '/ebooks', null, $siswaToken);
test('List Ebooks (Guru)', 'GET', '/ebooks', null, $guruToken);
test('List Ebooks (Admin)', 'GET', '/ebooks', null, $adminToken);

echo "\n🎁 Testing Reward Endpoints\n" . str_repeat("─", 60) . "\n";
test('List Rewards (Siswa)', 'GET', '/rewards', null, $siswaToken);
test('Get User Points', 'GET', '/user-points', null, $siswaToken);

echo "\n👥 Testing User Endpoints\n" . str_repeat("─", 60) . "\n";
test('Get Profile (Admin)', 'GET', '/user/profile', null, $adminToken);
test('Get Profile (Guru)', 'GET', '/user/profile', null, $guruToken);
test('Get Profile (Siswa)', 'GET', '/user/profile', null, $siswaToken);
test('List All Users (Admin)', 'GET', '/users', null, $adminToken);
test('List Users (Guru - Should Fail)', 'GET', '/users', null, $guruToken, 403);

echo "\n📊 Testing Dashboard Endpoints\n" . str_repeat("─", 60) . "\n";
test('Admin Stats', 'GET', '/dashboard/admin/stats', null, $adminToken);
test('Admin Top Students', 'GET', '/dashboard/admin/top-students', null, $adminToken);
test('Guru Stats', 'GET', '/dashboard/guru/stats', null, $guruToken);
test('Siswa Stats', 'GET', '/dashboard/siswa/stats', null, $siswaToken);

echo "\n📖 Testing Reading Activity Endpoints\n" . str_repeat("─", 60) . "\n";
test('Get My Activities', 'GET', '/reading-activities', null, $siswaToken);
test('Get Frequently Read', 'GET', '/reading-activities/frequently-read', null, $siswaToken);

echo "\n🎯 Testing Quiz Endpoints\n" . str_repeat("─", 60) . "\n";
test('Get My Quiz Attempts', 'GET', '/quiz/my-attempts', null, $siswaToken);

echo "\n🔒 Testing Authorization\n" . str_repeat("─", 60) . "\n";
test('Admin Endpoint (Siswa - Should Fail)', 'GET', '/dashboard/admin/stats', null, $siswaToken, 403);
test('Guru Endpoint (Siswa - Should Fail)', 'GET', '/dashboard/guru/stats', null, $siswaToken, 403);
test('Siswa Endpoint (Admin - Should Fail)', 'GET', '/dashboard/siswa/stats', null, $adminToken, 403);

echo "\n🚫 Testing Unauthenticated Access\n" . str_repeat("─", 60) . "\n";
test('Protected Route No Token (Should Fail)', 'GET', '/user/profile', null, null, 401);
test('Dashboard No Token (Should Fail)', 'GET', '/dashboard/admin/stats', null, null, 401);

// Summary
$total = $results['passed'] + $results['failed'];
$rate = round(($results['passed'] / $total) * 100, 1);

echo "\n\n╔════════════════════════════════════════════════════════════╗\n";
echo "║  📊 Test Summary                                           ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n\n";
echo "Total Tests: $total\n";
echo "✅ Passed: {$results['passed']}\n";
echo "❌ Failed: {$results['failed']}\n";
echo "Success Rate: $rate%\n";

if ($results['failed'] > 0) {
    echo "\n❌ Failed Tests:\n";
    foreach ($results['details'] as $test) {
        if (!$test['passed']) {
            echo "  - {$test['name']} (Expected {$test['expectStatus']}, Got {$test['httpCode']})\n";
        }
    }
}

echo "\n" . str_repeat("═", 60) . "\n";
echo $rate >= 95 ? "🎉 EXCELLENT!" : ($rate >= 80 ? "✅ GOOD" : "⚠️ NEEDS IMPROVEMENT");
echo " - API is " . ($rate >= 90 ? "production ready" : "needs fixes") . "\n";
echo str_repeat("═", 60) . "\n";
