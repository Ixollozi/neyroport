# Agent notes — Neyroport

## 1:1 clone

1. Read `~/.cursor/skills/pixel-perfect-clone/SKILL.md` + **`CHROME.md`**
2. Browser on origin + `http://localhost:3000`
3. **Never** put a full-page screenshot that includes the site header under live `SiteHeader` (double nav). Strategy A or B only.
4. Audits: `web/scripts/full-site-audit.mjs`, `audit-pages.mjs`, `audit-fx-hero.mjs`
5. Thresholds: top ≥95%, mid ≥90%, frames/fx ≥90%; eye-check single logo first

Rules: `.cursor/rules/pixel-perfect-clone.mdc`, `neyroport-stack.mdc`, `frontend-adaptive.mdc`.

Фронт: адаптив как на neyroport.ru — телефон как их телефон, ПК как их ПК, масштаб браузера как у них. Правило `frontend-adaptive.mdc` всегда включено.
