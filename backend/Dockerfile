FROM node:20-alpine

# wget para el healthcheck del docker-compose
RUN apk add --no-cache wget

WORKDIR /app

COPY package*.json ./

# Solo dependencias de producción (excluye jest)
RUN npm ci --omit=dev

COPY src/ ./src/

EXPOSE 3000

CMD ["node", "src/app.js"]
