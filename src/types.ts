export type ConsentLocale = "fr" | "en" | "it" | "de" | "es";

export type ConsentCategory = "necessary" | "analytics" | "advertising";

export type ConsentChoices = {
  necessary: true;
  analytics: boolean;
  advertising: boolean;
};

export type ConsentRecord = {
  version: string;
  timestamp: number;
  choices: ConsentChoices;
};

export type ConsentMessages = {
  bannerTitle: string;
  bannerBody: string;
  acceptAll: string;
  rejectAll: string;
  customize: string;
  preferencesTitle: string;
  preferencesIntro: string;
  necessaryLabel: string;
  necessaryDescription: string;
  analyticsLabel: string;
  analyticsDescription: string;
  advertisingLabel: string;
  advertisingDescription: string;
  save: string;
  back: string;
  privacyLink: string;
  poweredBy?: string;
};
