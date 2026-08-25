# RenaSER — sitio web

Sitio en React + TypeScript (Vite) para el negocio de terapias holísticas RenaSER: inicio, sobre mí, terapias, reviews y reservas.

## Desarrollo

```bash
npm install
npm run dev
```

## Reemplazar contenido

Todo el contenido del sitio (bio, terapias, testimonios, teléfono, email, redes sociales) vive en un único archivo:

**[src/data/content.ts](src/data/content.ts)**

Edita ese archivo y los cambios se reflejan automáticamente en todas las páginas — no hace falta tocar componentes.

## Configurar las reservas (Cal.com)

El sitio usa [Cal.com](https://cal.com) (plan gratis) embebido en `/reservas` — no requiere backend ni base de datos.

1. Crea una cuenta gratis en [cal.com](https://cal.com).
2. Conecta tu calendario (Google Calendar / Outlook) para que detecte tu disponibilidad real.
3. Crea un **tipo de evento por cada terapia** (nombre, duración, precio si aplica).
4. Opcional: conecta Stripe o PayPal en Cal.com si quieres cobrar al momento de reservar.
5. Copia la URL de tu página pública (ej. `https://cal.com/tu-usuario`) y actualiza `BOOKING_URL` en [src/data/content.ts](src/data/content.ts).

## Build de producción

```bash
npm run build
npm run preview
```
