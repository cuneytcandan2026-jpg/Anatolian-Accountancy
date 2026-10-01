export const site = {
  name: 'Anatolian Accountancy',
  // Registered name and number at Companies House (England and Wales), which
  // UK company law requires the website to show. The registered office is
  // the same as `address` below.
  legalName: 'Anatolian Accountancy Ltd',
  companyNumber: '13439641',
  url: 'https://anatolianaccountancy.com',
  // GA4 web stream for the live domain. Only loaded after cookie consent
  // (see src/lib/analytics.ts).
  gaMeasurementId: 'G-2LPVWTYMC3',
  phoneDisplay: '+44 7541 173722',
  phoneHref: 'tel:+447541173722',
  whatsappNumber: '447541173722',
  email: 'info@anatolianaccountancy.com',
  emailHref: 'mailto:info@anatolianaccountancy.com',
  // Matches the Google Business Profile and the Companies House registered
  // office word for word, since Google cross-checks the two for local search.
  address: {
    line1: 'Office 117B',
    line2: '25 Electric Avenue',
    city: 'Enfield',
    postcode: 'EN3 7GD',
    country: 'GB',
  },
  // As listed on the Google Business Profile (confirmed October 2026). One
  // entry per displayed line; closed on Sundays.
  hours: ['Mon–Fri 9:00–19:00', 'Sat 10:00–17:00'],
  hoursTr: ['Pzt–Cuma 9:00–19:00', 'Cmt 10:00–17:00'],
  // schema.org DayOfWeek values: OpeningHoursSpecification wants full day
  // names, not the "Mo-Fr" shorthand of the plain openingHours property.
  hoursSchema: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '19:00' },
    { days: ['Saturday'], opens: '10:00', closes: '17:00' },
  ],
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

// Search results cut <title> off at roughly 60 characters, so the brand
// suffix is only appended where it still fits; longer article titles stand
// alone rather than being truncated mid-phrase.
export function titleWithBrand(title: string): string {
  const branded = `${title} | ${site.name}`;
  return branded.length <= 60 ? branded : title;
}

// Google Maps "directions" URL (documented Maps URLs format), which opens the
// Maps app on phones, unlike tapping the embedded map on the Contact page.
export const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  `${site.name}, ${site.address.line1}, ${site.address.line2}, ${site.address.city} ${site.address.postcode}`
)}`;

export function whatsappHref(message: string): string {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export const primaryNav: NavItem[] = [
  { label: 'Services', href: '/services/' },
  { label: 'Who We Help', href: '/who-we-help/' },
  { label: 'Insights', href: '/insights/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
];

export const primaryNavTr: NavItem[] = [
  { label: 'Hizmetler', href: '/tr/hizmetler/' },
  { label: 'Kimlere Yardımcı Oluyoruz', href: '/tr/kimlere-yardimci-oluyoruz/' },
  { label: 'Blog', href: '/tr/blog/' },
  { label: 'Hakkımızda', href: '/tr/hakkimizda/' },
  { label: 'İletişim', href: '/tr/iletisim/' },
];

// Maps each EN path to its TR equivalent (and vice versa via the reverse
// lookup below) so the language switcher lands on the matching page
// instead of always bouncing to the home page. Individual blog posts
// aren't listed here (their pairing isn't a fixed 1:1 path) — see
// Header.astro's altHref prop instead.
export const langAlternates: Record<string, string> = {
  '/': '/tr/',
  '/services/': '/tr/hizmetler/',
  '/who-we-help/': '/tr/kimlere-yardimci-oluyoruz/',
  '/insights/': '/tr/blog/',
  '/about/': '/tr/hakkimizda/',
  '/contact/': '/tr/iletisim/',
  '/privacy-policy/': '/tr/gizlilik-politikasi/',
  '/terms/': '/tr/sartlar-ve-kosullar/',
};

export const langAlternatesReverse: Record<string, string> = Object.fromEntries(
  Object.entries(langAlternates).map(([en, tr]) => [tr, en])
);
