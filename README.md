# Peanut

Plataforma de identificacion y busqueda de perros perdidos. Monorepo con backend API y app movil.

## Estructura

```
peanut/
├── backend/    # API REST (NestJS + Prisma + PostgreSQL)
└── mobile/     # App movil (Expo + React Native)
```

## Requisitos

- Node.js 18+
- PostgreSQL
- iOS Simulator o Android Emulator (para la app movil)

## Inicio rapido

### Backend

```bash
cd backend
npm install
```

Crea `backend/.env` con las siguientes variables:

```env
# Base de datos (PostgreSQL / Supabase)
DATABASE_URL="postgresql://user:pass@localhost:5432/peanut"
DIRECT_URL="postgresql://user:pass@localhost:5432/peanut"

# JWT
JWT_SECRET=tu_secreto
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# SMTP (para recuperacion de contrasena)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_clave
EMAIL_FROM="Peanut <no-reply@peanut.com>"
```

Genera el cliente Prisma y aplica migraciones:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Levanta el servidor de desarrollo:

```bash
npm run start:dev
```

La API responde en `http://localhost:3000`.

### Mobile

```bash
cd mobile
npm install
npm start
```

Configura `EXPO_PUBLIC_API_URL` apuntando a tu backend (por defecto `http://localhost:3000`).

## Scripts disponibles

### Backend (`backend/`)

| Script | Descripcion |
|---|---|
| `npm run start:dev` | Servidor de desarrollo con hot-reload |
| `npm run build` | Compilar TypeScript |
| `npm start` | Servidor en produccion |
| `npm run prisma:generate` | Generar cliente Prisma |
| `npm run prisma:migrate` | Aplicar migraciones |

### Mobile (`mobile/`)

| Script | Descripcion |
|---|---|
| `npm start` | Servidor Expo |
| `npm run ios` | Correr en simulador iOS |
| `npm run android` | Correr en emulador Android |
| `npm run lint` | Lint |

## Stack

- **Backend:** NestJS 11, Prisma 7, PostgreSQL, JWT, Nodemailer
- **Mobile:** Expo 51, React Native 0.74, React Query, Zustand, React Native Paper

## Autenticacion

Todas las rutas requieren `Authorization: Bearer <token>` excepto:

- `POST /users/signup`
- `POST /users/login`
- `POST /users/recover-password`

El token se obtiene desde `/users/login`.
