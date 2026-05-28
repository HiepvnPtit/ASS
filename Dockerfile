# Bước 1: Build
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Bước 2: Run
FROM node:20-alpine
WORKDIR /usr/src/app

# Copy dependencies và bản build
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# QUAN TRỌNG: Copy thư mục i18n vào đúng nơi app đang tìm
# Lỗi báo tìm ở /usr/src/app/src/i18n/ nên chúng ta copy vào đúng chỗ đó
COPY --from=builder /usr/src/app/src/i18n ./src/i18n

# Nếu project của bạn có thư mục templates (để gửi mail), hãy copy luôn
COPY --from=builder /usr/src/app/src/mail/templates ./src/mail/templates 2>/dev/null || true

ENV NODE_ENV=production
EXPOSE 3000

# Chạy app (Sử dụng đường dẫn đã xác định ở log trước: dist/src/main)
CMD ["node", "dist/src/main"]