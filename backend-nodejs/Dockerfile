# FROM node:18.18.0
# # Expose port mà backend server sẽ chạy (ví dụ: 3000)
# EXPOSE 3000
# # Set working directory
# WORKDIR /app 
# # Copy package.json và cài đặt các dependencies
# # RUN npm install -g npm@latest 
# # RUN apk --no-cache add --virtual builds-deps build-base python
# RUN apk add --no-cache make gcc g++ python && \
#   npm install && \
#   npm rebuild bcrypt --build-from-source && \
#   apk del make gcc g++ python

# COPY package.json package-lock.json ./

# # Copy toàn bộ mã nguồn vào container
# COPY . . 
# # Khởi chạy ứng dụng
# CMD ["node","server.js"]



FROM node:18.18.0-buster

WORKDIR /app
COPY package.json package-lock.json ./
RUN apt-get update && apt-get install -y build-essential python3 && \
    npm install && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
RUN npm rebuild bcrypt --build-from-source


COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
