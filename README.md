# Digital Waiter

Sistema multiplataforma para la operación de restaurantes. La misma interfaz Angular se utiliza como aplicación web responsive, PWA instalable y base para Android mediante Capacitor.

## Estructura del repositorio

```text
DIGITAL-WAITER/
├── digital-waiter-front/   # Angular: web, PWA y Android con Capacitor
├── digital-waiter-back/    # NestJS: API REST, reglas de negocio y TypeORM
├── docker-compose.yml      # PostgreSQL y backend
├── .gitignore
└── README.md
```

Esta separación evita mezclar componentes visuales, reglas de negocio y configuración de infraestructura.

## Arquitectura

```text
Web/PWA ─┐
         ├─ Angular + Capacitor ── HTTP/JSON ── NestJS ── TypeORM ── PostgreSQL
Android ─┘
```

El frontend nunca se conecta directamente a PostgreSQL. Toda lectura o modificación pasa por la API.

## Estado actual de integración

- El inicio de sesión ya consume `POST /api/auth/login` y utiliza JWT.
- La API y PostgreSQL ya ejecutan el flujo completo de mesas, pedidos, estados de cocina y pagos.
- Las pantallas operativas de Angular conservan temporalmente su estado local de demostración. El siguiente sprint debe sustituir esas operaciones por llamadas a `ApiService`, módulo por módulo, sin cambiar la interfaz visual.

## Arranque con Docker

Requisito: Docker Desktop.

```powershell
docker compose up --build
```

Después, en otra terminal:

```powershell
cd digital-waiter-front
pnpm install
pnpm start
```

- Web: `http://localhost:4200`
- API: `http://localhost:3000/api`
- PostgreSQL desde el computador: `localhost:55432` (dentro de Docker utiliza `5432`)

## Arranque sin Docker

Se necesita PostgreSQL local y una base llamada `digital_waiter`.

```powershell
cd digital-waiter-back
Copy-Item .env.example .env
pnpm install
pnpm start:dev
```

En otra terminal:

```powershell
cd digital-waiter-front
pnpm install
pnpm start
```

## Credenciales de demostración

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `1234` | Administrador |
| `mesero` | `1234` | Mesero |
| `cocina` | `1234` | Cocina |
| `cajero` | `1234` | Cajero |

## Aplicación móvil

La PWA puede instalarse desde Chrome o Edge usando **Instalar aplicación**. Para generar Android:

```powershell
cd digital-waiter-front
pnpm install
pnpm exec cap add android
pnpm mobile:android
```

En el emulador Android la API local utiliza `http://10.0.2.2:3000/api`. En un teléfono físico se debe configurar la dirección del computador, por ejemplo `http://192.168.1.20:3000/api`, y permitir ese origen en `CORS_ORIGIN`.

## Flujo funcional objetivo

```text
Login → Dashboard → Mesas → Pedido → Cocina → Entrega → Pago → Mesa disponible
```

## Normas para el equipo

1. No trabajar directamente en `main`.
2. Crear una rama por actividad: `nombre/modulo-descripcion`.
3. No subir `.env`, contraseñas reales, `node_modules`, `dist` ni la carpeta generada de Android.
4. Ejecutar la compilación antes de solicitar integración.
5. Entregar rama, hash del commit, archivos modificados y evidencia de prueba.
