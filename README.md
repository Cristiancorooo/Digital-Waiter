# Digital Waiter

Plataforma gastronómica multiplataforma que conecta al cliente con el establecimiento. El cliente puede consultar la carta, pedir desde una mesa o anticipar un retiro; el personal recibe la misma orden en Cocina y Caja. La interfaz Angular funciona como web responsive, PWA instalable y base para Android mediante Capacitor.

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

## Estado actual del producto

- El inicio público móvil permite explorar el restaurante y su carta sin seleccionar roles técnicos ni iniciar sesión.
- El cliente puede escanear un QR de mesa (con ingreso manual alternativo), crear un pedido para comer en el local o programar un retiro.
- Cada pedido público se guarda en PostgreSQL y recibe un código de seguimiento no secuencial.
- El seguimiento muestra Confirmado → Preparando → Listo → Por retirar → Completado.
- Todos los módulos operativos consumen la API y persisten sus datos en PostgreSQL.
- Mesero, cocina, caja y administración comparten mesas, pedidos y estados mediante sincronización automática.
- El flujo pedido → cocina → cobro → liberación de mesa está validado de extremo a extremo.
- Los permisos se aplican en la interfaz y también en la API.
- Administración puede crear usuarios, asignar roles, desactivar accesos y renovar contraseñas.
- Menú, inventario, pagos y reportes trabajan con información centralizada.
- El Asistente IA operativo analiza retrasos, ocupación, productos solicitados y stock para recomendar prioridades al administrador.
- Las notificaciones por rol enlazan la secuencia Mesero → Cocina → Mesero → Caja mientras la aplicación está abierta.
- El asistente por voz o texto permite registrar pedidos, actualizar Cocina, solicitar cobros y cobrar mediante instrucciones confirmadas por cada usuario.
- La identidad incluye logo completo, icono móvil y pantalla splash en rojo vino, naranja y crema.
- La solución completa puede ejecutarse con Docker y la interfaz también puede empaquetarse como PWA o Android.

Las recomendaciones actuales se calculan con reglas y datos reales del restaurante; no envían información a una IA externa. Los avisos aparecen dentro de la aplicación y pueden mostrarse como notificaciones del navegador al conceder permiso. Para recibir avisos con la aplicación completamente cerrada se debe añadir un servicio push como Firebase Cloud Messaging al desplegar el producto con HTTPS.

## Arranque con Docker

Requisito: Docker Desktop.

```powershell
docker compose up -d --build
```

- Aplicación del cliente: `http://localhost:8099/cliente`
- Acceso del establecimiento: `http://localhost:8099/login`
- API: `http://localhost:3000/api`
- Estado de la API: `http://localhost:3000/api/health`
- PostgreSQL desde el computador: `localhost:55432` (dentro de Docker utiliza `5432`)

Para un servidor real, copiar `.env.production.example` como `.env`, reemplazar ambos secretos y publicar el puerto web detrás de un dominio con HTTPS.

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

## Flujos funcionales

```text
Cliente en mesa: QR → Carta → Pedido → Cocina → Entrega → Caja
Cliente anticipado: Carta → Retiro → Cocina → Aviso de listo → Caja
Personal: Login → Dashboard → Mesas/Pedidos → Cocina → Pago
```

## Alcance de demostración

- La aplicación registra pagos en efectivo, tarjeta o transferencia, pero no procesa cobros bancarios en línea.
- Las notificaciones sonoras y del navegador funcionan mientras la aplicación está abierta. Las alertas con la app cerrada requieren HTTPS y un servicio push como Firebase Cloud Messaging.
- La detección automática de QR depende de la compatibilidad del navegador; siempre queda disponible el código manual, por ejemplo `MESA-4`.
- El catálogo público presenta el establecimiento de demostración `Sazón de Casa`; la API quedó separada para incorporar más restaurantes posteriormente.

## Identidad visual

Los recursos definitivos están en `digital-waiter-front/public/`:

- `digital-waiter-logo-v1.png`: logo completo.
- `digital-waiter-logo-light.png`: versión clara para fondos rojo vino.
- `digital-waiter-app-icon.png`: icono cuadrado para PWA y móvil.
- `digital-waiter-splash.png`: pantalla de inicio móvil.

## Normas para el equipo

1. No trabajar directamente en `main`.
2. Crear una rama por actividad: `nombre/modulo-descripcion`.
3. No subir `.env`, contraseñas reales, `node_modules`, `dist` ni la carpeta generada de Android.
4. Ejecutar la compilación antes de solicitar integración.
5. Entregar rama, hash del commit, archivos modificados y evidencia de prueba.
