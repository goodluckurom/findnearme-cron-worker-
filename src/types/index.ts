import { string } from "@tensorflow/tfjs";

export interface Product {
  id: string;
  sellerid: string;
  name: string;
  description?: string;
  price: number;
  condition?: string;
  brand?: string;
  category?: string;
  images?: string[];
  maincategory?: string[];
  tags?: string[];
  location?: string;
  latitude?: number;
  longitude?: number;
  createdat?: Date;
  updatedat?: Date;
}

export interface image {
  id: string;
  imageurl: string;
  userid: string;
  recommendations: string[];
  createdat?: Date;
}
