import type { ConsentChoices } from "./types.js";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown> | IArguments>;
  }
}

/**
 * Returns an inline script string that sets Google Consent Mode v2 default
 * to "denied" for ad and analytics storage.
 *
 * Inject this in <head> BEFORE Google Tag Manager so tags wait for an
 * explicit consent update before firing.
 *
 * The script is generated from controlled inputs only (no user data is
 * interpolated) — safe to embed via the standard inline-script mechanism
 * of your framework.
 */
export function defaultConsentScript(opts?: {
  /** Region restriction for the default (ISO country codes). Empty = global. */
  region?: string[];
  /** Wait time for the consent update in ms. Default 500. */
  waitForUpdate?: number;
}): string {
  const region = opts?.region;
  const waitForUpdate = opts?.waitForUpdate ?? 500;
  const regionClause = region && region.length > 0
    ? `, region: ${JSON.stringify(region)}`
    : "";
  return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{'ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','analytics_storage':'denied','functionality_storage':'denied','personalization_storage':'denied','security_storage':'granted','wait_for_update':${waitForUpdate}${regionClause}});`;
}

/**
 * Push a Google Consent Mode v2 "update" signal based on user choices.
 * Call this whenever the user changes their consent in the UI.
 */
export function pushConsentUpdate(choices: ConsentChoices): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  const ad = choices.advertising ? "granted" : "denied";
  const analytics = choices.analytics ? "granted" : "denied";
  window.dataLayer.push({ event: "consent_update" });
  window.dataLayer.push([
    "consent",
    "update",
    {
      ad_storage: ad,
      ad_user_data: ad,
      ad_personalization: ad,
      analytics_storage: analytics,
      functionality_storage: "granted",
      personalization_storage: analytics,
      security_storage: "granted",
    },
  ] as unknown as Record<string, unknown>);
}
