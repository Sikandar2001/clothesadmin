import { Timestamp } from "firebase/firestore";

export interface Category {
  id: string;
  name: string;
  image: string; // Made required
  createdAt: Timestamp;
}

export interface SubCategory {
  id: string;
  name: string;
  image: string; // Added required image
  categoryId: string;
  createdAt: Timestamp;
}

export interface ChildSubCategory {
  id: string;
  name: string;
  image: string;
  subCategoryId: string;
  createdAt: Timestamp;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subCategory: string; // Added subCategory
  childSubCategory?: string; // Added childSubCategory
  sizes: string[];
  colors: string[];
  images: string[];
  sku?: string;
  stock: number;
  isFeatured: boolean;
  brand?: string;
  discountPrice?: number | null;
  returnPolicy?: string; // New field
  deliveryInfo?: string; // New field
  careInstructions?: string; // New field (common for clothing)
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Order {
  id: string;
  createdAt: Timestamp;
  image: string;
  item: string;
  paymentMethod: string;
  price: string;
  quantity: number;
  size: string;
  status: string;
  totalAmount: number;
  userEmail: string;
  userId: string;
}
