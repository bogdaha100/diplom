# Деплой проекта (Docker Compose)

Поднимает три сервиса на одном сервере: **PostgreSQL**, **бэкенд** (Express + Prisma)
и **фронтенд** (Angular-статика + nginx, который проксирует `/api` и `/uploads` на бэкенд).

---

## 1. Куда положить файлы

Разложи файлы из этого комплекта по репозиторию:

```
diplom/
├── docker-compose.yml        ← в корень
├── .env                       ← в корень (скопировать из .env.example и заполнить)
├── backend/
│   ├── Dockerfile             ← сюда
│   ├── entrypoint.sh          ← сюда
│   └── .dockerignore          ← сюда
└── frontend/
    ├── Dockerfile             ← сюда
    ├── nginx.conf             ← сюда
    └── .dockerignore          ← сюда
```

> Корневая папка с SSR-версией Angular (`src/`, `angular.json`, корневой `package.json`)
> для деплоя не используется — compose собирает только `frontend/` и `backend/`.

## 2. Подготовить переменные окружения

```bash
cp .env.example .env
# открой .env и впиши свой пароль БД и JWT_SECRET
# для секрета удобно: openssl rand -hex 32
```

## 3. Установить Docker на сервере (Ubuntu)

```bash
curl -fsSL https://get.docker.com | sh
```

## 4. Запустить

```bash
docker compose up -d --build
```

Первый запуск соберёт образы (несколько минут). Бэкенд при старте сам:
- применит схему к БД (`prisma db push`);
- один раз заполнит тестовыми данными (`seed`).

## 5. Открыть

```
http://<IP-сервера>:8080
```

**Тестовый вход (из seed):**
- Администратор — `ivanov@xxx.ru` / `Admin123!`
- Менеджер — `sergeyev@xxx.ru` / `Admin123!`

---

## Полезные команды

```bash
docker compose logs -f backend     # логи бэкенда
docker compose logs -f frontend    # логи nginx
docker compose ps                  # статус сервисов
docker compose down                # остановить (БД и файлы сохранятся в томах)
docker compose down -v             # остановить и УДАЛИТЬ данные (чистый старт)
docker compose up -d --build       # пересобрать после изменений в коде
```

## Что важно знать

- **Файлы и БД переживают перезапуск** — они лежат в Docker-томах `pgdata` и `uploads`.
  Полная очистка только через `down -v`.
- **HTTPS не настроен.** Для демо http по IP достаточно. Если нужен домен с https —
  добавляется отдельный контейнер `caddy` или `nginx + certbot` перед `frontend`.
- **Повторный seed** не дублирует роли и пользователей (там `upsert`), но заказы/документы
  создаются заново — поэтому он защищён маркером `uploads/.seeded` и выполняется один раз.