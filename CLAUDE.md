# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Peanut is a full-stack dog identification and lost dog reporting platform. Monorepo with a **NestJS backend** (root) and a **React Native/Expo mobile app** (`mobile/`).

## Commands

### Backend (run from root)
```bash
npm run start:dev          # Dev server (ts-node-dev, port 3000)
npm run build              # Compile TypeScript → dist/
npm start                  # Production server
npm run prisma:generate    # Generate Prisma client after schema changes
npm run prisma:migrate     # Apply database migrations
```

### Mobile (run from mobile/)
```bash
npm start                  # Start Expo dev server
npm run ios                # Run on iOS simulator
npm run android            # Run on Android emulator
npm run lint               # Lint
```

## Architecture

### Backend (NestJS 11 + Prisma 7 + PostgreSQL)
- **Entry point:** `src/main.ts` — global validation pipe with whitelist + transform enabled
- **Auth:** Global `JwtAuthGuard` on all routes; use `@Public()` decorator to opt out
- **Modules:** Feature-based (`users/`, `dogs/`, `lost-reports/`, `sightings/`, `scan-events/`, `notifications/`, `mail/`)
- **Database:** Prisma ORM with PostgreSQL adapter (`@prisma/adapter-pg`). Schema at `prisma/schema.prisma`
- **Validation:** class-validator DTOs in each module's `dto/` folder
- **i18n:** `src/i18n/messages.ts` with EN/ES translations for error messages
- **Password hashing:** bcrypt (10 rounds)
- **Email:** Nodemailer via `MailService` for password recovery

### Mobile (Expo 51 + React Native 0.74)
- **Routing:** Expo Router file-based routing in `mobile/app/`. Groups: `(auth)` for login/signup, `(tabs)` for main app
- **State:** Zustand stores in `mobile/src/store/` — `auth.ts` (persisted to AsyncStorage), `dogs.ts`, `preferences.ts`
- **Data fetching:** React Query (`@tanstack/react-query`)
- **HTTP client:** `mobile/src/api/http.ts` — custom fetch wrapper with Bearer auth and automatic 401 token refresh
- **Forms:** Formik + Yup validation
- **UI:** React Native Paper (Material Design 3) with custom theme in `mobile/src/theme/`
- **Path alias:** `@/*` maps to `mobile/src/*`
- **i18n:** `mobile/src/i18n.ts` with ES/EN translations

## Environment Variables

Required in `.env` at root:
- `DATABASE_URL`, `DIRECT_URL` — PostgreSQL connection strings (Supabase)
- `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`

Mobile uses `EXPO_PUBLIC_API_URL` for API base URL.
