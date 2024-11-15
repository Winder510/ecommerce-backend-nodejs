FROM node:18.18.0
# Expose port mà backend server sẽ chạy (ví dụ: 3000)
EXPOSE 3001
# Set working directory
WORKDIR /app 
# Copy package.json và cài đặt các dependencies
RUN npm install -g npm@latest 
COPY package.json package-lock.json ./

# Copy toàn bộ mã nguồn vào container
COPY . . 
# Khởi chạy ứng dụng
CMD ["node","server.js"]
