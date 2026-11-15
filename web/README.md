# NeyroPort (Uzbekistan)

Quality rebuild of [neyroport.ru](https://neyroport.ru/) for the Uzbek market.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS v4
- `next-intl` — locales `uz` (default) and `ru`
- Lead forms → `POST /api/leads` (JSON file store) + `/admin` viewer
- Content in `src/content/site.ts` + `messages/*.json` (CMS-ready shape)

## Develop

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000 → redirects to `/uz`.

Admin leads: http://localhost:3000/uz/admin with token from `.env.local`.

## Scripts

- `npm run dev` — local server
- `npm run build` — production build
- `npm run start` — serve build
- `npm run lint` — ESLint

## Notes

- Brand accent `#FF8562`, Inter, warm off-white surfaces
- UZ contacts in `src/content/site.ts` are placeholders until client confirms
- Payload/full CMS can replace content files later without changing routes
