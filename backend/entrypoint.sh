#!/bin/sh
set -e

echo ">> Применяю схему БД (prisma db push)..."
npx prisma db push --skip-generate

# Сидим один раз — маркер лежит на постоянном томе uploads,
# поэтому при перезапусках контейнера повторного засева не будет.
if [ ! -f /app/uploads/.seeded ]; then
  echo ">> Заполняю БД тестовыми данными (seed)..."
  node dist/prisma/seed.js && touch /app/uploads/.seeded
else
  echo ">> Seed уже выполнялся, пропускаю."
fi

echo ">> Запускаю бэкенд..."
exec node dist/app.js