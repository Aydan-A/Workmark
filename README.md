# Daily Work Log

A React + TypeScript app scaffold for tracking daily work entries, viewing weekly summaries, and exporting logs.

## Current Status

The project is in scaffold phase.

- Vite + React + TypeScript setup is complete.
- Folder structure for features/pages/components is created.
- Most feature files are placeholders and still need implementation.
- `App` and router are not wired to real pages yet.

## Tech Stack

- React 19
- TypeScript 5
- Vite 7
- React Router 7
- TanStack Query 5
- MUI 7
- Firebase SDK 12
- date-fns 4

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

4. Preview production build:

```bash
npm run preview
```

5. Run lint:

```bash
npm run lint
```

## Project Structure

```text
src/
  app/
    App.tsx
    router.tsx
  components/
    common/
      ConfirmDialog.tsx
      StatCard.tsx
    layout/
      AppShell.tsx
      TopNav.tsx
  features/
    entries/
      entry.api.ts
      entry.types.ts
      entry.utils.ts
    export/
      csv.ts
  firebase/
    auth.ts
    client.ts
    db.ts
    storage.ts
  pages/
    Calendar.tsx
    LogToday.tsx
    Login.tsx
    WeeklyLog.tsx
  styles/
    theme.ts
  main.tsx
  index.css
```

## Implementation Checklist

- Wire routes in `src/app/router.tsx`.
- Add page content for `LogToday`, `WeeklyLog`, `Calendar`, and `Login`.
- Set up Firebase initialization and auth/firestore/storage helpers.
- Define entry types, API methods, and date/grouping utilities.
- Build reusable layout and common UI components.
- Add CSV export logic in `src/features/export/csv.ts`.
- Replace Vite default styles with project design system/theme.

## Notes

- `dist/` currently exists from a local build.
- This README reflects scaffold state and should be updated as features are implemented.
