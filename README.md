# EsExpress Premium Store

Интернет-магазин на Next.js 16, TypeScript и Tailwind CSS 4. База данных работает на **Neon PostgreSQL** через официальный пакет `@neondatabase/serverless`. Turso, LibSQL и локальная SQLite-база приложению больше не нужны.

## Подключение Neon Console

1. Создайте проект в Neon Console.
2. Нажмите **Connect** и скопируйте **pooled connection string**.
3. Установите зависимости и создайте файл окружения:

```bash
npm install
cp .env.example .env
```

4. Вставьте строку Neon в `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler.REGION.aws.neon.tech/DBNAME?sslmode=require&channel_binding=require"
SESSION_SECRET="длинная-случайная-строка"
ADMIN_PASSWORD="новый-пароль-администратора"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

5. Создайте таблицы и администратора, затем запустите проект:

```bash
npm run setup
npm run dev
```

Сайт: `http://localhost:3000`  
Админ-панель: `http://localhost:3000/admin/login`

Схема PostgreSQL создаётся автоматически при первом подключении. `npm run setup` также создаёт или обновляет администратора с паролем из `ADMIN_PASSWORD`. Для ручного запуска через Neon Console → SQL Editor добавлен файл `database/neon-schema.sql`.

## Перенос данных из старой SQLite-базы

В архив включён экспорт старой базы `data/esexpress.db` в файл `database/sqlite-export.json`. В нём сохранены:

- 5 категорий;
- 8 брендов;
- 13 товаров;
- 18 изображений товаров;
- баннер, отзывы, настройки сайта и администратор.

Для переноса используйте **пустую Neon branch/database**:

```bash
npm run db:import-sqlite
npm run db:seed
```

Первая команда создаёт PostgreSQL-таблицы и импортирует старые данные. Вторая задаёт администратору пароль из текущего `.env`.

## Загрузка изображений

Изображения хранятся в `data/uploads` и выдаются маршрутом `/uploads/[filename]`. Файлы именуются по SHA-256, поэтому одинаковые изображения не сохраняются повторно.

```bash
npm run uploads:migrate
```

Команда переносит старые файлы из `public/uploads`, устраняет дубликаты и обновляет ссылки уже в Neon PostgreSQL.

> Для Vercel с несколькими инстансами рекомендуется перенести изображения в Vercel Blob, S3, Cloudflare R2 или Cloudinary. Neon хранит данные PostgreSQL, но не является файловым хранилищем.

## Основные команды

```bash
npm run dev                # локальная разработка
npm run build              # production-сборка
npm run start              # запуск production-сборки
npm run typecheck          # проверка TypeScript
npm run lint               # ESLint
npm run setup              # схема Neon + администратор + миграция загрузок
npm run db:seed            # создать/обновить администратора и настройки
npm run db:import-sqlite   # импорт включённого экспорта SQLite в Neon
npm run db:wipe            # удалить каталог, баннеры и отзывы
npm run uploads:migrate    # перенести старые изображения
```

## Деплой на Vercel

Добавьте в Environment Variables:

- `DATABASE_URL` — pooled connection string из Neon Console;
- `SESSION_SECRET`;
- `ADMIN_PASSWORD`;
- `NEXT_PUBLIC_SITE_URL` — публичный адрес сайта.

Для preview и production можно использовать отдельные Neon branches.
