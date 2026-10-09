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
     * your own API). Leave empty to send enquiries through the visitor's email app.
     */
    endpoint: string;
    /** Address that receives enquiries when the email fallback is used. */
    emailTo: string;
    /** Subject line prefix for enquiry emails. */
    subject: string;
  };
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
    'Chovu Chovu Brothers Ltd is a large retail shop in Luanshya, Copperbelt Province, Zambia. Visit the shop, or send an enquiry about products and availability.',
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
    email: { label: 'enquiries@example.com', href: 'mailto:enquiries@example.com', placeholder: true },
    whatsapp: { label: '', href: '' },
    hours: { label: '[Opening hours to be confirmed]', href: '', placeholder: true },
  },

  // Left empty until real profiles exist. Empty links are not rendered.
  social: [],

  enquiry: {
    endpoint: '',
    emailTo: 'enquiries@example.com',
    subject: 'Website enquiry',
  },
};
