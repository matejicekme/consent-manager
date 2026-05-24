import type { ConsentLocale, ConsentMessages } from "./types.js";

const FR: ConsentMessages = {
  bannerTitle: "Cookies",
  bannerBody:
    "On utilise des cookies pour mesurer l'audience et améliorer le site. Tu peux tout accepter, tout refuser, ou choisir.",
  acceptAll: "Tout accepter",
  rejectAll: "Tout refuser",
  customize: "Personnaliser",
  preferencesTitle: "Préférences cookies",
  preferencesIntro:
    "Choisis les catégories que tu autorises. Les cookies strictement nécessaires sont toujours actifs car le site ne fonctionne pas sans eux.",
  necessaryLabel: "Strictement nécessaires",
  necessaryDescription:
    "Sécurité, session, panier, authentification. Toujours actifs.",
  analyticsLabel: "Statistiques",
  analyticsDescription:
    "Nous aide à comprendre comment le site est utilisé (audience anonymisée).",
  advertisingLabel: "Publicité",
  advertisingDescription:
    "Permet de mesurer l'efficacité des publicités et de personnaliser les annonces.",
  save: "Enregistrer",
  back: "Retour",
  privacyLink: "Politique de confidentialité",
};

const EN: ConsentMessages = {
  bannerTitle: "Cookies",
  bannerBody:
    "We use cookies to measure traffic and improve the site. You can accept all, reject all, or choose.",
  acceptAll: "Accept all",
  rejectAll: "Reject all",
  customize: "Customize",
  preferencesTitle: "Cookie preferences",
  preferencesIntro:
    "Pick the categories you allow. Strictly necessary cookies are always active because the site cannot work without them.",
  necessaryLabel: "Strictly necessary",
  necessaryDescription:
    "Security, session, cart, authentication. Always active.",
  analyticsLabel: "Analytics",
  analyticsDescription:
    "Helps us understand how the site is used (anonymized audience).",
  advertisingLabel: "Advertising",
  advertisingDescription:
    "Measures ad performance and personalizes ads.",
  save: "Save",
  back: "Back",
  privacyLink: "Privacy policy",
};

const IT: ConsentMessages = {
  bannerTitle: "Cookie",
  bannerBody:
    "Usiamo i cookie per misurare il pubblico e migliorare il sito. Puoi accettare tutto, rifiutare tutto o scegliere.",
  acceptAll: "Accetta tutto",
  rejectAll: "Rifiuta tutto",
  customize: "Personalizza",
  preferencesTitle: "Preferenze cookie",
  preferencesIntro:
    "Scegli le categorie che autorizzi. I cookie strettamente necessari sono sempre attivi perché il sito non funziona senza di essi.",
  necessaryLabel: "Strettamente necessari",
  necessaryDescription:
    "Sicurezza, sessione, carrello, autenticazione. Sempre attivi.",
  analyticsLabel: "Statistiche",
  analyticsDescription:
    "Ci aiuta a capire come viene utilizzato il sito (audience anonima).",
  advertisingLabel: "Pubblicità",
  advertisingDescription:
    "Misura l'efficacia degli annunci e personalizza la pubblicità.",
  save: "Salva",
  back: "Indietro",
  privacyLink: "Informativa sulla privacy",
};

const DE: ConsentMessages = {
  bannerTitle: "Cookies",
  bannerBody:
    "Wir verwenden Cookies, um die Reichweite zu messen und die Website zu verbessern. Du kannst alles akzeptieren, alles ablehnen oder auswählen.",
  acceptAll: "Alle akzeptieren",
  rejectAll: "Alle ablehnen",
  customize: "Anpassen",
  preferencesTitle: "Cookie-Einstellungen",
  preferencesIntro:
    "Wähle die Kategorien, die du erlaubst. Strikt notwendige Cookies sind immer aktiv, weil die Website ohne sie nicht funktioniert.",
  necessaryLabel: "Strikt notwendig",
  necessaryDescription:
    "Sicherheit, Sitzung, Warenkorb, Authentifizierung. Immer aktiv.",
  analyticsLabel: "Statistiken",
  analyticsDescription:
    "Hilft uns zu verstehen, wie die Website genutzt wird (anonymisierte Reichweite).",
  advertisingLabel: "Werbung",
  advertisingDescription:
    "Misst die Wirksamkeit von Anzeigen und personalisiert sie.",
  save: "Speichern",
  back: "Zurück",
  privacyLink: "Datenschutzerklärung",
};

const ES: ConsentMessages = {
  bannerTitle: "Cookies",
  bannerBody:
    "Usamos cookies para medir la audiencia y mejorar el sitio. Puedes aceptar todo, rechazar todo o elegir.",
  acceptAll: "Aceptar todo",
  rejectAll: "Rechazar todo",
  customize: "Personalizar",
  preferencesTitle: "Preferencias de cookies",
  preferencesIntro:
    "Elige las categorías que autorizas. Las cookies estrictamente necesarias siempre están activas porque el sitio no funciona sin ellas.",
  necessaryLabel: "Estrictamente necesarias",
  necessaryDescription:
    "Seguridad, sesión, carrito, autenticación. Siempre activas.",
  analyticsLabel: "Estadísticas",
  analyticsDescription:
    "Nos ayuda a entender cómo se usa el sitio (audiencia anónima).",
  advertisingLabel: "Publicidad",
  advertisingDescription:
    "Mide la eficacia de los anuncios y los personaliza.",
  save: "Guardar",
  back: "Atrás",
  privacyLink: "Política de privacidad",
};

const TRANSLATIONS: Record<ConsentLocale, ConsentMessages> = {
  fr: FR,
  en: EN,
  it: IT,
  de: DE,
  es: ES,
};

export function getMessages(
  locale: ConsentLocale,
  overrides?: Partial<ConsentMessages>,
): ConsentMessages {
  const base = TRANSLATIONS[locale] ?? TRANSLATIONS.en;
  return overrides ? { ...base, ...overrides } : base;
}
