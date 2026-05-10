import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  ClipboardList,
  IndianRupee,
  Loader2,
  Plus,
  Settings,
  Wrench,
  XCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  vendorApi,
  type VendorDashboardData,
  type VendorOrder,
} from "../lib/vendorApi";

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

const VendorDashboard = () => {
  const { user } = useAuth();
  const displayName =
    user?.fullName?.trim() ||
    user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    "vendor";
  const [dashboard, setDashboard] = useState<VendorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setError("");
      const data = await vendorApi.getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load dashboard data",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const recentOrders = useMemo(
    () => dashboard?.orders.slice(0, 5) ?? [],
    [dashboard?.orders],
  );

  const handleOrderStatus = async (
    orderId: string,
    status: "Confirmed" | "Cancelled",
  ) => {
    try {
      setUpdatingOrderId(orderId);
      const updatedOrder = await vendorApi.updateOrderStatus(orderId, status);
      setDashboard((current) => {
        if (!current) return current;

        return {
          ...current,
          orders: current.orders.map((order) =>
            order.id === updatedOrder.id ? updatedOrder : order,
          ),
          stats: {
            ...current.stats,
            pendingOrders: current.orders.filter((order) =>
              order.id === updatedOrder.id
                ? updatedOrder.status === "Booked"
                : order.status === "Booked",
            ).length,
            confirmedOrders: current.orders.filter((order) =>
              order.id === updatedOrder.id
                ? updatedOrder.status === "Confirmed"
                : order.status === "Confirmed",
            ).length,
          },
        };
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update order status",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const stats = [
    {
      title: "Active Services",
      value: dashboard?.stats.activeServices ?? 0,
      detail: "Live listings",
      icon: Wrench,
    },
    {
      title: "Pending Orders",
      value: dashboard?.stats.pendingOrders ?? 0,
      detail: "Need a response",
      icon: ClipboardList,
    },
    {
      title: "Confirmed Orders",
      value: dashboard?.stats.confirmedOrders ?? 0,
      detail: "Scheduled work",
      icon: CheckCircle2,
    },
    {
      title: "Order Value",
      value: formatCurrency(dashboard?.stats.revenue ?? 0),
      detail: "Non-cancelled bookings",
      icon: IndianRupee,
    },
  ];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-950">
            Welcome back, {displayName}!
          </h1>
          <p className="text-slate-600">
            Manage service listings and respond to customer orders.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/services/manage"
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            Add service
          </Link>
          <Link
            to="/orders"
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-700"
          >
            <ClipboardList className="h-4 w-4" />
            Orders
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid min-h-60 place-items-center rounded-md border border-slate-200 bg-white">
          <Loader2 className="h-7 w-7 animate-spin text-teal-600" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="rounded-md border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        {stat.title}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-slate-950">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {stat.detail}
                      </p>
                    </div>
                    <span className="grid size-10 place-items-center rounded-md bg-teal-50 text-teal-700">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-950">
                  Recent Orders
                </h2>
                <Link
                  to="/orders"
                  className="text-sm font-medium text-teal-700 hover:text-teal-800"
                >
                  View all
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">
                  No orders yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="grid gap-4 rounded-md border border-slate-100 p-4 sm:grid-cols-[1fr_auto]"
                    >
                      <div>
                        <p className="font-medium text-slate-950">
                          {order.service?.sname ?? "Deleted service"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {order.customer?.fullName ||
                            order.customer?.email ||
                            "Customer"}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                          <span
                            className={`rounded-full px-2 py-1 font-medium ${statusClass(
                              order.status,
                            )}`}
                          >
                            {order.status}
                          </span>
                          <span className="text-slate-500">
                            {formatCurrency(order.service?.sellingPrice ?? 0)}
                          </span>
                        </div>
                      </div>
                      {order.status === "Booked" && (
                        <div className="flex items-center gap-2 sm:justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              handleOrderStatus(order.id, "Confirmed")
                            }
                            disabled={updatingOrderId === order.id}
                            className="inline-flex min-h-9 items-center gap-2 rounded-md bg-teal-600 px-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-70"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleOrderStatus(order.id, "Cancelled")
                            }
                            disabled={updatingOrderId === order.id}
                            className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700 disabled:opacity-70"
                          >
                            <XCircle className="h-4 w-4" />
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">
                Services
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {dashboard?.services.length
                  ? `${dashboard.services.length} listing${
                      dashboard.services.length === 1 ? "" : "s"
                    } available for booking.`
                  : "Create your first service listing."}
              </p>

              <div className="mt-5 grid gap-3">
                <Link
                  to="/services/manage"
                  className="flex items-center gap-3 rounded-md border border-slate-200 p-4 text-left transition hover:border-teal-300 hover:bg-teal-50"
                >
                  <Settings className="h-5 w-5 text-teal-700" />
                  <div>
                    <p className="font-medium text-slate-950">
                      Manage services
                    </p>
                    <p className="text-sm text-slate-500">
                      Create, edit, or delete listings.
                    </p>
                  </div>
                </Link>
                <Link
                  to="/orders"
                  className="flex items-center gap-3 rounded-md border border-slate-200 p-4 text-left transition hover:border-teal-300 hover:bg-teal-50"
                >
                  <ClipboardList className="h-5 w-5 text-teal-700" />
                  <div>
                    <p className="font-medium text-slate-950">Manage orders</p>
                    <p className="text-sm text-slate-500">
                      Confirm or cancel booked work.
                    </p>
                  </div>
                </Link>
              </div>
            </section>
          </div>
        </>
      )}
    </main>
  );
};

export default VendorDashboard;
