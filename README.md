# Digital Waiter

Aplicación frontend para la gestión integral de restaurantes, desarrollada con Angular 20 y TypeScript.

El proyecto que debe utilizarse para desarrollo y presentación se encuentra en [`angular-app`](./angular-app/).

## Ejecutar

```powershell
cd angular-app
pnpm install
pnpm start
```

Abrir `http://localhost:4200`.

## Credenciales de demostración

- Usuario: cualquier nombre.
- Contraseña: `1234`, `5678` o `9999`.
- Roles: Administrador, Mesero, Cajero y Cocina.

## Funcionalidades

- Inicio de sesión y navegación protegida por guard.
- Permisos y menús según el rol seleccionado.
- Dashboard con métricas operativas.
- Gestión de mesas y creación de pedidos.
- Flujo de cocina, entrega, cobro y liberación de mesas.
- Gestión de menú e inventario.
- Descuento de ingredientes al registrar pagos.
- Reportes y exportación CSV.
- Persistencia local para la demostración.

La documentación técnica y la estructura detallada están en [`angular-app/README.md`](./angular-app/README.md).
