export { CookieConsent, openConsentPreferences } from "./CookieConsent.js";
export type { CookieConsentProps } from "./CookieConsent.js";

export { defaultConsentScript, pushConsentUpdate } from "./consent-mode.js";

export { loadConsent, saveConsent, clearConsent, buildRecord } from "./storage.js";

export { getMessages } from "./translations.js";

export type {
  ConsentLocale,
  ConsentCategory,
  ConsentChoices,
  ConsentRecord,
  ConsentMessages,
} from "./types.js";
