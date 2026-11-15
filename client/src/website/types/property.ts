export interface Property {
  _id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  category:string;
  categoryEn: string;
  type: string;
  price: number | null; // سعر البيع بالدولار الأمريكي (USD) — null = "السعر عند الطلب". عقار الإيجار = null
  // أسعار الإيجار بالدولار — اللي بيتعبّى بس بيظهر (عقار البيع كلها null)
  rentPrices?: {
    daily: number | null;
    weekly: number | null;
    monthly: number | null;
    yearly: number | null;
  };
  furnished?: "furnished" | "unfurnished" | null; // null = غير محدد
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
  videoUrl?: string;
  // آخر إجراء تم على العقار (إضافة / بيع / تحديث)
  action?: {
    type: "added" | "sold" | "updated";
    by: string;
    at: string;
  };
  createdAt: string;
  image: string;

}