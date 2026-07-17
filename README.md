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

Fase 2 (completada): geocoding + tiempos de viaje reales con Google Maps (Geocoding API +
Distance Matrix API con tráfico), con fallback automático a Nominatim + aproximación por
velocidad promedio si no hay `GOOGLE_MAPS_API_KEY`.

Pendiente para próximas fases:
- **Fase 3**: Módulo de cuadrilla con trabajos programados y métodos de pago (cash / cheque / tarjeta +5%).
- **Fase 4**: Fotos, notas para la cuadrilla, notificaciones push.

## Desarrollo local

Necesitas una base de datos Postgres (puede ser gratuita: [Neon](https://neon.tech),
[Supabase](https://supabase.com), o Vercel Postgres).

```bash
npm install
cp .env.example .env   # completa DATABASE_URL con tu Postgres y GOOGLE_MAPS_API_KEY
npm run db:push
npm run db:seed   # crea usuarios de prueba, contraseña: demo1234
npm run dev
```

Usuarios de prueba (contraseña `demo1234` para todos):
- admin@trueservices.com
- secretaria@trueservices.com
- vendedor1@trueservices.com / vendedor2@trueservices.com
- cuadrilla@trueservices.com

## Despliegue en Vercel

1. Crea una base de datos Postgres (Vercel → pestaña "Storage" → "Create Database" es lo más
   simple, o usa Neon/Supabase).
2. En Vercel, importa este repositorio y selecciona la rama `chip-and-weight-app`.
3. Agrega las variables de entorno del proyecto:
   - `DATABASE_URL`: la cadena de conexión de tu Postgres.
   - `SESSION_SECRET`: una cadena aleatoria larga.
   - `GOOGLE_MAPS_API_KEY`: tu llave de Google Maps (Geocoding + Distance Matrix habilitadas).
4. Deploy. El comando de build ya incluye `prisma db push`, así que la primera vez que
   despliegues se crean las tablas automáticamente.
5. Corre el seed una sola vez apuntando a la base de datos de producción (desde tu máquina):
   `DATABASE_URL="<la de producción>" npm run db:seed`.

## Variables de entorno

- `DATABASE_URL`: conexión Postgres (local o de producción).
- `SESSION_SECRET`: secreto para firmar la sesión (cámbialo en producción).
- `GOOGLE_MAPS_API_KEY`: habilita geocoding y tiempos de viaje reales con tráfico.
