# PLATY — Starter PRO

### Qué incluye
- Landing minimalista (Next 14 + Tailwind)
- Wizard `/demo` (datos, licencia de por vida, 3 intentos)
- API `/api/generate-menu` con OpenAI (o fallback) + cantidades + costos COP
- PDF diseñado con @react-pdf/renderer
- Pricebook local (`data/pricebook.co.json`)

### Variables de entorno
- `OPENAI_API_KEY` (recomendado)
- `PLATY_LIFETIME_CODE` (p. ej. PLATY-2025-LIFE)
- `NEXT_PUBLIC_DOMAIN` (opcional, para textos visibles)

### Dev local
```
npm i
npm run dev
```

### Deploy en Vercel
Importa el repo → añade variables → Deploy.


### Pago con Wompi
Configura en Vercel el env `NEXT_PUBLIC_WOMPI_LINK` con tu enlace de pago de Wompi (Payment Link). El botón **Comprar** y la página `/checkout` redirigen allí.


### Acceso vitalicio (sin backend complejo)
- Protegemos `/pro` con una cookie firmada `platy_access`.
- Tras el pago en Wompi, el usuario vuelve a `/thanks?id=TRANSACTION_ID&email=...`.
- El API `/api/wompi/verify` consulta la transacción con `WOMPI_PRIVATE_KEY` en `WOMPI_API_BASE` (production/sandbox), y si está `APPROVED`, emite la cookie.
- Configura en Vercel:
  - `ACCESS_COOKIE_SECRET` (cadena aleatoria segura)
  - `WOMPI_PRIVATE_KEY` (llave privada de Wompi)
  - `WOMPI_API_BASE` (ej: `https://production.wompi.co` o `https://sandbox.wompi.co`)
  - `NEXT_PUBLIC_WOMPI_LINK` (Payment Link para `/checkout`)

### URL de retorno en Wompi
Apunta el return URL de tu link/botón a `/thanks` y agrega `?id={{transaction.id}}&email={{customer.email}}` si tu flujo lo permite.


### Panel /admin
- Protegido por cookie de administrador (login con `ADMIN_PASSWORD`, sesión 48h).
- Ver **transacciones recientes** de Wompi (20) con estado.
- **Generar acceso manual**: crea link de activación (48h). Al abrirlo, se emite cookie `platy_access` y redirige a `/pro`.
- Variables adicionales:
  - `ADMIN_PASSWORD` (requerida).


### Webhook de Wompi
- Configura en Wompi → Programadores → URL de eventos: `https://TU-DOMINIO.vercel.app/api/wompi/webhook`
- Agrega en Vercel la variable `WOMPI_EVENTS_SECRET` con el **Secreto de Eventos**.
- El webhook valida firma y además verifica el estado real con `/api/wompi/tx` (APPROVED).

