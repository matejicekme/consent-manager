# @matejicek-me/consent-manager

Tiny, themeable, GDPR/CNIL-compliant cookie consent manager for React with built-in Google Consent Mode v2 support.

## Features

- **Zero dependencies** beyond React 18+
- **GDPR / CNIL compliant** — Accept all / Reject all / Customize, all on the same level
- **Google Consent Mode v2** out of the box (default = denied → updates on choice)
- **5 locales built-in**: FR / EN / IT / DE / ES, all overridable
- **Themed via CSS variables** — match your brand without forking
- **Versioned storage** — bump the version to force re-consent when your tracking changes
- **A11y** — keyboard navigation, focus-visible, ARIA, Escape closes the modal
- **~5 KB gzipped** including translations

## Install

```bash
npm install @matejicek-me/consent-manager
```

## Quick start (Next.js App Router)

### 1. Set Google Consent Mode default to "denied" before GTM loads

In `app/layout.tsx`, inject the default-consent inline script in `<head>` **above** your GTM script. Use `next/script` with `strategy="beforeInteractive"`:

```tsx
import Script from "next/script";
import { defaultConsentScript } from "@matejicek-me/consent-manager";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <Script id="gcm-default" strategy="beforeInteractive">
          {defaultConsentScript()}
        </Script>
        {/* Your GTM script goes after this */}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 2. Import the styles once

```tsx
import "@matejicek-me/consent-manager/styles.css";
```

### 3. Render the banner

```tsx
import { CookieConsent } from "@matejicek-me/consent-manager";

<CookieConsent
  locale="fr"
  version="2026.05"
  privacyHref="/fr/confidentialite"
/>
```

That's it. The banner appears on first visit, the choice is persisted in `localStorage`, and Google Consent Mode v2 signals are pushed to `dataLayer` automatically.

## Theming

Override the CSS custom properties on the root either via your own stylesheet or inline:

```tsx
<CookieConsent
  style={{
    "--mcm-accent": "#0F2A6B",
    "--mcm-accent-hover": "#0a1f4d",
    "--mcm-bg": "#FAF6EE",
    "--mcm-radius": "16px",
    "--mcm-font": "'Geist', system-ui, sans-serif",
  } as React.CSSProperties}
/>
```

### All available CSS variables

| Variable | Default | Purpose |
|---|---|---|
| `--mcm-bg` | `#ffffff` | Card / modal background |
| `--mcm-text` | `#0f172a` | Default text color |
| `--mcm-muted` | `#6b7280` | Secondary text |
| `--mcm-border` | `rgba(15,23,42,.1)` | Soft borders |
| `--mcm-border-strong` | `rgba(15,23,42,.2)` | Toggle off track |
| `--mcm-accent` | `#2563eb` | Primary button background |
| `--mcm-accent-text` | `#ffffff` | Primary button text |
| `--mcm-accent-hover` | `#1d4ed8` | Primary button hover |
| `--mcm-subtle-bg` | `#f8fafc` | Secondary button + modal footer |
| `--mcm-radius` | `14px` | Card / modal radius |
| `--mcm-radius-button` | `10px` | Button radius |
| `--mcm-font` | `system-ui, ...` | Font family |
| `--mcm-shadow` | layered drop | Card shadow |
| `--mcm-overlay` | `rgba(15,23,42,.42)` | Modal backdrop |
| `--mcm-z` | `2147483000` | z-index of the root |

## Reopening from a footer link

```tsx
import { openConsentPreferences } from "@matejicek-me/consent-manager";

<button type="button" onClick={openConsentPreferences}>
  Gerer mes cookies
</button>
```

## Reacting to consent changes

```tsx
<CookieConsent
  onChange={(record) => {
    console.log(record.choices);
    // { necessary: true, analytics: false, advertising: true }
  }}
/>
```

## Overriding copy

```tsx
<CookieConsent
  locale="fr"
  messages={{
    bannerTitle: "Petite question...",
    bannerBody: "On utilise des cookies pour mesurer l'audience. OK pour toi ?",
  }}
/>
```

You can override any subset of the keys — anything you don't override falls back to the built-in translation for `locale`.

## Versioning consent

Bump `version` whenever you change the categories / vendors you track. Existing users will be re-prompted automatically:

```tsx
<CookieConsent version="2026.06" /> // was "2026.05" before
```

## API

### `<CookieConsent />`

| Prop | Type | Default | Description |
|---|---|---|---|
| `locale` | `"fr" \| "en" \| "it" \| "de" \| "es"` | `"en"` | Built-in copy language |
| `version` | `string` | `"1.0"` | Bump to force re-consent |
| `privacyHref` | `string` | – | Privacy policy URL in preferences modal |
| `googleConsentMode` | `boolean` | `true` | Push GCM v2 updates to `dataLayer` |
| `onChange` | `(record) => void` | – | Called on every consent change + on load if stored |
| `messages` | `Partial<ConsentMessages>` | – | Override any string |
| `storageKey` | `string` | `"mcm.consent"` | localStorage key |
| `bannerExtra` | `ReactNode` | – | Custom node before the banner action buttons |
| `style` | `CSSProperties` | – | Inline styles (use for CSS variable overrides) |
| `className` | `string` | – | Extra className on the root |

### Exports

```ts
import {
  CookieConsent,
  openConsentPreferences,
  defaultConsentScript,
  pushConsentUpdate,
  loadConsent,
  saveConsent,
  clearConsent,
  buildRecord,
  getMessages,
} from "@matejicek-me/consent-manager";
```

## License

MIT © Jordan Matejicek
