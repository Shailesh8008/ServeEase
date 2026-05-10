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

export type BookingStatus =
  | "Booked"
  | "Confirmed"
  | "Delivered"
  | "Cancelled";

export type CustomerBooking = {
  id: string;
  status: BookingStatus;
  service: PublicService | null;
  createdAt?: string;
  updatedAt?: string;
};

const parseApiResponse = async <T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> => {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const payload = data as { error?: string; message?: string } | null;
    throw new Error(payload?.error || payload?.message || fallbackMessage);
  }

  return data as T;
};

export const getPublicServices = async () => {
  const response = await fetch("/api/services", {
    credentials: "include",
  });
  const data = await parseApiResponse<{ services: PublicService[] }>(
    response,
    "Failed to load services",
  );

  return data.services;
};

export const bookService = async (serviceId: string) => {
  const response = await fetch(`/api/services/${serviceId}/book`, {
    method: "POST",
    credentials: "include",
  });
  const data = await parseApiResponse<{ booking: CustomerBooking }>(
    response,
    "Failed to book service",
  );

  return data.booking;
};

export const getCustomerBookings = async () => {
  const response = await fetch("/api/bookings", {
    credentials: "include",
  });
  const data = await parseApiResponse<{ bookings: CustomerBooking[] }>(
    response,
    "Failed to load bookings",
  );

  return data.bookings;
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
