/**
 * COPY
 * ====
 * All visitor-facing wording lives here. The tone is that of a retail shop
 * in Luanshya: customers come in to browse and buy. The copy makes no claims about years
 * trading, product ranges, prices, promotions, delivery, opening hours, reviews or customer
 * numbers. Add those only once they are confirmed.
 */

export const copy = {
  header: {
    enquireCta: 'Send an enquiry',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    menuLabel: 'Menu',
    skipToContent: 'Skip to content',
  },

  hero: {
    eyebrow: 'Retail shop in Luanshya',
    title: 'Welcome to Chovu Chovu Brothers Ltd.',
    lead: 'A retail shop in Luanshya, Copperbelt Province, where customers come to browse, compare and buy. Ask us about a product before you visit.',
    primaryCta: 'Send an enquiry',
    secondaryCta: 'Browse categories',
    points: ['Retail shop in Luanshya', 'Shop in person in Luanshya', 'Enquire before you visit'],
    visualLabel: 'Decorative 3D view of a stand-in photograph of a shop counter, with depth. It is not a photograph of the shop.',
  },

  about: {
    eyebrow: 'About Chovu Chovu Brothers Ltd',
    title: 'A shop for everyday shopping in Luanshya.',
    paragraphs: [
      'Chovu Chovu Brothers Ltd is a retail shop in Luanshya, Copperbelt Province, Zambia. It is a place to walk the shop floor, look at what is on display and ask about anything you need.',
      'Not sure whether we have something? Send a short enquiry before you make the trip.',
    ],
    points: ['Browse the shop in person', 'Ask about products before you visit', 'Contact details are listed under Visit'],
  },

  categories: {
    eyebrow: 'Shop by category',
    title: 'Browse our categories',
    lead: 'Product categories are being confirmed. Product names, sizes and availability will appear here once the details are final.',
    cta: 'Ask about this category',
  },

  featured: {
    eyebrow: 'Featured products',
    title: 'Featured products',
    lead: 'Featured products will be listed here once they are confirmed. Ask about availability, sizes and prices before you visit.',
    cta: 'Enquire about this product',
    visualLabel: 'Decorative 3D view of placeholder packaging models on a display base. They are not products for sale.',
    stageNote: 'Placeholder 3D packaging, shown for layout only. These are not products for sale.',
  },

  scale: {
    eyebrow: 'In the shop',
    title: 'Look around the shop before you choose.',
    lead: 'Walk the shop floor, take a closer look and ask us about anything you are unsure of before you buy.',
    points: ['Browse the shop floor in person', 'Ask about a product before you visit', 'Contact us before you make the trip'],
    visualLabel: 'Decorative 3D view of a stand-in photograph of stacked canned goods. It is not a photograph of the shop.',
  },

  why: {
    eyebrow: 'Why shop with us',
    title: 'Why choose Chovu Chovu Brothers Ltd',
    lead: 'What you can expect when you visit the shop or send us an enquiry.',
    pillars: [
      {
        icon: 'box',
        title: 'A shop to browse',
        text: 'Room to walk the shop floor and look at what is on display, at your own pace.',
      },
      {
        icon: 'repeat',
        title: 'Visit at your own pace',
        text: 'Come in when it suits you. Ask us about anything you cannot find.',
      },
      {
        icon: 'quote',
        title: 'Clear enquiries',
        text: 'Send one enquiry with the details we need: the product, the quantity and your location.',
      },
      {
        icon: 'shield',
        title: 'Ask before you visit',
        text: 'Contact us with questions about a product before you make the trip.',
      },
    ],
  },

  enquiry: {
    eyebrow: 'Enquiry',
    title: 'Send us an enquiry',
    lead: 'Tell us what you are looking for. The product, the quantity and your location help us respond to your enquiry.',
    includeTitle: 'What to include',
    include: [
      'The product or category you are looking for',
      'An approximate quantity, if you need more than one',
      'Your name and the town or area you are in',
    ],
    privacy: 'We only use your details to respond to your enquiry.',
    submit: 'Send enquiry',
    sending: 'Sending…',
    productPlaceholderOption: 'Not sure yet',
    successWithEndpoint: 'Thank you. Your enquiry has been sent.',
    notConnected:
      'Online enquiries are not connected yet. This form is disabled until the shop confirms how enquiries are received, so nothing you type here is sent.',
    successWithEmail:
      'Your email app should open with the enquiry filled in. If it does not, email us directly at the address in the contact details.',
    errorGeneric: 'Something went wrong while sending your enquiry. Please try again or contact us directly.',
    errorValidation: 'Please check the highlighted fields.',
    fields: {
      name: 'Full name',
      company: 'Company name (optional)',
      email: 'Email address',
      phone: 'Phone number (optional)',
      product: 'Product or category',
      quantity: 'Approximate quantity',
      location: 'Your location (optional)',
      message: 'Message',
    },
    placeholders: {
      name: 'Your name',
      company: 'Company name, if applicable',
      email: 'Your email address',
      phone: 'Phone or WhatsApp number',
      quantity: 'For example: 2 units',
      location: 'Town or area',
      message: 'Tell us what you are looking for and anything we should know.',
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
    eyebrow: 'Visit us',
    title: 'Find us in Luanshya',
    lead: 'Visit the shop in Luanshya, Copperbelt Province, or contact us for enquiries.',
    labels: {
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      whatsapp: 'WhatsApp',
      hours: 'Opening hours',
    },
  },

  footer: {
    tagline: 'A retail shop in Luanshya, Copperbelt Province, Zambia.',
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
