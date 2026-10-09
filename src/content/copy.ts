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
    visualLabel: 'Decorative 3D view of a shop counter photograph, with depth',
  },

  about: {
    eyebrow: 'About Chovu Chovu Brothers Ltd',
    title: 'A shop for everyday shopping in Luanshya.',
    paragraphs: [
      'Chovu Chovu Brothers Ltd is a retail shop in Luanshya, Copperbelt Province, Zambia. It is a place to walk the shop floor, see products up close and choose what you need.',
      'Not sure whether we have something? Send a short enquiry and our team will reply with the details you need before you make the trip.',
    ],
    points: ['Browse the shop floor in person', 'Ask about products before you visit', 'Direct answers from our team'],
    imageCaption: 'Our shop and team',
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
    lead: 'A selection of products from the shop. Sizes, prices and availability are confirmed when you enquire or visit.',
    cta: 'Enquire about this product',
    visualLabel: 'Decorative 3D view of placeholder packaging models on a display base. They are not products for sale.',
    stageNote: 'Placeholder 3D packaging, shown for layout only. These are not products for sale.',
  },

  scale: {
    eyebrow: 'In the shop',
    title: 'Products displayed so you can see, compare and choose.',
    lead: 'Shelves and displays are arranged for browsing, so you can find what you came for and take a closer look before you buy.',
    points: ['Products on open shelves', 'Displays arranged for browsing', 'Help from our team on the shop floor'],
    visualLabel: 'Decorative 3D view of shop shelving with products on display',
  },

  why: {
    eyebrow: 'Why shop with us',
    title: 'Why choose Chovu Chovu Brothers Ltd',
    lead: 'What you can expect when you visit the shop or send us an enquiry.',
    pillars: [
      {
        icon: 'box',
        title: 'A shop to browse',
        text: 'Room to walk the shop floor, with products set out so you can see them and compare at your own pace.',
      },
      {
        icon: 'repeat',
        title: 'Familiar, easy to return to',
        text: 'Come back as often as you need. Your favourite products are easy to find on the shelves.',
      },
      {
        icon: 'quote',
        title: 'Clear enquiries',
        text: 'Send your question once. We reply with the answer and the next steps.',
      },
      {
        icon: 'shield',
        title: 'Friendly, professional service',
        text: 'Courteous help from our team, from your first question to your purchase.',
      },
    ],
  },

  enquiry: {
    eyebrow: 'Enquiry',
    title: 'Send us an enquiry',
    lead: 'Tell us what you are looking for. The product, the quantity and your location help us reply faster.',
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
    successWithEndpoint: 'Thank you. Your enquiry has been sent and we will be in touch.',
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
      email: 'name@example.com',
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
    imageCaption: 'Chovu Chovu Brothers Ltd, Luanshya',
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
