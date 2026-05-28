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

# Copy các file cần thiết từ builder
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/src/i18n ./src/i18n

# Lưu ý: Đã xóa dòng COPY templates vì thư mục đó không tồn tại trong code của bạn

ENV NODE_ENV=production
# Render yêu cầu app chạy trên port này hoặc port trong biến môi trường
EXPOSE 3000

# Lệnh chạy app
CMD ["node", "dist/src/main"]