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

# Copy thư mục i18n
COPY --from=builder /usr/src/app/src/i18n ./src/i18n

# CÁCH COPY AN TOÀN CHO THƯ MỤC MAIL:
# Thay vì dùng lệnh COPY trực tiếp dễ bị lỗi nếu thư mục không tồn tại, 
# ta sẽ copy cả thư mục src và lọc lấy những thứ cần thiết hoặc đảm bảo nó tồn tại.
# Cách đơn giản nhất: Chỉ copy nếu bạn chắc chắn nó có trong code.
# Nếu bạn có thư mục mail, hãy dùng dòng dưới đây. Nếu không có, hãy xóa dòng này đi.
COPY --from=builder /usr/src/app/src/mail/templates ./src/mail/templates

ENV NODE_ENV=production
EXPOSE 3000

# Lệnh chạy app
CMD ["node", "dist/src/main"]