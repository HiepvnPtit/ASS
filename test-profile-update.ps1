# Self-Service Profile Update - Test Script (PowerShell)
# Tests the PATCH /auth/me endpoint with various scenarios

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$TestEmail = "testuser@example.com",
    [string]$TestPassword = "password123"
)

# Colors (Windows 10+)
$Green = "`e[0;32m"
$Red = "`e[0;31m"
$Yellow = "`e[1;33m"
$Blue = "`e[0;34m"
$Reset = "`e[0m"

function Print-Section {
    Write-Host "--- $args ---" -ForegroundColor Cyan
}

function Print-Success {
    Write-Host "✓ $args" -ForegroundColor Green
}

function Print-Error {
    Write-Host "✗ $args" -ForegroundColor Red
}

function Print-Info {
    Write-Host "ℹ $args" -ForegroundColor Yellow
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Profile Update API - Test Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Get JWT Token
Print-Section "Step 1: Get JWT Token"

try {
    $loginBody = @{
        email = $TestEmail
        matKhau = $TestPassword
    } | ConvertTo-Json

    $loginResponse = Invoke-WebRequest -Uri "$BaseUrl/auth/login" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $loginBody `
        -ErrorAction Stop

    $loginData = $loginResponse.Content | ConvertFrom-Json
    $JwtToken = $loginData.token

    if (-not $JwtToken) {
        Print-Error "Failed to get JWT token"
        Print-Info "Make sure:"
        Print-Info "1. Server is running at $BaseUrl"
        Print-Info "2. User exists with email: $TestEmail"
        Print-Info "3. Password is: $TestPassword"
        exit 1
    }

    Print-Success "JWT Token obtained: $($JwtToken.Substring(0, 20))..."
}
catch {
    Print-Error "Failed to get JWT token: $_"
    exit 1
}
Write-Host ""

# Test 2: Update Single Field (Name)
Print-Section "Test 1: Update Single Field (hoTen)"

try {
    $updateBody = @{
        hoTen = "Updated Name"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$BaseUrl/auth/me" `
        -Method PATCH `
        -Headers @{
            "Authorization" = "Bearer $JwtToken"
            "Content-Type" = "application/json"
        } `
        -Body $updateBody `
        -ErrorAction Stop

    $data = $response.Content | ConvertFrom-Json
    
    if ($data.hoTen -eq "Updated Name") {
        Print-Success "Name updated successfully"
        Write-Host "Response: $($response.Content | Select-Object -ExpandProperty maNguoiDung)"
    }
    else {
        Print-Error "Failed to update name"
        Write-Host "Response: $($response.Content)"
    }
}
catch {
    Print-Error "Failed: $_"
}
Write-Host ""

# Test 3: Update Multiple Fields
Print-Section "Test 2: Update Multiple Fields"

try {
    $updateBody = @{
        hoTen = "Nguyễn Văn Test"
        avatar = "https://example.com/avatar.jpg"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$BaseUrl/auth/me" `
        -Method PATCH `
        -Headers @{
            "Authorization" = "Bearer $JwtToken"
            "Content-Type" = "application/json"
        } `
        -Body $updateBody `
        -ErrorAction Stop

    $data = $response.Content | ConvertFrom-Json
    
    if ($data.hoTen -eq "Nguyễn Văn Test") {
        Print-Success "Multiple fields updated successfully"
    }
    else {
        Print-Error "Failed to update multiple fields"
    }
}
catch {
    Print-Error "Failed: $_"
}
Write-Host ""

# Test 4: Update Password
Print-Section "Test 3: Update Password"

try {
    $updateBody = @{
        matKhau = "newPassword123"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$BaseUrl/auth/me" `
        -Method PATCH `
        -Headers @{
            "Authorization" = "Bearer $JwtToken"
            "Content-Type" = "application/json"
        } `
        -Body $updateBody `
        -ErrorAction Stop

    $data = $response.Content | ConvertFrom-Json
    
    if ($data.maNguoiDung) {
        if ($data.matKhau) {
            Print-Error "Password returned in response (security issue)"
        }
        else {
            Print-Success "Password updated (not exposed in response)"
        }
    }
}
catch {
    Print-Error "Failed: $_"
}
Write-Host ""

# Test 5: Error - Invalid Email
Print-Section "Test 4: Validation - Invalid Email Format"

try {
    $updateBody = @{
        email = "invalid-email"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$BaseUrl/auth/me" `
        -Method PATCH `
        -Headers @{
            "Authorization" = "Bearer $JwtToken"
            "Content-Type" = "application/json"
        } `
        -Body $updateBody `
        -ErrorAction Stop
}
catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        $errorResponse = $_.Exception.Response.GetResponseStream() | ForEach-Object { New-Object System.IO.StreamReader $_ } | ForEach-Object { $_.ReadToEnd() }
        if ($errorResponse -match "must be an email") {
            Print-Success "Email validation working"
        }
        else {
            Print-Error "Email validation not working: $errorResponse"
        }
    }
}
Write-Host ""

# Test 6: Error - Invalid Phone
Print-Section "Test 5: Validation - Invalid Phone Format"

try {
    $updateBody = @{
        soDienThoai = "123"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$BaseUrl/auth/me" `
        -Method PATCH `
        -Headers @{
            "Authorization" = "Bearer $JwtToken"
            "Content-Type" = "application/json"
        } `
        -Body $updateBody `
        -ErrorAction Stop
}
catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        $errorResponse = $_.Exception.Response.GetResponseStream() | ForEach-Object { New-Object System.IO.StreamReader $_ } | ForEach-Object { $_.ReadToEnd() }
        if ($errorResponse -match "must match") {
            Print-Success "Phone validation working"
        }
        else {
            Print-Error "Phone validation not working: $errorResponse"
        }
    }
}
Write-Host ""

# Test 7: Error - No Authorization
Print-Section "Test 6: Security - Missing Authorization"

try {
    $updateBody = @{
        hoTen = "Test"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$BaseUrl/auth/me" `
        -Method PATCH `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $updateBody `
        -ErrorAction Stop

    Print-Error "Authorization not enforced"
}
catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Print-Success "Authorization required (401 returned)"
    }
    else {
        Print-Error "Wrong status code: $($_.Exception.Response.StatusCode)"
    }
}
Write-Host ""

# Test 8: Error - Invalid Token
Print-Section "Test 7: Security - Invalid JWT Token"

try {
    $updateBody = @{
        hoTen = "Test"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$BaseUrl/auth/me" `
        -Method PATCH `
        -Headers @{
            "Authorization" = "Bearer invalid.token.here"
            "Content-Type" = "application/json"
        } `
        -Body $updateBody `
        -ErrorAction Stop

    Print-Error "Invalid token not rejected"
}
catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Print-Success "Invalid token rejected (401 returned)"
    }
    else {
        Print-Error "Wrong status code: $($_.Exception.Response.StatusCode)"
    }
}
Write-Host ""

# Test 9: Error - Password Too Short
Print-Section "Test 8: Validation - Password Too Short"

try {
    $updateBody = @{
        matKhau = "123"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$BaseUrl/auth/me" `
        -Method PATCH `
        -Headers @{
            "Authorization" = "Bearer $JwtToken"
            "Content-Type" = "application/json"
        } `
        -Body $updateBody `
        -ErrorAction Stop
}
catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        $errorResponse = $_.Exception.Response.GetResponseStream() | ForEach-Object { New-Object System.IO.StreamReader $_ } | ForEach-Object { $_.ReadToEnd() }
        if ($errorResponse -match "6 characters") {
            Print-Success "Password length validation working"
        }
        else {
            Print-Error "Password length validation not working: $errorResponse"
        }
    }
}
Write-Host ""

# Test 10: Success - Empty Body (No-op)
Print-Section "Test 9: Edge Case - Empty Body"

try {
    $updateBody = @{} | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$BaseUrl/auth/me" `
        -Method PATCH `
        -Headers @{
            "Authorization" = "Bearer $JwtToken"
            "Content-Type" = "application/json"
        } `
        -Body $updateBody `
        -ErrorAction Stop

    $data = $response.Content | ConvertFrom-Json
    
    if ($data.maNguoiDung) {
        Print-Success "Empty body accepted (no-op)"
    }
}
catch {
    Print-Error "Failed: $_"
}
Write-Host ""

# Summary
Print-Section "Test Summary"
Write-Host ""
Print-Info "All basic tests completed!"
Write-Host ""
Print-Info "Next steps:"
Print-Info "  1. Check database for profile changes"
Print-Info "  2. Run full test suite: npm run test"
Print-Info "  3. Check Swagger UI: $BaseUrl/api/docs"
Print-Info "  4. Review logs for any errors"
Write-Host ""
Print-Success "Profile Update API testing complete!"
