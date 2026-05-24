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

## Wiring it up in GTM (required for actual compliance)

**Installing the banner is not enough on its own.** This package signals
the user's choice to Google Consent Mode v2 via `dataLayer.push(['consent', 'update', ...])`,
but your tags in Google Tag Manager will still fire unless you gate them
explicitly on those consent signals.

For each tag you ship, open it in GTM → **Advanced Settings** → **Consent Settings**,
choose **"Require additional consent for tag to fire"**, and add the consent
types below.

### Standard tag → consent type mapping

| Tag | Required consent type(s) |
|---|---|
| Google Analytics 4 (Configuration / Event) | `analytics_storage` |
| Reddit Pixel | `ad_storage`, `ad_user_data`, `ad_personalization` |
| Meta / Facebook Pixel | `ad_storage`, `ad_user_data`, `ad_personalization` |
| TikTok Pixel | `ad_storage`, `ad_user_data`, `ad_personalization` |
| LinkedIn Insight Tag | `ad_storage`, `ad_user_data`, `ad_personalization` |
| Google Ads Conversion / Remarketing | `ad_storage`, `ad_user_data`, `ad_personalization` |
| Microsoft UET (Bing Ads) | `ad_storage`, `ad_user_data`, `ad_personalization` |
| Hotjar / Microsoft Clarity / heatmaps | `analytics_storage` |
| Plausible / Fathom (cookieless) | none — these don't store identifiers |
| Stripe / Firebase Auth / session cookies | none — strictly necessary, never gate |

### How the categories in this package map to consent types

This package exposes 3 fixed categories. Each maps to one or more
Google Consent Mode v2 signals when the user toggles it:

| Category in UI | Signals set to `granted` when checked |
|---|---|
| Strictly necessary (locked ON) | `security_storage`, `functionality_storage` |
| Analytics | `analytics_storage`, `personalization_storage` |
| Advertising | `ad_storage`, `ad_user_data`, `ad_personalization` |

When unchecked, those signals are pushed as `denied`. The defaults
emitted by `defaultConsentScript()` (before GTM loads) are `denied` for
everything except `security_storage`, which is always `granted`.

### Testing your setup

1. In GTM, click **Preview** (top right) → enter your site URL.
2. On your site, open the banner and refuse everything.
3. In the Tag Assistant pane, your analytics/ads tags should appear under
   **Tags not fired** with the reason "Consent not granted".
4. Reload the page, this time accept everything in the banner.
5. The same tags should now appear under **Tags fired**.

If a tag fires regardless of your choice, you forgot to configure its
Consent Settings — go back into the tag and set the required consent types.

### Don't forget to publish

After verifying in Preview mode, hit **Submit** in GTM and publish the
container version. Preview mode only affects you; the default `denied`
state on your production users is what protects you legally.

## Adding a new vendor later

When you add a new tracker (e.g. Zoho Analytics, Hotjar, a new ad pixel),
the consent you already collected from existing users **does not cover
the new vendor**. GDPR requires a fresh informed consent. Workflow:

### 1. Pick the right category

Identify what kind of cookies the vendor sets, then map to a category:

| Vendor type | Category | Required GTM consent type |
|---|---|---|
| Web analytics (GA4, Zoho, Matomo, Mixpanel) | Analytics | `analytics_storage` |
| Heatmaps / session replay (Hotjar, Clarity, FullStory) | Analytics | `analytics_storage` |
| Ad / retargeting pixel (Reddit, Meta, TikTok, LinkedIn, Google Ads) | Advertising | `ad_storage`, `ad_user_data`, `ad_personalization` |
| Payment fraud (Stripe, PayPal) | Necessary | none — strictly necessary, never gate |
| Auth / session (Firebase Auth, NextAuth) | Necessary | none — strictly necessary, never gate |
| Chat / support widget | Analytics or Necessary | depends — if they track behavior, `analytics_storage`; if pure live chat, none |

### 2. Add the tag in GTM with consent settings

1. **Tags → New** → paste the vendor's snippet (Custom HTML) or pick a
   template from the gallery
2. Pick a trigger (usually **All Pages** for trackers, or a custom event)
3. **Advanced Settings → Consent Settings → Require additional consent
   for tag to fire** → add the consent type(s) from the table above

### 3. Test in GTM Preview

- Refuse the category in the banner → tag must appear in **Tags not fired**
- Accept the category → tag must appear in **Tags fired**

If the tag fires either way, you forgot the Consent Settings.

### 4. Update your privacy policy

Add the vendor to your `/privacy` page with at minimum:
- Name + legal entity + country
- Purpose of the cookies
- Data collected
- Retention period of each cookie they set
- Link to the vendor's own privacy policy

This is a GDPR requirement, not just a courtesy — your CMP cannot
substitute for proper disclosure.

### 5. Bump the `version` prop to force re-consent

This is the step most developers forget. Existing users with a saved
choice have only consented to your **previous** vendor list. Bumping the
prop invalidates that choice and re-prompts everyone:

```tsx
// before
<CookieConsent version="2026.05" />

// after adding Zoho Analytics
<CookieConsent version="2026.06" />
```

The package detects the mismatch in `localStorage`, ignores the stored
record, and shows the banner again on the next page load — automatically
for every user. No custom code needed.

Use a date-based scheme (`YYYY.MM`) or a simple integer — anything as
long as you bump it whenever your tracking surface changes.

### 6. Publish the GTM container

**Submit → Publish** in GTM. Until you publish, the new tag and its
consent gating live only in your Preview session. Production users still
see the old version.

### Quick checklist

```
[ ] Tag created in GTM with the right consent_storage requirement
[ ] Verified in Preview: blocked when refused, fired when accepted
[ ] Vendor declared in /privacy (name, purpose, retention, vendor's policy)
[ ] CookieConsent `version` prop bumped (forces re-consent)
[ ] GTM container Submitted + Published
```

## Loading a vendor outside GTM (when you can't use a tag)

If the vendor must be loaded directly from your code (e.g. a Next.js
`<Script>` you'd rather not push through GTM), wait for the user's
choice before loading it:

```tsx
"use client";
import { useEffect, useState } from "react";
import { loadConsent } from "@matejicek-me/consent-manager";

export function ZohoLoader() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const consent = loadConsent("2026.05"); // same version as <CookieConsent />
    if (consent?.choices.analytics) setAllowed(true);

    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.choices?.analytics) setAllowed(true);
      else setAllowed(false);
    };
    window.addEventListener("matejicekme-consent:change", onUpdate);
    return () => window.removeEventListener("matejicekme-consent:change", onUpdate);
  }, []);

  if (!allowed) return null;
  return <script async src="https://js.zoho.eu/.../analytics.js" />;
}
```

Or just pass `onChange` to `<CookieConsent />` and load from there if
your loader is centralized.

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
