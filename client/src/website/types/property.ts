export interface Property {
  _id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  category: string;
  categoryEn: string;
  type: string;
  price: number;
  city: string;
  cityEn: string;
  area: number | null;
  rooms: number | null;
  bathrooms: number | null;
  address: string;
  addressEn: string;
  images: string[];
  features: string[];
  featuresEn: string[];
  isFeatured: boolean;
  status: string;
  createdAt: string;
}