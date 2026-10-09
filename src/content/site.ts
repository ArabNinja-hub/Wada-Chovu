/**
 * SITE CONFIGURATION
 * ==================
 * Business details, navigation, contact channels and feature switches.
 *
 * Values marked "PLACEHOLDER" are not yet confirmed. They are shown on the site with a
 * visible marker so nothing unverified goes live unnoticed. Replace each value with
 * the real detail and remove the placeholder marker by clearing the item's
 * `placeholder` flag.
 */
import type { ImageKey } from './assets.ts';

export interface NavLink {
  label: string;
  href: string;
}

export interface ContactItem {
  /** Visible text. */
  label: string;
  /** Optional link target (tel:, mailto:, https:). Leave empty to show plain text. */
  href: string;
  /** Shows a "Placeholder" marker while true. */
  placeholder?: boolean;
}

export interface SiteConfig {
  /** Public brand name used in the header, titles and copy. */
  name: string;
  /** Registered business name. Used in the footer legal line and structured data. */
  legalName: string;
  /** Town and region of the shop. Shown on the site and in structured data. */
  location: {
    city: string;
    region: string;
    country: string;
    countryCode: string;
  };
  /** Production origin, for example "https://www.example.com". Leave empty until the domain is known. */
  url: string;
  /** Meta description for search engines and link previews. */
  description: string;
  /** Asset key for the logo. */
  logo: ImageKey;
  /** Brand colour for the browser UI (matches --c-forest-900). */
  themeColor: string;
  features: {
    /** Show the animated 3D scenes. When false, the static fallback images are used. */
    threeD: boolean;
    /** Show "Placeholder" markers on unconfirmed content. Set false once the content is final. */
    placeholderMarkers: boolean;
  };
  nav: NavLink[];
  contact: {
    address: ContactItem[];
    phone: ContactItem;
    email: ContactItem;
    whatsapp: ContactItem;
    hours: ContactItem;
  };
  social: NavLink[];
  enquiry: {
    /**
     * HTTPS endpoint that accepts a JSON POST (for example a form-handling service or
     * your own API). Takes priority over `emailTo` when it is a valid https:// URL.
     */
    endpoint: string;
    /**
     * Real enquiry inbox, used when no endpoint is set: the visitor's email app opens with
     * the enquiry filled in. Leave empty until the shop confirms its address. Placeholder
     * domains (example.com and similar) are rejected, so enquiries cannot go there.
     */
    emailTo: string;
    /** Subject line prefix for enquiry emails. */
    subject: string;
  };
}

/** Domains reserved for documentation and examples. Never a real enquiry inbox. */
const RESERVED_EMAIL_DOMAINS = ['example.com', 'example.net', 'example.org'];
const RESERVED_EMAIL_SUFFIXES = ['.test', '.invalid', '.localhost', '.example'];

/** True when a domain is reserved for examples and tests (never a real destination). */
function isReservedDomain(domain: string): boolean {
  const d = domain.toLowerCase();
  if (RESERVED_EMAIL_DOMAINS.some((r) => d === r || d.endsWith(`.${r}`))) return true;
  return RESERVED_EMAIL_SUFFIXES.some((suffix) => d.endsWith(suffix));
}

/** True for a well-formed address on a real (not reserved) domain. */
export function isUsableEmail(address: string): boolean {
  const match = /^[^\s@]+@([^\s@]+\.[^\s@]{2,})$/.exec(address.trim());
  return Boolean(match) && !isReservedDomain(match![1]);
}

/** True for an https:// endpoint whose host is not a reserved example domain. */
export function isUsableEndpoint(endpoint: string): boolean {
  try {
    const url = new URL(endpoint.trim());
    return url.protocol === 'https:' && !isReservedDomain(url.hostname);
  } catch {
    return false;
  }
}

export type EnquiryChannel = 'endpoint' | 'email' | 'unconfigured';

/**
 * Where enquiries go. `unconfigured` means nothing is sent anywhere: the form is disabled
 * and visitors see a notice. The site never falls back to a placeholder address.
 */
export function enquiryChannel(config: SiteConfig['enquiry'] = site.enquiry): EnquiryChannel {
  if (isUsableEndpoint(config.endpoint)) return 'endpoint';
  if (isUsableEmail(config.emailTo)) return 'email';
  return 'unconfigured';
}

export const site: SiteConfig = {
  name: 'Chovu Chovu Brothers Ltd',
  legalName: 'Chovu Chovu Brothers Ltd',
  location: {
    city: 'Luanshya',
    region: 'Copperbelt Province',
    country: 'Zambia',
    countryCode: 'ZM',
  },
  url: '',
  description:
    'Chovu Chovu Brothers Ltd is a retail shop in Luanshya, Copperbelt Province, Zambia. Visit the shop, or send an enquiry about products and availability.',
  logo: 'brand.logo',
  themeColor: '#0a2413',

  features: {
    threeD: true,
    placeholderMarkers: true,
  },

  nav: [
    { label: 'About', href: '#about' },
    { label: 'Categories', href: '#categories' },
    { label: 'Featured', href: '#featured' },
    { label: 'Why us', href: '#why' },
    { label: 'Visit', href: '#location' },
  ],

  contact: {
    address: [
      { label: '[Street address]', href: '', placeholder: true },
      { label: 'Luanshya, Copperbelt Province', href: '' },
      { label: 'Zambia', href: '' },
    ],
    phone: { label: '+00 000 000 0000', href: '', placeholder: true },
    // No live link until the real enquiry address is confirmed.
    email: { label: '[Enquiry email to be confirmed]', href: '', placeholder: true },
    whatsapp: { label: '', href: '' },
    hours: { label: '[Opening hours to be confirmed]', href: '', placeholder: true },
  },

  // Left empty until real profiles exist. Empty links are not rendered.
  social: [],

  // Both are empty until the shop confirms how enquiries should be received. Until one is set,
  // the enquiry form is disabled and nothing is sent.
  enquiry: {
    endpoint: '',
    emailTo: '',
    subject: 'Website enquiry',
  },
};
