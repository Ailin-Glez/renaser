import { getCalApi } from "@calcom/embed-react";

export const CAL_NAMESPACE = "renaser";

let ready: Promise<void> | null = null;

export function initCal() {
  if (!ready) {
    ready = (async () => {
      const cal = await getCalApi({ namespace: CAL_NAMESPACE });
      cal("ui", {
        theme: "light",
        styles: { branding: { brandColor: "#0b4d3b" } },
        hideEventTypeDetails: false,
      });
    })();
  }
  return ready;
}

export async function openBookingModal(calLink: string, prefill?: Record<string, string>) {
  const cal = await getCalApi({ namespace: CAL_NAMESPACE });
  cal("modal", { calLink, config: { layout: "month_view", ...prefill } });
}
