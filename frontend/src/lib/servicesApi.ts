export type PublicService = {
  id: string;
  vendorId: string;
  sname: string;
  marginPrice: number;
  sellingPrice: number;
  category: string;
  city: string;
  description: string;
  poster: string;
};

export const getPublicServices = async () => {
  const response = await fetch("/api/services", {
    credentials: "include",
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const payload = data as { error?: string; message?: string } | null;
    throw new Error(payload?.error || payload?.message || "Failed to load services");
  }

  return (data as { services: PublicService[] }).services;
};

export const formatServicePrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const getServiceDiscountPercent = (
  marginPrice: number,
  sellingPrice: number,
) => {
  if (marginPrice <= 0 || sellingPrice >= marginPrice) return 0;
  return Math.round(((marginPrice - sellingPrice) / marginPrice) * 100);
};
