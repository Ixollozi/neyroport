# NeyroPort Uzbekistan

Пересборка [neyroport.ru](https://neyroport.ru/) под рынок Узбекистана.

Приложение лежит в [`web/`](web/README.md).

```bash
cd web
npm install
npm run dev
```

- Сайт: http://localhost:3000 → `/uz` (также `/ru`)
- Админка лидов: `/uz/admin` (токен из `web/.env.local`)
- Смоук: `npm run smoke` (нужен запущенный `dev` или `start`)
