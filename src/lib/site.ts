export const site = {
  name: 'Anatolian Accountancy',
  legalName: 'Anadolu Muhasebecilik ve Mali Müşavirlik Ltd (Anatolian Accountancy Ltd)',
  url: 'https://anatolianaccountancy.com',
  phoneDisplay: '+44 7541 173722',
  phoneHref: 'tel:+447541173722',
  whatsappNumber: '447541173722',
  email: 'info@anatolianaccountancy.com',
  emailHref: 'mailto:info@anatolianaccountancy.com',
  address: {
    line1: 'Office 117B, 25 Innova Business Park',
    line2: 'Electric Avenue Vision',
    city: 'Enfield',
    postcode: 'EN3 7GD',
    country: 'GB',
  },
  hours: 'Mon–Fri, 9:00–18:00',
  hoursTr: 'Pzt–Cuma, 9:00–18:00',
  hoursSchema: [{ days: ['Mo', 'Tu', 'We', 'Th', 'Fr'], opens: '09:00', closes: '18:00' }],
  geo: { lat: 51.6742, lng: -0.0217 },
  googleReviewsUrl:
    'https://www.google.com/maps/place/Anatolian+Accountancy/@51.6741991,-0.0216902,17z/data=!3m1!4b1!4m6!3m5!1s0x48761d42ba7d16cb:0x5b720422b04e8d0b!8m2!3d51.6741991!4d-0.0216902',
  // TODO: placeholder rating/count — replace with the real Google Business
  // Profile figures before launch (visible in the homepage testimonials badge).
  googleRating: 4.9,
  googleReviewCount: 24,
  social: {
    facebook:
      'https://www.facebook.com/people/Anatolian-Accountancy-Anadolu-Muhasebecilik/pfbid0oMowgC2gi1XbKLiNpPA5231NRfGXvQYQsp9TP7auNS4tVs1LBKKY6QkVPtLjQjw3l/',
    instagram: 'https://www.instagram.com/anatolianaccountancy/',
    linkedin: 'https://www.linkedin.com/in/bektas-unal-a62404225/',
  },
} as const;

export type NavItem = {
  label: string;
  href: string;
};

// All hrefs in this file (and in content collection frontmatter) are root-
// relative, written for the real domain. withBase()/stripBase() translate
// between that and Astro.url.pathname, which includes the configured `base`
// (e.g. the /Anatolian-Accountancy prefix on the GitHub Pages preview build).
const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;

export function withBase(path: string): string {
  return path === '/' ? base : base + path.replace(/^\//, '');
}

export function stripBase(pathname: string): string {
  if (base === '/') return pathname;
  if (pathname === base.slice(0, -1)) return '/';
  if (!pathname.startsWith(base)) return pathname;
  return '/' + pathname.slice(base.length);
}

export function whatsappHref(message: string): string {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const primaryNav: NavItem[] = [
  { label: 'Services', href: '/services/' },
  { label: 'Who We Help', href: '/who-we-help/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
];

export const primaryNavTr: NavItem[] = [
  { label: 'Hizmetler', href: '/tr/hizmetler/' },
  { label: 'Kimlere Yardımcı Oluyoruz', href: '/tr/kimlere-yardimci-oluyoruz/' },
  { label: 'Hakkımızda', href: '/tr/hakkimizda/' },
  { label: 'İletişim', href: '/tr/iletisim/' },
];

// Maps each EN path to its TR equivalent (and vice versa via the reverse
// lookup below) so the language switcher lands on the matching page
// instead of always bouncing to the home page.
export const langAlternates: Record<string, string> = {
  '/': '/tr/',
  '/services/': '/tr/hizmetler/',
  '/who-we-help/': '/tr/kimlere-yardimci-oluyoruz/',
  '/about/': '/tr/hakkimizda/',
  '/contact/': '/tr/iletisim/',
};

export const langAlternatesReverse: Record<string, string> = Object.fromEntries(
  Object.entries(langAlternates).map(([en, tr]) => [tr, en])
);
