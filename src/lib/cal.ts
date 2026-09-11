import { getCalApi } from "@calcom/embed-react";

export const CAL_NAMESPACE = "renaser";

let ready: Promise<void> | null = null;

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
    })();
  }
  return ready;
}

// Solo puede haber un callback "on success" activo a la vez — si se abre
// otro modal antes de que el anterior termine, se reemplaza el listener
// viejo en vez de acumularlos.
let currentSuccessHandler: ((event: CustomEvent) => void) | null = null;

export async function openBookingModal(
  calLink: string,
  prefill?: Record<string, string>,
  onBookingSuccessful?: () => void
) {
  const cal = await getCalApi({ namespace: CAL_NAMESPACE });

  if (currentSuccessHandler) {
    cal("off", { action: "bookingSuccessfulV2", callback: currentSuccessHandler });
    currentSuccessHandler = null;
  }

  if (onBookingSuccessful) {
    const handler = (() => {
      onBookingSuccessful();
      cal("off", { action: "bookingSuccessfulV2", callback: handler });
      if (currentSuccessHandler === handler) currentSuccessHandler = null;
    }) as (event: CustomEvent) => void;
    currentSuccessHandler = handler;
    cal("on", { action: "bookingSuccessfulV2", callback: handler });
  }

  cal("modal", { calLink, config: { layout: "month_view", ...prefill } });
}
