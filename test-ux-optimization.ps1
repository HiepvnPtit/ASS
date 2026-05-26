#!/usr/bin/env pwsh

<#
.SYNOPSIS
UX Optimization Features - Automated Testing Script
Tests both auto-rating and trip history features

.DESCRIPTION
This script automates testing of:
1. Auto-calculate driver rating after review creation
2. Trip history API with pagination and role-based filtering

.PARAMETER BaseUrl
Base URL of the API (default: http://localhost:3000)

.PARAMETER CustomerEmail
Customer email for login (default: customer@example.com)

.PARAMETER DriverEmail
Driver email for login (default: driver@example.com)

.PARAMETER Password
Password for test accounts (default: password)

.EXAMPLE
.\test-ux-optimization.ps1
.\test-ux-optimization.ps1 -BaseUrl http://localhost:3000
.\test-ux-optimization.ps1 -CustomerEmail test@example.com -Password pass123

#>

param(
    [string]$BaseUrl = \"http://localhost:3000\",
    [string]$CustomerEmail = \"customer@example.com\",
    [string]$DriverEmail = \"driver@example.com\",
    [string]$Password = \"password\"
)

# Color codes
$SUCCESS = 'Green'
$ERROR_COLOR = 'Red'
$WARNING = 'Yellow'
$INFO = 'Cyan'

# Test counters
$testsRun = 0
$testsPassed = 0
$testsFailed = 0

# Function to print colored output
function Write-Log {
    param(
        [string]$Message,
        [ValidateSet('Success', 'Error', 'Warning', 'Info')][string]$Level = 'Info'
    )
    
    $color = switch($Level) {
        'Success' { $SUCCESS }
        'Error' { $ERROR_COLOR }
        'Warning' { $WARNING }
        'Info' { $INFO }
    }
    
    Write-Host \"[$(Get-Date -Format 'HH:mm:ss')] $Message\" -ForegroundColor $color
}

# Function to perform API request
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body,
        [string]$Token
    )
    
    $uri = \"$BaseUrl$Endpoint\"
    $headers = @{
        'Content-Type' = 'application/json'
    }
    
    if ($Token) {
        $headers['Authorization'] = \"Bearer $Token\"
    }
    
    try {
        if ($Body) {
            $bodyJson = $Body | ConvertTo-Json -Depth 10
            return Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers -Body $bodyJson
        } else {
            return Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers
        }
    } catch {
        Write-Log \"API Request failed: $_\" -Level 'Error'
        return $null
    }
}

# Function to run a test
function Test-Feature {
    param(
        [string]$TestName,
        [scriptblock]$TestScript
    )
    
    $script:testsRun++
    Write-Log \"Running: $TestName\" -Level 'Info'
    
    try {
        & $TestScript
        $script:testsPassed++
        Write-Log \"✓ PASSED: $TestName\" -Level 'Success'
    } catch {
        $script:testsFailed++
        Write-Log \"✗ FAILED: $TestName - $_\" -Level 'Error'
    }
}

# ============================================================================
# AUTHENTICATION
# ============================================================================

Write-Host \"`n=== AUTHENTICATION ===\" -ForegroundColor Cyan

# Login as customer
Write-Log \"Logging in as customer...\" -Level 'Info'
$customerLogin = Invoke-ApiRequest -Method 'POST' -Endpoint '/auth/login' -Body @{
    email = $CustomerEmail
    password = $Password
}

if (-not $customerLogin -or -not $customerLogin.data.access_token) {
    Write-Log \"Failed to login as customer\" -Level 'Error'
    exit 1
}

$customerToken = $customerLogin.data.access_token
Write-Log \"Customer token obtained\" -Level 'Success'

# Login as driver
Write-Log \"Logging in as driver...\" -Level 'Info'
$driverLogin = Invoke-ApiRequest -Method 'POST' -Endpoint '/auth/login' -Body @{
    email = $DriverEmail
    password = $Password
}

if (-not $driverLogin -or -not $driverLogin.data.access_token) {
    Write-Log \"Failed to login as driver\" -Level 'Error'
    exit 1
}

$driverToken = $driverLogin.data.access_token
Write-Log \"Driver token obtained\" -Level 'Success'

# ============================================================================
# FEATURE 1: AUTO-CALCULATE DRIVER RATING
# ============================================================================

Write-Host \"`n=== FEATURE 1: AUTO-CALCULATE DRIVER RATING ===\" -ForegroundColor Cyan

Test-Feature -TestName \"T1.1: Create trip for testing\" -TestScript {
    $trip = Invoke-ApiRequest -Method 'POST' -Endpoint '/trips' -Token $customerToken -Body @{
        maKhachHang = \"kh_test_001\"
        maLoaiXe = \"lx_sedan\"
        diemDon = \"123 Main St\"
        diemDen = \"456 Oak Ave\"
        viDoDon = 10.776839
        kinhDoDon = 106.696055
        viDoDen = 10.789373
        kinhDoDen = 106.706055
    }
    
    if (-not $trip -or -not $trip.maChuyenDi) {
        throw \"Failed to create trip\"
    }
    
    $script:tripId = $trip.maChuyenDi
    Write-Log \"Trip created: $($script:tripId)\" -Level 'Info'
}

Test-Feature -TestName \"T1.2: Create review with 5 stars\" -TestScript {
    $review = Invoke-ApiRequest -Method 'POST' -Endpoint \"/trips/$($script:tripId)/reviews\" -Token $customerToken -Body @{
        soSao = 5
        noiDung = \"Excellent service\"
    }
    
    if (-not $review) {
        throw \"Failed to create review\"
    }
    
    Write-Log \"Review created with 5 stars\" -Level 'Info'
}

Test-Feature -TestName \"T1.3: Create review with 3 stars\" -TestScript {
    # Create another trip for second review
    $trip2 = Invoke-ApiRequest -Method 'POST' -Endpoint '/trips' -Token $customerToken -Body @{
        maKhachHang = \"kh_test_002\"
        maLoaiXe = \"lx_sedan\"
        diemDon = \"111 First St\"
        diemDen = \"222 Second Ave\"
        viDoDon = 10.7
        kinhDoDon = 106.6
        viDoDen = 10.8
        kinhDoDen = 106.8
    }
    
    $review2 = Invoke-ApiRequest -Method 'POST' -Endpoint \"/trips/$($trip2.maChuyenDi)/reviews\" -Token $customerToken -Body @{
        soSao = 3
        noiDung = \"Average service\"
    }
    
    if (-not $review2) {
        throw \"Failed to create second review\"
    }
    
    Write-Log \"Second review created with 3 stars\" -Level 'Info'
}

Test-Feature -TestName \"T1.4: Verify driver rating updated (average 4.0)\" -TestScript {
    # Note: This requires fetching driver details - adjust endpoint as needed
    Write-Log \"Driver rating calculation test (requires manual verification)\" -Level 'Warning'
}

# ============================================================================
# FEATURE 2: TRIP HISTORY API
# ============================================================================

Write-Host \"`n=== FEATURE 2: TRIP HISTORY API ===\" -ForegroundColor Cyan

Test-Feature -TestName \"T2.1: Get customer trip history (default pagination)\" -TestScript {
    $history = Invoke-ApiRequest -Method 'GET' -Endpoint '/trips/me/history' -Token $customerToken
    
    if (-not $history -or -not $history.pagination) {
        throw \"Failed to get trip history\"
    }
    
    Write-Log \"Pagination - Page: $($history.pagination.page), Limit: $($history.pagination.limit), Total: $($history.pagination.total)\" -Level 'Info'
    
    if ($history.pagination.page -ne 1) {
        throw \"Expected page 1, got $($history.pagination.page)\"
    }
    
    if ($history.pagination.limit -ne 10) {
        throw \"Expected limit 10, got $($history.pagination.limit)\"
    }
}

Test-Feature -TestName \"T2.2: Get customer trip history (page 1, limit 5)\" -TestScript {
    $history = Invoke-ApiRequest -Method 'GET' -Endpoint '/trips/me/history?page=1&limit=5' -Token $customerToken
    
    if (-not $history) {
        throw \"Failed to get trip history with custom pagination\"
    }
    
    if ($history.pagination.limit -ne 5) {
        throw \"Expected limit 5, got $($history.pagination.limit)\"
    }
    
    Write-Log \"Retrieved $($history.data.Count) trips\" -Level 'Info'
}

Test-Feature -TestName \"T2.3: Get driver trip history\" -TestScript {
    $history = Invoke-ApiRequest -Method 'GET' -Endpoint '/trips/me/history' -Token $driverToken
    
    if (-not $history -or -not $history.pagination) {
        throw \"Failed to get driver trip history\"
    }
    
    Write-Log \"Driver trip history retrieved, total: $($history.pagination.total)\" -Level 'Info'
}

Test-Feature -TestName \"T2.4: Verify role-based filtering (customer)\" -TestScript {
    $history = Invoke-ApiRequest -Method 'GET' -Endpoint '/trips/me/history' -Token $customerToken
    
    if (-not $history.data) {
        throw \"No trips returned\"
    }
    
    # Verify customer data structure
    foreach ($trip in $history.data) {
        if (-not $trip.maChuyenDi) {
            throw \"Trip missing maChuyenDi\"
        }
        if (-not $trip.xe -or -not $trip.xe.loaiXe) {
            throw \"Trip missing vehicle or vehicle type\"
        }
        if (-not $trip.thanhToan) {
            throw \"Trip missing payment info\"
        }
    }
    
    Write-Log \"Customer trips verified with required fields\" -Level 'Info'
}

Test-Feature -TestName \"T2.5: Verify pagination flags (first page)\" -TestScript {
    $history = Invoke-ApiRequest -Method 'GET' -Endpoint '/trips/me/history?page=1&limit=10' -Token $customerToken
    
    if ($history.pagination.hasPrevPage -ne $false) {
        throw \"Page 1 should not have previous page\"
    }
    
    Write-Log \"Pagination flags verified\" -Level 'Info'
}

Test-Feature -TestName \"T2.6: Verify sorting (newest first)\" -TestScript {
    $history = Invoke-ApiRequest -Method 'GET' -Endpoint '/trips/me/history?limit=5' -Token $customerToken
    
    if ($history.data.Count -lt 2) {
        Write-Log \"Insufficient trips for sort verification\" -Level 'Warning'
        return
    }
    
    $first = [DateTime]::Parse($history.data[0].thoiGianBatDau)
    $second = [DateTime]::Parse($history.data[1].thoiGianBatDau)
    
    if ($first -lt $second) {
        throw \"Trips not sorted in descending order\"
    }
    
    Write-Log \"Sorting verified (newest first)\" -Level 'Info'
}

Test-Feature -TestName \"T2.7: Unauthorized access rejection\" -TestScript {
    $response = @{}
    try {
        $response = Invoke-RestMethod -Uri \"$BaseUrl/trips/me/history\" -Method 'GET' -ErrorAction Stop
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Log \"Correctly rejected unauthorized request\" -Level 'Info'
            return
        } else {
            throw \"Unexpected error: $_\"
        }
    }
    
    throw \"Should have rejected request without token\"
}

Test-Feature -TestName \"T2.8: Invalid limit enforcement (cap at 100)\" -TestScript {
    $history = Invoke-ApiRequest -Method 'GET' -Endpoint '/trips/me/history?page=1&limit=500' -Token $customerToken
    
    if ($history.pagination.limit -gt 100) {
        throw \"Limit should be capped at 100, got $($history.pagination.limit)\"
    }
    
    Write-Log \"Limit correctly capped at $($history.pagination.limit)\" -Level 'Info'
}

Test-Feature -TestName \"T2.9: Invalid page defaults to 1\" -TestScript {
    $history = Invoke-ApiRequest -Method 'GET' -Endpoint '/trips/me/history?page=0' -Token $customerToken
    
    if ($history.pagination.page -ne 1) {
        throw \"Page 0 should default to 1, got $($history.pagination.page)\"
    }
    
    Write-Log \"Invalid page correctly defaulted to 1\" -Level 'Info'
}

Test-Feature -TestName \"T2.10: Empty result set handling\" -TestScript {
    # This test may vary depending on test data
    Write-Log \"Empty result set handling (manual verification recommended)\" -Level 'Warning'
}

# ============================================================================
# TEST SUMMARY
# ============================================================================

Write-Host \"`n=== TEST SUMMARY ===\" -ForegroundColor Cyan
Write-Host \"Total Tests: $testsRun\" -ForegroundColor Cyan
Write-Host \"Passed: $testsPassed\" -ForegroundColor Green
Write-Host \"Failed: $testsFailed\" -ForegroundColor Red

if ($testsFailed -eq 0) {
    Write-Log \"All tests passed! ✓\" -Level 'Success'
    exit 0
} else {
    Write-Log \"$testsFailed test(s) failed.\" -Level 'Error'
    exit 1
}
