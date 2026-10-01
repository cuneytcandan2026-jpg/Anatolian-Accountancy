import { site } from './site';

// Google Analytics 4, loaded only after the visitor accepts analytics cookies
// in CookieBanner.astro (UK PECR needs consent before non-essential cookies).
// Until then gtag.js isn't requested at all, so nothing reaches Google.
//
// The choice lives in localStorage, which counts as strictly necessary
// storage. State is kept on window/localStorage, not in module variables,
// because each component's <script> may be bundled separately.

const CONSENT_KEY = 'aa-analytics-consent';
const GA_ID = site.gaMeasurementId;
const GA_SRC = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;

type Consent = 'granted' | 'denied';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean;
  }
}

// Only the real domain reports, so local dev, the GitHub Pages preview and
// Hostinger's temporary domain never skew the stats.
const isLiveSite = () => location.hostname === new URL(site.url).hostname;

const isLoaded = () => document.querySelector(`script[src="${GA_SRC}"]`) !== null;

export function getConsent(): Consent | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

function ensureGtag() {
  window.dataLayer = window.dataLayer || [];
  // gtag.js reads each queued command as an Arguments object, not an array.
  window.gtag =
    window.gtag ||
    function () {
      window.dataLayer.push(arguments);
    };
}

export function startAnalytics() {
  if (!isLiveSite() || getConsent() !== 'granted') return;
  ensureGtag();
  window[`ga-disable-${GA_ID}`] = false;
  if (isLoaded()) {
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    return;
  }
  // No ads on this site, so the advertising signals stay off for good.
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted',
  });
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);
  const script = document.createElement('script');
  script.async = true;
  script.src = GA_SRC;
  document.head.appendChild(script);
}

// GA4 sets _ga and _ga_<stream id> on the bare domain (".example.com").
function clearAnalyticsCookies() {
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim();
    if (name !== '_ga' && !name.startsWith('_ga_')) continue;
    for (const domain of ['', `; domain=.${location.hostname}`]) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain}`;
    }
  }
}

export function setConsent(consent: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, consent);
  } catch {
    // Storage blocked: the choice only lasts for this page view.
  }
  if (consent === 'granted') {
    startAnalytics();
    return;
  }
  // Withdrawing consent: Google's documented opt-out flag stops an already
  // loaded gtag.js from sending anything more.
  if (isLoaded()) {
    window[`ga-disable-${GA_ID}`] = true;
    window.gtag('consent', 'update', { analytics_storage: 'denied' });
  }
  clearAnalyticsCookies();
}

// GA4's recommended event for an enquiry. It counts as a conversion once
// it's marked as a key event in GA4's Admin.
export function trackLead() {
  if (isLoaded() && getConsent() === 'granted') {
    window.gtag('event', 'generate_lead');
  }
}
