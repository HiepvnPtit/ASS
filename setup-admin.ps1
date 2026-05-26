# ============================================
# NestJS Boilerplate - Admin Setup Script
# ============================================
# Purpose: Tạo sẵn admin account khi khởi tạo database
# Usage: .\setup-admin.ps1

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  NestJS Boilerplate - Admin Setup     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check dependencies
Write-Host "📋 Kiểm tra dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules không tồn tại. Chạy npm install..."
    npm install
}
Write-Host "✅ Dependencies OK" -ForegroundColor Green
Write-Host ""

# Step 2: Check .env file
Write-Host "🔍 Kiểm tra .env file..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env không tồn tại"
    if (Test-Path "env-example-relational") {
        Write-Host "📝 Tạo .env từ env-example-relational..."
        Copy-Item "env-example-relational" ".env"
        Write-Host "✅ .env được tạo. Vui lòng cập nhật DB connection nếu cần."
    }
}
Write-Host "✅ .env OK" -ForegroundColor Green
Write-Host ""

# Step 3: Run migrations
Write-Host "🔄 Chạy migrations..." -ForegroundColor Yellow
npm run migration:run
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Migration failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Migrations completed" -ForegroundColor Green
Write-Host ""

# Step 4: Run seed - Create admin user
Write-Host "🌱 Tạo admin account..." -ForegroundColor Yellow
npm run seed:run:relational
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Seeding failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Admin account created successfully!" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  ✅ Setup Complete!                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Admin Account Details:" -ForegroundColor Green
Write-Host "   Email:    admin@app.com" -ForegroundColor White
Write-Host "   Password: Admin@123" -ForegroundColor White
Write-Host "   Role:     ADMIN" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Bước tiếp theo:" -ForegroundColor Cyan
Write-Host "   1. Chạy: npm run start:dev" -ForegroundColor White
Write-Host "   2. Mở: http://localhost:3000/api" -ForegroundColor White
Write-Host "   3. Login với admin account" -ForegroundColor White
Write-Host "   4. 🔐 Đổi mật khẩu ngay lập tức" -ForegroundColor White
Write-Host ""
Write-Host "📚 Tham khảo: docs/admin-setup.md" -ForegroundColor Cyan
