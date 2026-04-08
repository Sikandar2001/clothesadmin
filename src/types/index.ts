import { Timestamp } from "firebase/firestore";

export interface Category {
  id: string;
  name: string;
  createdAt: Timestamp;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sizes: string[];
  colors: string[];
  images: string[];
  sku?: string;
  stock: number;
  isFeatured: boolean;
  brand?: string;
  discountPrice?: number | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
