#!/bin/bash

# Self-Service Profile Update - Test Script
# Tests the PATCH /auth/me endpoint with various scenarios

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
TEST_EMAIL="${TEST_EMAIL:-testuser@example.com}"
TEST_PASSWORD="${TEST_PASSWORD:-password123}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Profile Update API - Test Script${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to print section
print_section() {
    echo -e "${BLUE}--- $1 ---${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print info
print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Test 1: Get JWT Token
print_section "Step 1: Get JWT Token"

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"matKhau\":\"$TEST_PASSWORD\"}")

JWT_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$JWT_TOKEN" ]; then
    print_error "Failed to get JWT token. Response: $LOGIN_RESPONSE"
    print_info "Make sure:"
    print_info "1. Server is running at $BASE_URL"
    print_info "2. User exists with email: $TEST_EMAIL"
    print_info "3. Password is: $TEST_PASSWORD"
    exit 1
fi

print_success "JWT Token obtained: ${JWT_TOKEN:0:20}..."
echo ""

# Test 2: Update Single Field (Name)
print_section "Test 1: Update Single Field (hoTen)"

RESPONSE=$(curl -s -X PATCH "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"hoTen":"Updated Name"}')

if echo $RESPONSE | grep -q "Updated Name"; then
    print_success "Name updated successfully"
    echo "Response: $RESPONSE" | head -c 200
    echo ""
else
    print_error "Failed to update name"
    echo "Response: $RESPONSE"
fi
echo ""

# Test 3: Update Multiple Fields
print_section "Test 2: Update Multiple Fields"

RESPONSE=$(curl -s -X PATCH "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hoTen": "Nguyễn Văn Test",
    "avatar": "https://example.com/avatar.jpg"
  }')

if echo $RESPONSE | grep -q "Nguyễn Văn Test"; then
    print_success "Multiple fields updated successfully"
else
    print_error "Failed to update multiple fields"
    echo "Response: $RESPONSE"
fi
echo ""

# Test 4: Update Password
print_section "Test 3: Update Password"

RESPONSE=$(curl -s -X PATCH "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"matKhau":"newPassword123"}')

if echo $RESPONSE | grep -q "maNguoiDung"; then
    if echo $RESPONSE | grep -q '"matKhau"'; then
        print_error "Password returned in response (security issue)"
    else
        print_success "Password updated (not exposed in response)"
    fi
else
    print_error "Failed to update password"
    echo "Response: $RESPONSE"
fi
echo ""

# Test 5: Error - Invalid Email
print_section "Test 4: Validation - Invalid Email Format"

RESPONSE=$(curl -s -X PATCH "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email"}')

if echo $RESPONSE | grep -q "must be an email"; then
    print_success "Email validation working"
else
    print_error "Email validation not working"
    echo "Response: $RESPONSE"
fi
echo ""

# Test 6: Error - Invalid Phone
print_section "Test 5: Validation - Invalid Phone Format"

RESPONSE=$(curl -s -X PATCH "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"soDienThoai":"123"}')

if echo $RESPONSE | grep -q "must match"; then
    print_success "Phone validation working"
else
    print_error "Phone validation not working"
    echo "Response: $RESPONSE"
fi
echo ""

# Test 7: Error - No Authorization
print_section "Test 6: Security - Missing Authorization"

RESPONSE=$(curl -s -X PATCH "$BASE_URL/auth/me" \
  -H "Content-Type: application/json" \
  -d '{"hoTen":"Test"}')

if echo $RESPONSE | grep -q "401\|Unauthorized"; then
    print_success "Authorization required (401 returned)"
else
    print_error "Authorization not enforced"
    echo "Response: $RESPONSE"
fi
echo ""

# Test 8: Error - Invalid Token
print_section "Test 7: Security - Invalid JWT Token"

RESPONSE=$(curl -s -X PATCH "$BASE_URL/auth/me" \
  -H "Authorization: Bearer invalid.token.here" \
  -H "Content-Type: application/json" \
  -d '{"hoTen":"Test"}')

if echo $RESPONSE | grep -q "401\|Unauthorized"; then
    print_success "Invalid token rejected (401 returned)"
else
    print_error "Invalid token not rejected"
    echo "Response: $RESPONSE"
fi
echo ""

# Test 9: Error - Password Too Short
print_section "Test 8: Validation - Password Too Short"

RESPONSE=$(curl -s -X PATCH "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"matKhau":"123"}')

if echo $RESPONSE | grep -q "6 characters"; then
    print_success "Password length validation working"
else
    print_error "Password length validation not working"
    echo "Response: $RESPONSE"
fi
echo ""

# Test 10: Success - Empty Body (No-op)
print_section "Test 9: Edge Case - Empty Body"

RESPONSE=$(curl -s -X PATCH "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')

if echo $RESPONSE | grep -q "maNguoiDung"; then
    print_success "Empty body accepted (no-op)"
else
    print_error "Empty body rejected"
    echo "Response: $RESPONSE"
fi
echo ""

# Summary
print_section "Test Summary"
echo ""
print_info "All basic tests completed!"
echo ""
print_info "Next steps:"
echo "  1. Check database for profile changes"
echo "  2. Run full test suite: npm run test"
echo "  3. Check Swagger UI: $BASE_URL/api/docs"
echo "  4. Review logs for any errors"
echo ""
print_success "Profile Update API testing complete!"
