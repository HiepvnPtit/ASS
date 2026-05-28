# Bước 1: Build (Sử dụng node 20 để ổn định và nhẹ hơn)
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Chỉ copy file package để tận dụng cache của Docker
COPY package*.json ./
RUN npm install

# Copy toàn bộ code và thực hiện build
COPY . .
RUN npm run build

# Bước 2: Run (Tạo image nhẹ nhất có thể để tiết kiệm RAM)
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy các file cần thiết từ bước builder
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Biến môi trường mặc định
ENV NODE_ENV=production

# Mở cổng 3000 (Render sẽ map vào cổng này)
EXPOSE 3000

# Lệnh chạy thẳng vào file main đã build, bỏ qua các script chờ đợi
CMD ["node", "dist/main"]