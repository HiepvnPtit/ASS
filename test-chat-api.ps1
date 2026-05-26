#!/usr/bin/env pwsh

# ============================================================================
# Real-Time Chat Testing Script for NestJS Trips API
# ============================================================================
# This script tests the chat feature with example data and API calls
# Prerequisites: 
#   - NestJS server running on http://localhost:3000
#   - Valid JWT token or login credentials
#   - PostgreSQL database with tin_nhan table created
# Usage:
#   .\test-chat-api.ps1
# ============================================================================

param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$JwtToken = $null,
    [string]$TripId = "CD-12345",
    [string]$UserId = "ND-67890"
)

# ============================================================================
# Color Output Functions
# ============================================================================

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

# ============================================================================
# Main Testing Functions
# ============================================================================

function Test-API-Connectivity {
    Write-Info "Testing API connectivity..."
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/health" -Method GET -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Success "API is reachable"
            return $true
        }
    }
    catch {
        # Health endpoint might not exist, try a simple endpoint
        try {
            $response = Invoke-WebRequest -Uri "$BaseUrl/" -Method GET -ErrorAction SilentlyContinue
            Write-Success "API is reachable"
            return $true
        }
        catch {
            Write-Error-Custom "Cannot reach API at $BaseUrl"
            Write-Info "Make sure NestJS server is running: npm run start"
            return $false
        }
    }
}

function Get-JWT-Token {
    if ($JwtToken) {
        Write-Success "Using provided JWT token"
        return $JwtToken
    }

    Write-Info "No JWT token provided. Attempting to login..."
    Write-Info "For testing, you can:"
    Write-Info "  1. Get token from: POST /auth/login"
    Write-Info "  2. Use existing token from client"
    Write-Info "  3. Pass token via -JwtToken parameter"

    # Prompt user for token
    $token = Read-Host "Enter JWT token (or press Enter to skip)"
    
    if ([string]::IsNullOrEmpty($token)) {
        Write-Warning-Custom "No JWT token provided. Some tests will be skipped."
        return $null
    }

    return $token
}

function Test-Get-Messages {
    param(
        [string]$Token
    )

    if (-not $Token) {
        Write-Warning-Custom "Skipping GET /messages test - JWT token required"
        return
    }

    Write-Info "Testing GET /trips/{id}/messages endpoint..."
    
    try {
        $headers = @{
            "Authorization" = "Bearer $Token"
            "Content-Type" = "application/json"
        }

        $response = Invoke-WebRequest `
            -Uri "$BaseUrl/trips/$TripId/messages" `
            -Headers $headers `
            -Method GET `
            -ErrorAction Stop

        if ($response.StatusCode -eq 200) {
            Write-Success "GET /trips/$TripId/messages returned 200"
            $data = $response.Content | ConvertFrom-Json
            
            Write-Info "Response structure:"
            Write-Info "  - message: $($data.message)"
            Write-Info "  - count: $($data.count)"
            
            if ($data.data.Count -gt 0) {
                Write-Success "Found $($data.data.Count) messages"
                
                # Show first message details
                $firstMessage = $data.data[0]
                Write-Info "First message:"
                Write-Info "  - From: $($firstMessage.nguoiGuiId)"
                Write-Info "  - Content: $($firstMessage.noiDung)"
                Write-Info "  - Sent: $($firstMessage.thoiGianGui)"
                Write-Info "  - Type: $($firstMessage.loaiTinNhan)"
            } else {
                Write-Info "No messages found for trip $TripId"
            }

            return $true
        }
    }
    catch [System.Net.Http.HttpRequestException] {
        Write-Error-Custom "API returned error: $($_.Exception.Response.StatusCode)"
        Write-Info "Response: $($_.Exception.Message)"
        return $false
    }
    catch {
        Write-Error-Custom "Error testing GET /messages: $($_.Exception.Message)"
        return $false
    }
}

function Test-Database-Connection {
    Write-Info "Testing database connection via API..."
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }

        # Try to access any endpoint to test DB
        $response = Invoke-WebRequest `
            -Uri "$BaseUrl/trips" `
            -Headers $headers `
            -Method GET `
            -ErrorAction Stop

        Write-Success "Database appears to be accessible"
        return $true
    }
    catch {
        Write-Error-Custom "Cannot access database: $($_.Exception.Message)"
        Write-Info "Make sure PostgreSQL is running and tables are created"
        return $false
    }
}

function Show-WebSocket-Example {
    Write-Info "WebSocket Connection Example (JavaScript):"
    Write-Info ""
    Write-Host @"
// Connect to WebSocket
const socket = io('http://localhost:3000/trips', {
  auth: {
    userId: '$UserId'
  }
});

// Join trip room
socket.emit('join_trip', { maChuyenDi: '$TripId' });

// Listen for new messages
socket.on('new_message', (message) => {
  console.log('New message:', message);
});

// Send a message
socket.emit('send_message', {
  maChuyenDi: '$TripId',
  noiDung: 'I am on my way',
  loaiTinNhan: 'text'
});

// Error handling
socket.on('error', (error) => {
  console.error('Error:', error);
});
"@ -ForegroundColor Yellow
    Write-Info ""
}

function Show-CURL-Examples {
    Write-Info "cURL Command Examples:"
    Write-Info ""
    Write-Host @"
# Get chat messages for a trip
curl -X GET http://localhost:3000/trips/$TripId/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Format with jq for pretty output
curl -X GET http://localhost:3000/trips/$TripId/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | jq .

# Test with sample trip ID
curl -X GET "http://localhost:3000/trips/CD-TEST-001/messages" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
"@ -ForegroundColor Yellow
    Write-Info ""
}

function Show-Validation-Rules {
    Write-Info "Message Validation Rules:"
    Write-Info ""
    Write-Host @"
Field: maChuyenDi
  - Type: String
  - Max Length: 50 characters
  - Required: Yes
  - Example: 'CD-12345'

Field: noiDung (Message Content)
  - Type: String
  - Max Length: 5000 characters
  - Required: Yes
  - Example: 'I am 5 minutes away'

Field: loaiTinNhan (Message Type)
  - Type: Enum
  - Valid Values: 'text', 'image', 'location'
  - Required: No
  - Default: 'text'

Field: mediaUrl (Attachment URL)
  - Type: URL
  - Max Length: 500 characters
  - Required: No (only when needed)
  - Example: 'https://example.com/image.jpg'
"@ -ForegroundColor Cyan
    Write-Info ""
}

function Show-Common-Errors {
    Write-Info "Common Errors and Solutions:"
    Write-Info ""
    Write-Host @"
Error: 'Cannot POST /send_message'
→ Solution: WebSocket endpoint, use socket.io-client, not HTTP POST

Error: 'User authentication required'
→ Solution: Pass userId in socket auth: io(url, { auth: { userId: '...' } })

Error: 'maChuyenDi and noiDung are required'
→ Solution: Ensure both fields are included in message payload

Error: 'No messages found'
→ Solution: Messages may not exist yet, send one first via WebSocket

Error: 'Unauthorized' (401)
→ Solution: JWT token expired or invalid, get a new one

Error: 'Trip not found'
→ Solution: Verify maChuyenDi exists in database

Error: 'Connection refused'
→ Solution: Ensure NestJS server is running on port 3000
"@ -ForegroundColor Magenta
    Write-Info ""
}

function Show-File-Locations {
    Write-Info "Important Files:"
    Write-Info ""
    Write-Host @"
Implementation Files:
  • src/entities/tin-nhan.entity.ts          - Chat message entity
  • src/trips/dto/send-message.dto.ts        - WebSocket DTO
  • src/trips/trips.service.ts               - Message service
  • src/trips/trips.gateway.ts               - WebSocket gateway
  • src/trips/trips.controller.ts            - REST API
  • src/trips/trips.module.ts                - Module configuration

Documentation Files:
  • docs/CHAT_IMPLEMENTATION_GUIDE.md        - Full guide
  • docs/CHAT_QUICK_REFERENCE.md             - Quick reference
  • docs/CHAT_IMPLEMENTATION_SUMMARY.md      - Feature summary

Database:
  • database.tin-nhan.sql                    - Migration script
"@ -ForegroundColor Cyan
    Write-Info ""
}

# ============================================================================
# Main Test Execution
# ============================================================================

function Main {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║          Real-Time Chat API Testing Script                    ║" -ForegroundColor Cyan
    Write-Host "║          NestJS Trips Feature                                 ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""

    Write-Info "Configuration:"
    Write-Info "  Base URL: $BaseUrl"
    Write-Info "  Trip ID: $TripId"
    Write-Info "  User ID: $UserId"
    Write-Info ""

    # Step 1: Test connectivity
    if (-not (Test-API-Connectivity)) {
        Write-Error-Custom "Cannot proceed without API connectivity"
        exit 1
    }

    # Step 2: Get JWT token
    $token = Get-JWT-Token

    # Step 3: Test database
    Test-Database-Connection | Out-Null

    # Step 4: Test GET messages endpoint
    Test-Get-Messages -Token $token

    # Step 5: Show examples
    Write-Host ""
    Write-Info "═════════════════════════════════════════════════════════════════"
    Show-WebSocket-Example
    
    Write-Info "═════════════════════════════════════════════════════════════════"
    Show-CURL-Examples

    Write-Info "═════════════════════════════════════════════════════════════════"
    Show-Validation-Rules

    Write-Info "═════════════════════════════════════════════════════════════════"
    Show-Common-Errors

    Write-Info "═════════════════════════════════════════════════════════════════"
    Show-File-Locations

    Write-Host ""
    Write-Success "Testing complete!"
    Write-Info "For more details, see:"
    Write-Info "  • docs/CHAT_IMPLEMENTATION_GUIDE.md"
    Write-Info "  • docs/CHAT_QUICK_REFERENCE.md"
    Write-Host ""
}

# Run main function
Main
