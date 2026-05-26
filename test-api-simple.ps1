Write-Host "=== Testing NestJS APIs ===" -ForegroundColor Green
Write-Host ""

# Test 1: Home
Write-Host "1. Testing Home Endpoint" -ForegroundColor Cyan
try {
    $resp = Invoke-RestMethod -Uri "http://localhost:3000/" -Method Get -TimeoutSec 5
    Write-Host "Status: 200 OK"
    Write-Host "Response: $($resp | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Users
Write-Host "`n2. Testing Get Users" -ForegroundColor Cyan
try {
    $resp = Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method Get -TimeoutSec 5
    Write-Host "Status: 200 OK"
    Write-Host "Response: $($resp | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "This is OK if authentication is required" -ForegroundColor Yellow
}

# Test 3: LoaiXe
Write-Host "`n3. Testing Get Vehicle Types" -ForegroundColor Cyan
try {
    $resp = Invoke-RestMethod -Uri "http://localhost:3000/api/loai-xe" -Method Get -TimeoutSec 5
    Write-Host "Status: 200 OK"
    Write-Host "Response: $($resp | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
}

# Test 4: BangGia
Write-Host "`n4. Testing Get Pricing" -ForegroundColor Cyan
try {
    $resp = Invoke-RestMethod -Uri "http://localhost:3000/api/bang-gia" -Method Get -TimeoutSec 5
    Write-Host "Status: 200 OK"
    Write-Host "Response: $($resp | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
}

# Test 5: Simple Auth Register
Write-Host "`n5. Testing Simple Auth Register" -ForegroundColor Cyan
try {
    $body = @{
        email = "test$(Get-Random)@example.com"
        password = "TestPass123!"
        firstName = "Test"
        lastName = "User"
    } | ConvertTo-Json
    
    $resp = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 5
    Write-Host "Status: 201 Created" -ForegroundColor Green
    Write-Host "Response: $($resp | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Error: Check server logs for details" -ForegroundColor Yellow
}

Write-Host "`n=== Tests Complete ===" -ForegroundColor Green
