export type VendorService = {
  id: string;
  sname: string;
  marginPrice: number;
  sellingPrice: number;
  category: string;
  city: string;
  description: string;
  poster: string;
};

export type VendorOrderStatus =
  | "Booked"
  | "Confirmed"
  | "Delivered"
  | "Cancelled";

export type VendorOrder = {
  id: string;
  status: VendorOrderStatus;
  service: {
    id: string;
    sname: string;
    sellingPrice: number;
    category: string;
  } | null;
  customer: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type VendorStats = {
  activeServices: number;
  pendingOrders: number;
  confirmedOrders: number;
  completedOrders: number;
  revenue: number;
};

export type VendorDashboardData = {
  services: VendorService[];
  orders: VendorOrder[];
  stats: VendorStats;
};

export type VendorServiceInput = Omit<VendorService, "id"> & {
  posterFile?: File | null;
};

const buildServiceFormData = (service: VendorServiceInput) => {
  const formData = new FormData();
  formData.append("sname", service.sname);
  formData.append("marginPrice", String(service.marginPrice));
  formData.append("sellingPrice", String(service.sellingPrice));
  formData.append("category", service.category);
  formData.append("city", service.city);
  formData.append("description", service.description);
  formData.append("poster", service.poster);

  if (service.posterFile) {
    formData.set("poster", service.posterFile);
  }

  return formData;
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const payload = data as { error?: string; message?: string } | null;
    throw new Error(
      payload?.error || payload?.message || "Vendor request failed",
    );
  }

  return data as T;
};

export const vendorApi = {
  async getDashboard() {
    const response = await fetch("/api/vendor/dashboard", {
      credentials: "include",
    });
    const data = await parseResponse<
      { success: boolean } & VendorDashboardData
    >(response);
    return {
      services: data.services,
      orders: data.orders,
      stats: data.stats,
    };
  },

  async getServices() {
    const response = await fetch("/api/vendor/services", {
      credentials: "include",
    });
    const data = await parseResponse<{
      success: boolean;
      services: VendorService[];
    }>(response);
    return data.services;
  },

  async createService(service: VendorServiceInput) {
    const response = await fetch("/api/vendor/services", {
      method: "POST",
      credentials: "include",
      body: buildServiceFormData(service),
    });
    const data = await parseResponse<{
      success: boolean;
      service: VendorService;
    }>(response);
    return data.service;
  },

  async updateService(serviceId: string, service: VendorServiceInput) {
    const response = await fetch(`/api/vendor/services/${serviceId}`, {
      method: "PUT",
      credentials: "include",
      body: buildServiceFormData(service),
    });
    const data = await parseResponse<{
      success: boolean;
      service: VendorService;
    }>(response);
    return data.service;
  },

  async deleteService(serviceId: string) {
    const response = await fetch(`/api/vendor/services/${serviceId}`, {
      method: "DELETE",
      credentials: "include",
    });
    await parseResponse<{ success: boolean }>(response);
  },

  async getOrders() {
    const response = await fetch("/api/vendor/orders", {
      credentials: "include",
    });
    const data = await parseResponse<{
      success: boolean;
      orders: VendorOrder[];
    }>(response);
    return data.orders;
  },

  async updateOrderStatus(
    orderId: string,
    status: Extract<VendorOrderStatus, "Confirmed" | "Cancelled">,
  ) {
    const response = await fetch(`/api/vendor/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    const data = await parseResponse<{ success: boolean; order: VendorOrder }>(
      response,
    );
    return data.order;
  },
};
