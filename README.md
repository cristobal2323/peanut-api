# Peanut API

## Requisitos

- Node.js 18+
- PostgreSQL disponible y accesible

## Como correr el proyecto (dev)

1. Instala dependencias (ya hay package.json):

```
npm install
```

2. Crea `.env` en la raiz con tu conexion a Postgres:

```
DATABASE_URL="postgresql://user:pass@localhost:5432/peanut"
```

3. Genera Prisma y aplica la migracion inicial:

```
npx prisma generate
npx prisma migrate dev --name init
```

4. Arranca en modo desarrollo:

```
npm run start:dev
```

El API responde en http://localhost:3000.

## Autenticacion y correos

- Las llamadas (salvo `POST /users/signup`, `POST /users/login` y `POST /users/recover-password`) requieren header `Authorization: Bearer <token>` obtenido desde `/users/login`.
- Configura un secreto JWT y tiempo de expiracion en `.env`:

```
JWT_SECRET=pon_un_valor_secreto
JWT_EXPIRES_IN=7d
```

- Para recuperar contrasena por correo configura SMTP , host por defecto `smtp.gmail.com` si usas Gmail):

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=usuario
SMTP_PASS=clave
EMAIL_FROM="Peanut <no-reply@peanut.com>"
```

Si faltan estas variables el envio de correos fallara al intentar recuperar contrasena.
