FROM node:18

EXPOSE 3000

WORKDIR /app 

RUN npm install -g npm@latest

COPY package.json package-lock.json ./

RUN npm i 

COPY . . 

CMD ["node","server.js"]