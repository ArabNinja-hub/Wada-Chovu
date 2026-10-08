/**
 * PRODUCTS
 * ========
 * Category and featured product data.
 *
 * The real product names, pack sizes and descriptions have not been provided yet, so
 * every entry below is a clearly marked placeholder. Replace the text, point `image` at
 * a real asset key from assets.ts, and set `placeholder: false` when the entry is final.
 *
 * To add a category or product, copy an entry, give it a unique `id`, and add an
 * image asset for it in assets.ts. The grids are responsive and take any count.
 */
import type { ImageKey } from './assets.ts';

export interface ProductCategory {
  id: string;
  name: string;
  summary: string;
  image: ImageKey;
  /** Shows a "Placeholder" marker while true. */
  placeholder?: boolean;
}

export interface FeaturedProduct {
  id: string;
  name: string;
  packSize: string;
  summary: string;
  image: ImageKey;
  placeholder?: boolean;
}

export const categories: ProductCategory[] = [
  {
    id: 'category-one',
    name: 'Category one',
    summary: 'Placeholder: describe this product range in one or two sentences.',
    image: 'category.one',
    placeholder: true,
  },
  {
    id: 'category-two',
    name: 'Category two',
    summary: 'Placeholder: describe this product range in one or two sentences.',
    image: 'category.two',
    placeholder: true,
  },
  {
    id: 'category-three',
    name: 'Category three',
    summary: 'Placeholder: describe this product range in one or two sentences.',
    image: 'category.three',
    placeholder: true,
  },
  {
    id: 'category-four',
    name: 'Category four',
    summary: 'Placeholder: describe this product range in one or two sentences.',
    image: 'category.four',
    placeholder: true,
  },
];

export const featuredProducts: FeaturedProduct[] = [
  {
    id: 'featured-one',
    name: 'Featured product one',
    packSize: 'Pack size: to be confirmed',
    summary: 'Placeholder: short product description.',
    image: 'product.one',
    placeholder: true,
  },
  {
    id: 'featured-two',
    name: 'Featured product two',
    packSize: 'Pack size: to be confirmed',
    summary: 'Placeholder: short product description.',
    image: 'product.two',
    placeholder: true,
  },
  {
    id: 'featured-three',
    name: 'Featured product three',
    packSize: 'Pack size: to be confirmed',
    summary: 'Placeholder: short product description.',
    image: 'product.three',
    placeholder: true,
  },
  {
    id: 'featured-four',
    name: 'Featured product four',
    packSize: 'Pack size: to be confirmed',
    summary: 'Placeholder: short product description.',
    image: 'product.four',
    placeholder: true,
  },
];
