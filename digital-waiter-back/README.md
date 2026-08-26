# Digital Waiter Backend

API REST desarrollada con NestJS, TypeORM y PostgreSQL.

## Ejecución local

```powershell
Copy-Item .env.example .env
pnpm install
pnpm start:dev
```

La API queda disponible en `http://localhost:3000/api`.

## Credenciales iniciales

Al iniciar una base vacía se crean usuarios de demostración: `admin`, `mesero`, `cocina` y `cajero`. La contraseña inicial es `1234` y cada usuario debe ingresar con su rol correspondiente.

## Endpoints iniciales

- `POST /api/auth/login`
- `GET /api/mesas`
- `PATCH /api/mesas/:id/estado`
- `GET /api/productos`
- `POST /api/pedidos`
- `GET /api/pedidos`
- `PATCH /api/pedidos/:id/estado`
- `GET /api/inventario`
- `POST /api/pagos`

`synchronize` se habilita solamente fuera de producción. Para producción se deben crear migraciones.
