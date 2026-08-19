// Display labels for the blog collection's `category` enum (content.config.ts),
// keyed the same way on both languages so callers can do categoryLabels[cat][lang].
export const categoryLabels: Record<string, { en: string; tr: string }> = {
  cis: { en: 'CIS', tr: 'CIS' },
  'business-structure': { en: 'Business Structure', tr: 'İşletme Yapısı' },
  vat: { en: 'VAT', tr: 'KDV' },
  tax: { en: 'Tax', tr: 'Vergi' },
  mtd: { en: 'Making Tax Digital', tr: 'Dijital Vergi (MTD)' },
  general: { en: 'General', tr: 'Genel' },
};
