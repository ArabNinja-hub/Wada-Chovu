/**
 * COPY
 * ====
 * All visitor-facing wording lives here. The copy is positioning and process language.
 * It makes no claims about years trading, customer numbers, locations, certifications,
 * prices, delivery times or capacity. Add those only once they are confirmed.
 */

export const copy = {
  header: {
    enquireCta: 'Wholesale enquiry',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    menuLabel: 'Menu',
    skipToContent: 'Skip to content',
  },

  hero: {
    eyebrow: 'Wholesale & bulk supply',
    title: 'Wholesale supply, built around your volume.',
    lead: 'Wada Chovu Wholesale supplies businesses that buy in bulk. Tell us what you need and we will reply with the next steps.',
    primaryCta: 'Request a wholesale quote',
    secondaryCta: 'Browse categories',
    points: ['Bulk and trade orders', 'Repeat-order planning', 'Clear, direct enquiries'],
    visualLabel: 'Decorative 3D view of wholesale cartons, pallet and containers',
  },

  about: {
    eyebrow: 'About Wada Chovu Wholesale',
    title: 'A wholesale partner for businesses that buy in volume.',
    paragraphs: [
      'Wada Chovu Wholesale focuses on wholesale: bulk orders, trade customers and the repeat supply that keeps a business running.',
      'Whether you are restocking on a schedule or placing a larger one-off order, start with a short enquiry and we will take it from there.',
    ],
    points: ['Trade and bulk orders', 'Repeat supply planning', 'Enquiries answered directly'],
    imageCaption: 'Warehouse and team',
  },

  categories: {
    eyebrow: 'Product categories',
    title: 'Browse by category',
    lead: 'Choose the range that fits your business. Pack sizes, availability and pricing are confirmed when you enquire.',
    cta: 'Enquire about this range',
  },

  featured: {
    eyebrow: 'Featured products',
    title: 'Featured lines',
    lead: 'A selection of lines available on wholesale enquiry. Pack sizes and availability are confirmed on request.',
    cta: 'Request a quote',
    visualLabel: 'Decorative 3D view of tins and sacks on a display base',
  },

  scale: {
    eyebrow: 'Scale & distribution',
    title: 'Built for volume, from first order to repeat orders.',
    lead: 'Stock is planned around bulk quantities and recurring supply, so growing businesses can plan ahead with confidence.',
    points: ['Bulk-ready ordering', 'Recurring supply planning', 'Organised stock handling'],
    visualLabel: 'Decorative 3D view of a warehouse rack with cartons',
  },

  why: {
    eyebrow: 'Why choose us',
    title: 'Why choose Wada Chovu Wholesale',
    lead: 'What you can expect when you work with a supplier built for trade customers.',
    pillars: [
      {
        icon: 'box',
        title: 'Built for bulk',
        text: 'Our focus is wholesale quantities, so every enquiry is handled with trade volumes in mind.',
      },
      {
        icon: 'repeat',
        title: 'Dependable repeat supply',
        text: 'We plan around ongoing orders so that restocking stays simple and predictable.',
      },
      {
        icon: 'quote',
        title: 'Clear enquiries',
        text: 'Send your requirements once. We reply with clear next steps.',
      },
      {
        icon: 'shield',
        title: 'Professional service',
        text: 'Direct communication and careful handling from your first enquiry to a completed order.',
      },
    ],
  },

  enquiry: {
    eyebrow: 'Wholesale enquiry',
    title: 'Start a wholesale enquiry',
    lead: 'Tell us what you need. Product, approximate quantity and location help us respond faster.',
    includeTitle: 'What to include',
    include: [
      'The product or category you need',
      'An approximate quantity or pack count',
      'Your business name and location',
    ],
    privacy: 'We only use your details to respond to your enquiry.',
    submit: 'Send enquiry',
    sending: 'Sending…',
    productPlaceholderOption: 'Not sure yet',
    successWithEndpoint: 'Thank you. Your enquiry has been sent and we will be in touch.',
    successWithEmail:
      'Your email app should open with the enquiry filled in. If it does not, email us directly at the address in the contact details.',
    errorGeneric: 'Something went wrong while sending your enquiry. Please try again or contact us directly.',
    errorValidation: 'Please check the highlighted fields.',
    fields: {
      name: 'Full name',
      company: 'Company or business name',
      email: 'Email address',
      phone: 'Phone number (optional)',
      product: 'Product or category',
      quantity: 'Approximate quantity',
      location: 'Your location (optional)',
      message: 'Message',
    },
    placeholders: {
      name: 'Your name',
      company: 'Business name',
      email: 'name@business.com',
      phone: 'Phone or WhatsApp number',
      quantity: 'For example: 10 cartons',
      location: 'Town or city',
      message: 'Tell us what you need, how often you order, and any timing.',
    },
    errors: {
      required: 'This field is required.',
      name: 'Please enter your name.',
      email: 'Enter a valid email address.',
      phone: 'Enter a valid phone number, or leave this blank.',
      tooShort: 'Please add a little more detail.',
    },
  },

  location: {
    eyebrow: 'Location & contact',
    title: 'Find us',
    lead: 'Contact details for enquiries and visits.',
    labels: {
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      whatsapp: 'WhatsApp',
      hours: 'Opening hours',
    },
    imageCaption: 'Business location',
  },

  footer: {
    tagline: 'Wholesale supply for businesses that buy in volume.',
    navTitle: 'Explore',
    contactTitle: 'Contact',
    socialTitle: 'Follow',
    backToTop: 'Back to top',
    rights: 'All rights reserved.',
  },

  common: {
    placeholderBadge: 'Placeholder',
    placeholderBadgeLong: 'Placeholder content: replace before launch',
  },
} as const;
