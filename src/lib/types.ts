export interface AdminUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  sessionVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  stock: number;
  status: string;
  isNew: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  isOnSale: boolean;
  seoTitle: string;
  seoDescription: string;
  categoryId: string;
  brandId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
  productId: string;
}

export interface Banner {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  ctaLabel: string;
  ctaHref: string;
  theme: string;
  position: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  author: string;
  city: string;
  rating: number;
  text: string;
  isApproved: boolean;
  productId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteSettings {
  id: string;
  storeName: string;
  tagline: string;
  announcement: string;
  telegramUsername: string;
  channelUsername: string;
  heroEyebrow: string;
  heroTitle: string;
  heroText: string;
  founderTitle: string;
  founderText: string;
  seoTitle: string;
  seoDescription: string;
  footerText: string;
  updatedAt: Date;
}
