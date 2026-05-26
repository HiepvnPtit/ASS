#!/bin/bash

# ============================================
# NestJS Boilerplate - Admin Setup Script
# ============================================
# Purpose: Tạo sẵn admin account khi khởi tạo database
# Usage: ./setup-admin.sh

set -e

echo "╔════════════════════════════════════════╗"
echo "║  NestJS Boilerplate - Admin Setup     ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Step 1: Check dependencies
echo "📋 Kiểm tra dependencies..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules không tồn tại. Chạy npm install..."
    npm install
fi
echo "✅ Dependencies OK"
echo ""

# Step 2: Check .env file
echo "🔍 Kiểm tra .env file..."
if [ ! -f ".env" ]; then
    echo "⚠️  .env không tồn tại"
    if [ -f "env-example-relational" ]; then
        echo "📝 Tạo .env từ env-example-relational..."
        cp env-example-relational .env
        echo "✅ .env được tạo. Vui lòng cập nhật DB connection nếu cần."
    fi
fi
echo "✅ .env OK"
echo ""

# Step 3: Run migrations
echo "🔄 Chạy migrations..."
npm run migration:run
echo "✅ Migrations completed"
echo ""

# Step 4: Run seed - Create admin user
echo "🌱 Tạo admin account..."
npm run seed:run:relational
echo "✅ Admin account created successfully!"
echo ""

# Summary
echo "╔════════════════════════════════════════╗"
echo "║  ✅ Setup Complete!                   ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "📊 Admin Account Details:"
echo "   Email:    admin@app.com"
echo "   Password: Admin@123"
echo "   Role:     ADMIN"
echo ""
echo "🚀 Bước tiếp theo:"
echo "   1. Chạy: npm run start:dev"
echo "   2. Mở: http://localhost:3000/api"
echo "   3. Login với admin account"
echo "   4. 🔐 Đổi mật khẩu ngay lập tức"
echo ""
echo "📚 Tham khảo: docs/admin-setup.md"
