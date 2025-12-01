# Peanut API

## Requisitos
- Node.js 18+
- PostgreSQL disponible y accesible

## Como correr el proyecto (dev)
1) Instala dependencias (ya hay package.json):
```
npm install
```

2) Crea `.env` en la raiz con tu conexion a Postgres:
```
DATABASE_URL="postgresql://user:pass@localhost:5432/peanut"
```

3) Genera Prisma y aplica la migracion inicial:
```
npx prisma generate
npx prisma migrate dev --name init
```

4) Arranca en modo desarrollo:
```
npm run start:dev
```

El API responde en http://localhost:3000.
