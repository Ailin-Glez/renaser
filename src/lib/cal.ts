import { getCalApi } from "@calcom/embed-react";

export const CAL_NAMESPACE = "renaser";

let ready: Promise<void> | null = null;

// El callback para la reserva en curso. Cal.com recomienda registrar el
// listener "on" UNA sola vez, temprano (no por cada clic) — así que en vez
// de engancharlo/desengancharlo en cada llamada a openBookingModal, hay un
// único listener permanente (ver abajo) que invoca lo que haya guardado acá.
let pendingSuccessCallback: ((event: CustomEvent) => void) | null = null;

export function initCal() {
  if (!ready) {
    ready = (async () => {
      const cal = await getCalApi({ namespace: CAL_NAMESPACE });
      cal("ui", {
        theme: "light",
        cssVarsPerTheme: {
          light: { "cal-brand": "#0b4d3b" },
          dark: { "cal-brand": "#0b4d3b" },
        },
        hideEventTypeDetails: false,
      });
      cal("on", {
        action: "bookingSuccessfulV2",
        callback: (event: CustomEvent) => {
          pendingSuccessCallback?.(event);
        },
      });
    })();
  }
  return ready;
}

export async function openBookingModal(
  calLink: string,
  prefill?: Record<string, string>,
  onBookingSuccessful?: (event: CustomEvent) => void
) {
  const cal = await getCalApi({ namespace: CAL_NAMESPACE });
  pendingSuccessCallback = onBookingSuccessful ?? null;
  cal("modal", { calLink, config: { layout: "month_view", ...prefill } });
}
