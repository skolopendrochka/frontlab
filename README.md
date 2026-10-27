# Checkly — Vue 3 + Quasar

Чек-лист учебных задач. Автор: **Екатерина Чичулина**.

Проект закрывает требования курса: Vue 3, TypeScript, Quasar, Pinia, Vue Router, Axios, Zod, mock API, тесты и публикация на GitHub Pages.

## Что умеет

- Пункты чек-листа с необязательным сроком
- Отметка «готово», удаление, поиск и вкладки-фильтры
- Прогресс выполнения
- Авторизация, guards, хлебные крошки
- Светлая / тёмная тема
- localStorage для сессии и списка
- Локальный режим на GitHub Pages, если mock API недоступен
- Vitest и GitHub Actions

## Запуск

```bash
npm install
cd mock && npm install && cd ..
npm run mock
```

В другом терминале:

```bash
npm run dev
```

- Приложение: http://localhost:9000
- API: http://localhost:3001
- Логин: `user@test.com` / `123456`
- Админ: `admin@test.com` / `admin123`

## Git

Корень репозитория — эта папка. В Settings → Pages выберите источник **GitHub Actions**.
