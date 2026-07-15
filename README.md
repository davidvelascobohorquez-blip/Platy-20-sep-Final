# Chip and Weight — True Services

App de gestión de estimados, ventas y trabajos para una empresa de corte de árboles.

## Roles

- **Secretaria** (`/secretaria`): recibe estimados (nombre, dirección, franja horaria) y los asigna al vendedor más cercano.
- **Vendedor** (`/vendedor`): activa su ubicación en vivo, ve sus estimados asignados, actualiza el estado y registra el resultado (vendido/no, alcance del trabajo, monto, notas).
- **Administrador** (`/admin`): tablero con estado de cada vendedor (completados, en cola, tiempo en el estimado actual, tiempo estimado de disponibilidad) y tasa de cierre / ventas totales.
- **Cuadrilla** (`/cuadrilla`): módulo de trabajos programados del día siguiente — pendiente para Fase 3.

## Alcance de esta Fase 1 (MVP)

Incluido:
- Autenticación por rol (cookie firmada con JWT).
- Creación de estimados + geocoding de dirección (Nominatim, gratuito).
- Asignación manual sugerida por cercanía (distancia en línea recta, fórmula de Haversine).
- Actualización de ubicación del vendedor vía Geolocation API del navegador.
- Flujo de estado del estimado: pendiente → asignado → en progreso → completado.
- Registro de resultado (vendido, alcance, monto, notas).
- Dashboard de administrador con métricas básicas.

Pendiente para próximas fases:
- **Fase 2**: Integración real con Google Maps (rutas, tiempo de viaje, tráfico) en vez de distancia en línea recta; métricas de cola más precisas.
- **Fase 3**: Módulo de cuadrilla con trabajos programados y métodos de pago (cash / cheque / tarjeta +5%).
- **Fase 4**: Fotos, notas para la cuadrilla, notificaciones push.

## Desarrollo local

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed   # crea usuarios de prueba, contraseña: demo1234
npm run dev
```

Usuarios de prueba (contraseña `demo1234` para todos):
- admin@trueservices.com
- secretaria@trueservices.com
- vendedor1@trueservices.com / vendedor2@trueservices.com
- cuadrilla@trueservices.com

## Variables de entorno

- `DATABASE_URL`: conexión de la base de datos (SQLite por defecto, migrar a Postgres en producción).
- `SESSION_SECRET`: secreto para firmar la sesión (cámbialo en producción).
- `GOOGLE_MAPS_API_KEY`: pendiente de agregar en la Fase 2 para reemplazar el geocoding gratuito y calcular rutas reales.
