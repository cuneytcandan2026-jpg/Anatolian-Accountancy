// schema.org JSON-LD for BaseLayout. Every indexable page emits one @graph
// in which the same business, website and founder entities keep the same
// @id, so search engines can merge them across pages instead of seeing a
// slightly different "Anatolian Accountancy" on each URL.
//
// Only facts that are visible on the site (or on the Companies House record
// and Google Business Profile it already cites) belong here. In particular:
// - No aggregateRating/review: Google treats ratings a business publishes
//   about itself as self-serving, so they're never eligible for stars.
// - No prices, awards or extra locations.
// - Professional memberships only once confirmed (see `person.memberOf`).
import { site, withBase } from './site';

type Lang = 'en' | 'tr';
type Node = Record<string, unknown>;

const abs = (path: string) => new URL(withBase(path), site.url).toString();

export const ids = {
  business: `${site.url}/#business`,
  website: `${site.url}/#website`,
  person: `${site.url}/about/#bektas-unal`,
};

export const inLanguage = (lang: Lang) => (lang === 'tr' ? 'tr' : 'en-GB');

const languages = [
  { '@type': 'Language', name: 'English', alternateName: 'en' },
  { '@type': 'Language', name: 'Turkish', alternateName: 'tr' },
];

// Where the site says it works: an Enfield office, London, and remote
// support across the UK.
const areaServed = [
  { '@type': 'AdministrativeArea', name: 'London Borough of Enfield' },
  { '@type': 'City', name: 'London' },
  { '@type': 'Country', name: 'United Kingdom' },
];

export function businessNode(): Node {
  return {
    '@type': 'AccountingService',
    '@id': ids.business,
    name: site.name,
    legalName: site.legalName,
    url: abs('/'),
    description:
      'Accounting, tax and business support in English or Turkish for limited companies, sole traders, contractors, landlords and individuals, from an office in Enfield, London, and remotely across the UK.',
    logo: {
      '@type': 'ImageObject',
      url: abs('/android-chrome-512x512.png'),
      width: 512,
      height: 512,
    },
    image: abs('/og-image.jpg'),
    telephone: site.phoneDisplay,
    email: site.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${site.address.line1}, ${site.address.line2}`,
      addressLocality: site.address.city,
      postalCode: site.address.postcode,
      addressCountry: site.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.geo.lat,
      longitude: site.geo.lng,
    },
    hasMap: site.googleReviewsUrl,
    openingHoursSpecification: site.hoursSchema.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    areaServed,
    // Organizations take knowsLanguage; availableLanguage is only valid on
    // the ContactPoint below.
    knowsLanguage: languages,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: site.phoneDisplay,
      email: site.email,
      availableLanguage: ['English', 'Turkish'],
      areaServed: 'GB',
    },
    knowsAbout: [
      'Annual accounts',
      'Bookkeeping',
      'Corporation Tax',
      'Self Assessment',
      'VAT',
      'Payroll',
      'Construction Industry Scheme (CIS)',
      'Making Tax Digital',
      'Company formation',
      'E-commerce accounting',
    ],
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'Companies House company number',
      value: site.companyNumber,
    },
    // The LinkedIn profile is the founder's personal one, so it sits on the
    // Person below rather than here.
    sameAs: [site.social.facebook, site.social.instagram, site.googleReviewsUrl],
    founder: { '@id': ids.person },
  };
}

export function personNode(founderImage?: string): Node {
  return {
    '@type': 'Person',
    '@id': ids.person,
    name: 'Bektaş Ünal',
    jobTitle: 'Founder and accountant',
    url: abs('/about/'),
    ...(founderImage ? { image: founderImage } : {}),
    worksFor: { '@id': ids.business },
    knowsLanguage: languages,
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'Istanbul University' },
    // AAT membership is stated on every page that lists qualifications.
    // İSMMMO is left out until the membership is confirmed (see the SEO
    // audit notes); add it here as another Organization once it is.
    memberOf: {
      '@type': 'Organization',
      name: 'Association of Accounting Technicians (AAT)',
      url: 'https://www.aat.org.uk/',
    },
    sameAs: [site.social.linkedin],
  };
}

export function websiteNode(): Node {
  return {
    '@type': 'WebSite',
    '@id': ids.website,
    url: abs('/'),
    name: site.name,
    inLanguage: ['en-GB', 'tr'],
    publisher: { '@id': ids.business },
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbNode(pageUrl: string, crumbs: Crumb[]): Node {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  };
}

export type ServiceInfo = { id: string; name: string; description: string };

// One Service per section of the Services page, each pointing at its own
// in-page anchor. Service has no inLanguage, so the English/Turkish support
// goes on its ServiceChannel.
export function serviceNodes(services: ServiceInfo[], pagePath: string): Node[] {
  return services.map((s) => ({
    '@type': 'Service',
    '@id': `${abs(pagePath)}#${s.id}-service`,
    name: s.name,
    description: s.description,
    url: `${abs(pagePath)}#${s.id}`,
    provider: { '@id': ids.business },
    areaServed,
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: abs(pagePath),
      availableLanguage: ['English', 'Turkish'],
    },
  }));
}

const months: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  ocak: 1, şubat: 2, mart: 3, nisan: 4, mayıs: 5, haziran: 6,
  temmuz: 7, ağustos: 8, eylül: 9, ekim: 10, kasım: 11, aralık: 12,
};

// "19 August 2026" / "19 Ağustos 2026" -> "2026-08-19". Returns undefined
// for anything it can't read, so a typo drops the date instead of emitting
// a wrong one.
export function displayDateToISO(display?: string): string | undefined {
  const m = display?.trim().match(/^(\d{1,2})\s+(\S+)\s+(\d{4})$/);
  if (!m) return undefined;
  const month = months[m[2].toLocaleLowerCase('tr')] ?? months[m[2].toLowerCase()];
  if (!month) return undefined;
  return `${m[3]}-${String(month).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

export function articleNode(opts: {
  pageUrl: string;
  headline: string;
  description: string;
  lang: Lang;
  lastReviewed?: string;
}): Node {
  const modified = displayDateToISO(opts.lastReviewed);
  return {
    '@type': 'BlogPosting',
    '@id': `${opts.pageUrl}#article`,
    headline: opts.headline,
    description: opts.description,
    inLanguage: inLanguage(opts.lang),
    mainEntityOfPage: { '@id': `${opts.pageUrl}#webpage` },
    image: abs(opts.lang === 'tr' ? '/og-image-tr.jpg' : '/og-image.jpg'),
    // Posts carry no personal byline, so the firm is credited, not a person.
    author: { '@id': ids.business },
    publisher: { '@id': ids.business },
    // The "Last reviewed" date shown at the foot of each post.
    ...(modified ? { dateModified: modified } : {}),
  };
}
