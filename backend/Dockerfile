# ===== Этап сборки =====
FROM node:20-bookworm AS builder
WORKDIR /app

# Зависимости (включая dev — нужны tsc и prisma CLI)
COPY package*.json ./
RUN npm ci

# Генерация Prisma Client по схеме
COPY prisma ./prisma
RUN npx prisma generate

# Компиляция TypeScript -> dist/
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ===== Этап запуска =====
FROM node:20-bookworm-slim AS runtime
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
