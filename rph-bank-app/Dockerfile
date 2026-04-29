FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV CB_URL=https://stevenop.be/pingfin/api/v2/
ENV PORT=3000

EXPOSE 3000

CMD ["node", "src/app.js"]
