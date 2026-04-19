# Fix errors and optimize DormMaster application

This plan addresses several technical issues found in the codebase to ensure functionality and improve code quality.

## User Review Required

> [!IMPORTANT]
> - I will be renaming `GEMINI_API_KEY` to `VITE_GEMINI_API_KEY` in the `.env` file and code to comply with Vite's environment variable conventions.
> - I will update the AI model name to `gemini-1.5-flash` for better compatibility and performance.

## Proposed Changes

### Core Configuration

#### [MODIFY] [.env.example](file:///c:/Users/FUJITSU/Downloads/quanlynt-a1-main/quanlynt-a1-main/.env.example)
- Rename `GEMINI_API_KEY` to `VITE_GEMINI_API_KEY`.
- Rename `APP_URL` to `VITE_APP_URL`.

#### [NEW] [.env](file:///c:/Users/FUJITSU/Downloads/quanlynt-a1-main/quanlynt-a1-main/.env)
- Create from `.env.example` with placeholders.

### Source Code Fixes

#### [MODIFY] [ReportsPage.tsx](file:///c:/Users/FUJITSU/Downloads/quanlynt-a1-main/quanlynt-a1-main/src/pages/ReportsPage.tsx)
- Change `process.env.GEMINI_API_KEY` to `import.meta.env.VITE_GEMINI_API_KEY`.
- Change model name from `gemini-3-flash-preview` to `gemini-1.5-flash`.
- Import `Sparkles` from `lucide-react` and remove the local fallback.

#### [MODIFY] [PointsPage.tsx](file:///c:/Users/FUJITSU/Downloads/quanlynt-a1-main/quanlynt-a1-main/src/pages/PointsPage.tsx)
- Change `process.env.GEMINI_API_KEY` to `import.meta.env.VITE_GEMINI_API_KEY`.
- Change model name from `gemini-3-flash-preview` to `gemini-1.5-flash`.

#### [MODIFY] [StudentsPage.tsx](file:///c:/Users/FUJITSU/Downloads/quanlynt-a1-main/quanlynt-a1-main/src/pages/StudentsPage.tsx)
- Ensure all imports are used and correctly typed.

## Verification Plan

### Manual Verification
- Verify that the app builds correctly.
- Verify that the AI analysis features use the correct environment variables and model names.
