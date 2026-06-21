# ===== Этап сборки =====
FROM node:20-bookworm AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ===== Этап запуска =====
FROM node:20-bookworm AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY entrypoint.sh ./entrypoint.sh

RUN chmod +x entrypoint.sh && mkdir -p uploads

EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]