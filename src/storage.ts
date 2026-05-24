import type { ConsentChoices, ConsentRecord } from "./types.js";

const DEFAULT_STORAGE_KEY = "mcm.consent";

export function loadConsent(
  expectedVersion: string,
  storageKey: string = DEFAULT_STORAGE_KEY,
): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.version !== "string" ||
      typeof parsed.timestamp !== "number" ||
      typeof parsed.choices !== "object"
    ) {
      return null;
    }
    // If config version changed, force re-consent.
    if (parsed.version !== expectedVersion) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveConsent(
  record: ConsentRecord,
  storageKey: string = DEFAULT_STORAGE_KEY,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(record));
  } catch {
    // localStorage might be unavailable (private mode, quota). Silently ignore;
    // user will be re-prompted next visit which is the safer default.
  }
}

export function clearConsent(
  storageKey: string = DEFAULT_STORAGE_KEY,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    /* noop */
  }
}

export function buildRecord(
  version: string,
  choices: ConsentChoices,
): ConsentRecord {
  return { version, timestamp: Date.now(), choices };
}
