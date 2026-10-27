# Portfolio language switching

The shared navigation provides Chinese and English on the homepage and all five case studies. Desktop uses a Chinese/EN segmented control; mobile uses a 44px button. Chinese is the default, and the browser saves the selected language under `leo-portfolio-language`.

UI copy lives in `app/i18n/messages.en.json`. `useI18n()` translates rendered copy and accessibility labels, while `localize()` handles presentation data such as table columns. The React context updates text without remounting page components. Switching preserves the current reading section and its viewport position. Refreshes, case navigation, and legacy section routes retain the selected language. When storage is unavailable, switching still works on the current page.

Original images and the supplied Chinese resume PDF remain unchanged. Zhaocai Smart’s conversation, dashboard, follow-up conversation, answer workbench, and standalone specification follow the selected language. `OriginalLanguage` remains available for other intentionally original-language demonstrations. Assistant chrome, welcome copy, and suggested-question labels are translated; existing conversation content is retained.

## Validation on 2026-10-27

- TypeScript: `npx tsc --noEmit --incremental false` passed.
- Static production build: Vite GitHub Pages build, route preparation, and root synchronization passed. Existing public assets were used; image optimization and resume generation were not run.
- Browser: homepage and all five case studies checked in English on compact desktop and mobile viewports (approximately 1357px and 389px CSS width under the browser's current zoom).
- Chinese/English switching, refresh persistence, homepage-to-case navigation, open experience panels, and slow-query demo state checked.
- Navigation leaves space for the language control; checked pages had no horizontal document overflow.
- English narrative scan found no remaining Chinese outside intentional original-language product demonstrations and the language-choice label.
- Browser console error check was empty.
- Git diff confirms no PNG/JPEG/WebP/SVG/video/PDF files changed. The resume URL still points to the supplied Chinese PDF.

Local preview: `http://127.0.0.1:8001/portfolio/`. Publication is verified against the GitHub Pages build status and deployed assets.

## Zhaocai Smart coverage repair (2026-10-27)

The interactive demos now use the shared locale, including input labels, candidate metrics, waiting/stopped/empty/result states, source dialogs, dashboard notices, follow-up answers, rendered Markdown, and the native specification. Native HTML uses the shared dictionary synchronized by `scripts/copy-static.mjs`; parent language changes preserve the selected specification scenario or rule. Canonical option values are distinct from translated labels. English finance-query aliases are normalized before the existing demo logic, while unknown conditions still produce no-match feedback.

Validation: TypeScript and production static build passed. Eight specification scenarios and twelve component rules retained matching heading/table counts and validation results, without untranslated Chinese text. Browser checks covered net-profit selection and result values, English 2025 no-match behavior, quarter comparison and causality boundaries, stop/state retention across languages, specification keyboard navigation and language retention, English source dialogs, and dashboard add/merge/undo counts. Original image/video/PDF files were unchanged.
