import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, PackageCheck, XCircle } from "lucide-react";
import { vendorApi, type VendorOrder } from "../lib/vendorApi";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const statusClass = (status: VendorOrder["status"]) => {
  if (status === "Booked") return "bg-amber-50 text-amber-700";
  if (status === "Confirmed") return "bg-blue-50 text-blue-700";
  if (status === "Delivered") return "bg-green-50 text-green-700";
  return "bg-rose-50 text-rose-700";
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState<
    VendorOrder["status"] | null
  >(null);

  const loadOrders = async () => {
    try {
      setError("");
      setOrders(await vendorApi.getOrders());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const counts = useMemo(
    () => ({
      booked: orders.filter((order) => order.status === "Booked").length,
      confirmed: orders.filter((order) => order.status === "Confirmed").length,
      delivered: orders.filter((order) => order.status === "Delivered").length,
      cancelled: orders.filter((order) => order.status === "Cancelled").length,
    }),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    if (!activeStatusFilter) return orders;
    return orders.filter((order) => order.status === activeStatusFilter);
  }, [activeStatusFilter, orders]);

  const toggleStatusFilter = (status: VendorOrder["status"]) => {
    setActiveStatusFilter((current) => (current === status ? null : status));
  };

  const handleOrderStatus = async (
    orderId: string,
    status: "Confirmed" | "Delivered" | "Cancelled",
  ) => {
    try {
      setUpdatingOrderId(orderId);
      setError("");
      const updatedOrder = await vendorApi.updateOrderStatus(orderId, status);
      setOrders((current) =>
        current.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update order status",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-950">Manage Orders</h1>
        <p className="text-slate-600">
          Confirm or cancel bookings for your services.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button
          type="button"
          onClick={() => toggleStatusFilter("Booked")}
          className={`rounded-md border p-5 text-left shadow-sm transition ${
            activeStatusFilter === "Booked"
              ? "border-amber-300 bg-amber-50 ring-2 ring-amber-100"
              : "border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50/40"
          }`}
        >
          <p className="text-sm font-medium text-slate-600">Pending</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {counts.booked}
          </p>
        </button>
        <button
          type="button"
          onClick={() => toggleStatusFilter("Confirmed")}
          className={`rounded-md border p-5 text-left shadow-sm transition ${
            activeStatusFilter === "Confirmed"
              ? "border-blue-300 bg-blue-50 ring-2 ring-blue-100"
              : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
          }`}
        >
          <p className="text-sm font-medium text-slate-600">Confirmed</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {counts.confirmed}
          </p>
        </button>
        <button
          type="button"
          onClick={() => toggleStatusFilter("Delivered")}
          className={`rounded-md border p-5 text-left shadow-sm transition ${
            activeStatusFilter === "Delivered"
              ? "border-green-300 bg-green-50 ring-2 ring-green-100"
              : "border-slate-200 bg-white hover:border-green-200 hover:bg-green-50/40"
          }`}
        >
          <p className="text-sm font-medium text-slate-600">Delivered</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {counts.delivered}
          </p>
        </button>
        <button
          type="button"
          onClick={() => toggleStatusFilter("Cancelled")}
          className={`rounded-md border p-5 text-left shadow-sm transition ${
            activeStatusFilter === "Cancelled"
              ? "border-rose-300 bg-rose-50 ring-2 ring-rose-100"
              : "border-slate-200 bg-white hover:border-rose-200 hover:bg-rose-50/40"
          }`}
        >
          <p className="text-sm font-medium text-slate-600">Cancelled</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">
            {counts.cancelled}
          </p>
        </button>
      </div>

      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        {isLoading ? (
          <div className="grid min-h-56 place-items-center">
            <Loader2 className="h-7 w-7 animate-spin text-teal-600" />
          </div>
        ) : orders.length === 0 ? (
          <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">
            No orders yet.
          </p>
        ) : filteredOrders.length === 0 ? (
          <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">
            No {activeStatusFilter?.toLowerCase()} orders.
          </p>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map((order) => (
              <article
                key={order.id}
                className="grid gap-4 rounded-md border border-slate-200 p-4 lg:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-950">
                      {order.service?.sname ?? "Deleted service"}
                    </h2>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Customer:{" "}
                    <span className="font-medium text-slate-900">
                      {order.customer?.fullName ||
                        order.customer?.email ||
                        "Customer"}
                    </span>
                  </p>
                  {order.customer?.email && (
                    <p className="mt-1 text-sm text-slate-500">
                      {order.customer.email}
                    </p>
                  )}
                  <p className="mt-3 text-sm font-medium text-slate-950">
                    {formatCurrency(order.service?.sellingPrice ?? 0)}
                    {order.service?.category && (
                      <span className="ml-2 font-normal text-slate-500">
                        {order.service.category}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 lg:justify-end">
                  <button
                    type="button"
                    onClick={() => handleOrderStatus(order.id, "Confirmed")}
                    disabled={
                      updatingOrderId === order.id ||
                      order.status === "Confirmed" ||
                      order.status === "Delivered" ||
                      order.status === "Cancelled"
                    }
                    className="inline-flex min-h-9 items-center gap-2 rounded-md bg-teal-600 px-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updatingOrderId === order.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOrderStatus(order.id, "Delivered")}
                    disabled={
                      updatingOrderId === order.id ||
                      order.status === "Delivered" ||
                      order.status === "Cancelled"
                    }
                    className="inline-flex min-h-9 items-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updatingOrderId === order.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <PackageCheck className="h-4 w-4" />
                    )}
                    Delivered
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOrderStatus(order.id, "Cancelled")}
                    disabled={
                      updatingOrderId === order.id ||
                      order.status === "Cancelled" ||
                      order.status === "Delivered"
                    }
                    className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updatingOrderId === order.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    Cancel
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default OrdersPage;
