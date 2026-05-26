#!/usr/bin/env pwsh

# API Test Script
$BaseUrl = "http://localhost:3000"
$ApiPort = "3000"

# Colors
$Success = [System.ConsoleColor]::Green
$Error = [System.ConsoleColor]::Red
$Info = [System.ConsoleColor]::Cyan
$Warning = [System.ConsoleColor]::Yellow

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Path,
        [object]$Body = $null,
        [string]$Description
    )
    
    $Url = "$BaseUrl$Path"
    $Timestamp = Get-Date -Format "HH:mm:ss"
    
    Write-Host "`n[$Timestamp] Testing: $Description" -ForegroundColor $Info
    Write-Host "  $Method $Path" -ForegroundColor $Info
    
    try {
        if ($Body) {
            $JsonBody = $Body | ConvertTo-Json
            Write-Host "  Body: $JsonBody" -ForegroundColor $Warning
            $Response = Invoke-WebRequest -Uri $Url -Method $Method -Body $JsonBody -ContentType "application/json" -TimeoutSec 5 -ErrorAction Stop
        } else {
            $Response = Invoke-WebRequest -Uri $Url -Method $Method -TimeoutSec 5 -ErrorAction Stop
        }
        
        Write-Host "  ✓ Status: $($Response.StatusCode)" -ForegroundColor $Success
        
        if ($Response.Content) {
            try {
                $Content = $Response.Content | ConvertFrom-Json
                Write-Host "  Response: $($Content | ConvertTo-Json -Depth 2)" -ForegroundColor $Success
            } catch {
                Write-Host "  Response: $($Response.Content)" -ForegroundColor $Success
            }
        }
    } catch {
        $StatusCode = $_.Exception.Response.StatusCode.Value__
        Write-Host "  ✗ Error Status: $StatusCode" -ForegroundColor $Error
        
        try {
            $ErrorContent = $_.Exception.Response.Content.ReadAsStream() | ForEach-Object { [System.IO.StreamReader]::new($_).ReadToEnd() }
            Write-Host "  Error Response: $ErrorContent" -ForegroundColor $Error
        } catch {
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor $Error
        }
    }
}

# ========== API Tests ==========

Write-Host "`n========== TESTING NestJS APIs ==========" -ForegroundColor $Success
Write-Host "Server: $BaseUrl" -ForegroundColor $Info

# 1. Home Endpoint
Test-Endpoint -Method "GET" -Path "/" -Description "Home Endpoint"

# 2. Auth - Simple Register
Test-Endpoint -Method "POST" -Path "/api/auth/register" -Description "Simple Auth Register" -Body @{
    email = "testuser$(Get-Random)@example.com"
    password = "MyPassword123!"
    firstName = "Test"
    lastName = "User"
}

# 3. Auth - Simple Login
Test-Endpoint -Method "POST" -Path "/api/auth/login" -Description "Simple Auth Login" -Body @{
    email = "testuser@example.com"
    password = "MyPassword123!"
}

# 4. Users - Get All Users
Test-Endpoint -Method "GET" -Path "/api/users" -Description "Get All Users"

# 5. Files - Get File
Test-Endpoint -Method "GET" -Path "/api/files/sample.txt" -Description "Get File (should fail - no file)"

# 6. LoaiXe - Get All
Test-Endpoint -Method "GET" -Path "/api/loai-xe" -Description "Get All Vehicle Types"

# 7. BangGia - Get All
Test-Endpoint -Method "GET" -Path "/api/bang-gia" -Description "Get All Pricing"

# 8. Trips - Get All
Test-Endpoint -Method "GET" -Path "/api/trips" -Description "Get All Trips"

Write-Host "`n========== TEST COMPLETE ==========" -ForegroundColor $Success
Write-Host "Check responses above for any errors" -ForegroundColor $Info

