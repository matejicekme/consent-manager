"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

import type {
  ConsentChoices,
  ConsentLocale,
  ConsentMessages,
  ConsentRecord,
} from "./types.js";
import { buildRecord, loadConsent, saveConsent } from "./storage.js";
import { pushConsentUpdate } from "./consent-mode.js";
import { getMessages } from "./translations.js";

const OPEN_EVENT = "matejicekme-consent:open";

export type CookieConsentProps = {
  /**
   * Locale used to render built-in copy. Pass your app's current language.
   * Falls back to "en" if the locale is unknown.
   */
  locale?: ConsentLocale;

  /**
   * Bump this string whenever you change the categories you track. Stored
   * choices with a different version are ignored and the user is re-prompted.
   */
  version?: string;

  /**
   * Optional href for the "Privacy policy" link rendered in the preferences modal.
   */
  privacyHref?: string;

  /**
   * Push consent updates to Google Consent Mode v2 / GTM dataLayer.
   * Default: true.
   */
  googleConsentMode?: boolean;

  /**
   * Called every time the user makes (or restores) a choice, including on
   * page load when a prior choice exists.
   */
  onChange?: (record: ConsentRecord) => void;

  /**
   * Override any string in the UI. Useful for custom branding.
   */
  messages?: Partial<ConsentMessages>;

  /**
   * Custom localStorage key (default: "mcm.consent"). Override only if you
   * need to namespace the consent across multiple apps on the same domain.
   */
  storageKey?: string;

  /**
   * Render a custom node before the action buttons in the banner — useful for
   * a brand pill or extra disclaimer.
   */
  bannerExtra?: ReactNode;

  /** Inline style overrides on the root element. Use to pass CSS variables. */
  style?: CSSProperties;

  /** Extra className on the root element. */
  className?: string;
};

/**
 * Programmatically open the preferences modal from anywhere in the app
 * (typically wired to a "Manage cookies" link in the footer).
 */
export function openConsentPreferences(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

const ALL_GRANTED: ConsentChoices = {
  necessary: true,
  analytics: true,
  advertising: true,
};

const ALL_DENIED: ConsentChoices = {
  necessary: true,
  analytics: false,
  advertising: false,
};

export function CookieConsent({
  locale = "en",
  version = "1.0",
  privacyHref,
  googleConsentMode = true,
  onChange,
  messages,
  storageKey,
  bannerExtra,
  style,
  className,
}: CookieConsentProps): ReactNode {
  const t = useMemo(() => getMessages(locale, messages), [locale, messages]);

  const [mounted, setMounted] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [draft, setDraft] = useState<ConsentChoices>(ALL_DENIED);

  // Load saved consent and decide whether to prompt.
  useEffect(() => {
    setMounted(true);
    const saved = loadConsent(version, storageKey);
    if (saved) {
      setDraft(saved.choices);
      if (googleConsentMode) pushConsentUpdate(saved.choices);
      onChange?.(saved);
    } else {
      setBannerOpen(true);
    }
    // We intentionally exclude onChange from deps — caller may pass a new
    // identity each render and we only want to fire once on hydration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, storageKey, googleConsentMode]);

  // External "open preferences" trigger.
  useEffect(() => {
    const handler = (): void => {
      setPreferencesOpen(true);
      setBannerOpen(false);
    };
    window.addEventListener(OPEN_EVENT, handler);
    return () => window.removeEventListener(OPEN_EVENT, handler);
  }, []);

  // Close preferences with Escape — only if a prior choice exists.
  useEffect(() => {
    if (!preferencesOpen) return;
    const saved = loadConsent(version, storageKey);
    if (!saved) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setPreferencesOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preferencesOpen, version, storageKey]);

  const commit = useCallback(
    (choices: ConsentChoices): void => {
      const record = buildRecord(version, choices);
      saveConsent(record, storageKey);
      if (googleConsentMode) pushConsentUpdate(choices);
      onChange?.(record);
      setBannerOpen(false);
      setPreferencesOpen(false);
      setDraft(choices);
    },
    [version, storageKey, googleConsentMode, onChange],
  );

  // SSR / first paint: render nothing to avoid hydration mismatch.
  if (!mounted) return null;
  if (!bannerOpen && !preferencesOpen) return null;

  return (
    <div
      className={`mcm-root${className ? ` ${className}` : ""}`}
      style={style}
    >
      {preferencesOpen ? (
        <PreferencesModal
          t={t}
          draft={draft}
          setDraft={setDraft}
          onSave={() => commit(draft)}
          onAcceptAll={() => commit(ALL_GRANTED)}
          onRejectAll={() => commit(ALL_DENIED)}
          privacyHref={privacyHref}
        />
      ) : (
        <Banner
          t={t}
          onAcceptAll={() => commit(ALL_GRANTED)}
          onRejectAll={() => commit(ALL_DENIED)}
          onCustomize={() => setPreferencesOpen(true)}
          extra={bannerExtra}
        />
      )}
    </div>
  );
}

/* ----------------------- Banner ----------------------- */

function Banner({
  t,
  onAcceptAll,
  onRejectAll,
  onCustomize,
  extra,
}: {
  t: ConsentMessages;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onCustomize: () => void;
  extra?: ReactNode;
}): ReactNode {
  const titleId = useId();
  const bodyId = useId();
  return (
    <div
      className="mcm-banner"
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
    >
      <h2 id={titleId} className="mcm-banner-title">
        {t.bannerTitle}
      </h2>
      <p id={bodyId} className="mcm-banner-body">
        {t.bannerBody}
      </p>
      {extra}
      <div className="mcm-banner-actions">
        <button
          type="button"
          className="mcm-btn mcm-btn-primary"
          onClick={onAcceptAll}
        >
          {t.acceptAll}
        </button>
        <button
          type="button"
          className="mcm-btn mcm-btn-secondary"
          onClick={onRejectAll}
        >
          {t.rejectAll}
        </button>
        <button
          type="button"
          className="mcm-btn mcm-btn-ghost"
          onClick={onCustomize}
        >
          {t.customize}
        </button>
      </div>
    </div>
  );
}

/* ----------------------- Preferences modal ----------------------- */

function PreferencesModal({
  t,
  draft,
  setDraft,
  onSave,
  onAcceptAll,
  onRejectAll,
  privacyHref,
}: {
  t: ConsentMessages;
  draft: ConsentChoices;
  setDraft: (next: ConsentChoices) => void;
  onSave: () => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  privacyHref?: string;
}): ReactNode {
  const titleId = useId();
  return (
    <div
      className="mcm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="mcm-modal">
        <header className="mcm-modal-header">
          <h2 id={titleId} className="mcm-modal-title">
            {t.preferencesTitle}
          </h2>
          <p className="mcm-modal-intro">{t.preferencesIntro}</p>
        </header>

        <div className="mcm-modal-body">
          <Category
            label={t.necessaryLabel}
            description={t.necessaryDescription}
            checked={true}
            disabled={true}
          />
          <Category
            label={t.analyticsLabel}
            description={t.analyticsDescription}
            checked={draft.analytics}
            onChange={(v) => setDraft({ ...draft, analytics: v })}
          />
          <Category
            label={t.advertisingLabel}
            description={t.advertisingDescription}
            checked={draft.advertising}
            onChange={(v) => setDraft({ ...draft, advertising: v })}
          />
        </div>

        <footer className="mcm-modal-footer">
          <div className="mcm-modal-footer-left">
            {privacyHref ? (
              <a
                className="mcm-privacy"
                href={privacyHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.privacyLink}
              </a>
            ) : null}
          </div>
          <div className="mcm-modal-footer-right">
            <button
              type="button"
              className="mcm-btn mcm-btn-ghost"
              onClick={onRejectAll}
            >
              {t.rejectAll}
            </button>
            <button
              type="button"
              className="mcm-btn mcm-btn-secondary"
              onClick={onAcceptAll}
            >
              {t.acceptAll}
            </button>
            <button
              type="button"
              className="mcm-btn mcm-btn-primary"
              onClick={onSave}
            >
              {t.save}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Category({
  label,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
}): ReactNode {
  const id = useId();
  return (
    <div className="mcm-category">
      <div className="mcm-category-text">
        <p className="mcm-category-label">
          <label htmlFor={id}>{label}</label>
        </p>
        <p className="mcm-category-description">{description}</p>
      </div>
      <span className="mcm-toggle">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.currentTarget.checked)}
          aria-label={label}
        />
        <span className="mcm-toggle-track" aria-hidden />
        <span className="mcm-toggle-thumb" aria-hidden />
      </span>
    </div>
  );
}
