import { useEffect, useMemo, useState } from "react";
import { CalendarCheck2, Loader2 } from "lucide-react";
import {
  formatServicePrice,
  getCustomerBookings,
  type BookingStatus,
  type CustomerBooking,
} from "../lib/servicesApi";

const statusClass = (status: BookingStatus) => {
  if (status === "Booked") return "bg-amber-50 text-amber-700";
  if (status === "Confirmed") return "bg-blue-50 text-blue-700";
  if (status === "Delivered") return "bg-green-50 text-green-700";
  return "bg-rose-50 text-rose-700";
};

const trackerSteps = ["Booked", "Confirmed", "Delivered"] as const;

const getTrackerProgress = (status: BookingStatus) => {
  if (status === "Confirmed") return 50;
  if (status === "Delivered" || status === "Cancelled") return 100;
  return 0;
};

const formatDate = (value?: string) => {
  if (!value) return "Recently booked";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const BookingTracker = ({ status }: { status: BookingStatus }) => {
  const isCancelled = status === "Cancelled";
  const progress = getTrackerProgress(status);
  const steps = isCancelled ? ["Booked", "Canceled"] : trackerSteps;

  return (
    <div className="mt-5">
      <div className="relative px-1">
        <div className="absolute left-4 right-4 top-3 h-1 rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full transition-all ${
              isCancelled ? "bg-rose-500" : "bg-teal-600"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div
          className={`relative z-10 grid ${
            isCancelled ? "grid-cols-2" : "grid-cols-3"
          }`}
        >
          {steps.map((step, index) => {
            const stepProgress = isCancelled ? index * 100 : index * 50;
            const isActive = isCancelled || progress >= stepProgress;

            return (
              <div
                key={step}
                className={`flex ${
                  index === 0
                    ? "items-start"
                    : index === steps.length - 1
                      ? "items-end"
                      : "items-center"
                } flex-col`}
              >
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full border-2 text-xs font-bold ${
                    isActive
                      ? isCancelled
                        ? "border-rose-500 bg-rose-500 text-white"
                        : "border-teal-600 bg-teal-600 text-white"
                      : "border-slate-300 bg-white text-slate-400"
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isActive
                      ? isCancelled
                        ? "text-rose-700"
                        : "text-slate-800"
                      : "text-slate-400"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

function BookingsPage() {
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] =
    useState<BookingStatus | null>(null);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setError("");
        setBookings(await getCustomerBookings());
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load bookings",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, []);

  const counts = useMemo(
    () => ({
      booked: bookings.filter((booking) => booking.status === "Booked").length,
      confirmed: bookings.filter((booking) => booking.status === "Confirmed")
        .length,
      delivered: bookings.filter((booking) => booking.status === "Delivered")
        .length,
      cancelled: bookings.filter((booking) => booking.status === "Cancelled")
        .length,
    }),
    [bookings],
  );

  const filteredBookings = useMemo(() => {
    if (!activeStatusFilter) return bookings;
    return bookings.filter((booking) => booking.status === activeStatusFilter);
  }, [activeStatusFilter, bookings]);

  const toggleStatusFilter = (status: BookingStatus) => {
    setActiveStatusFilter((current) => (current === status ? null : status));
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-950">Your Bookings</h1>
        <p className="text-slate-600">
          Track your booked services and their latest vendor status.
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
          <p className="text-sm font-medium text-slate-600">Booked</p>
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
        ) : bookings.length === 0 ? (
          <div className="grid min-h-56 place-items-center rounded-md bg-slate-50 p-6 text-center">
            <div>
              <CalendarCheck2 className="mx-auto h-10 w-10 text-slate-400" />
              <p className="mt-3 text-sm font-medium text-slate-700">
                No bookings yet.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Book a service from the catalog and it will appear here.
              </p>
            </div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">
            No {activeStatusFilter?.toLowerCase()} bookings.
          </p>
        ) : (
          <div className="grid gap-4">
            {filteredBookings.map((booking) => (
              <article
                key={booking.id}
                className="grid gap-4 rounded-md border border-slate-200 p-4 sm:grid-cols-[96px_1fr]"
              >
                <div className="h-24 overflow-hidden rounded-md bg-slate-100">
                  {booking.service?.poster ? (
                    <img
                      src={booking.service.poster}
                      alt={booking.service.sname}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-950">
                      {booking.service?.sname ?? "Deleted service"}
                    </h2>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(
                        booking.status,
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Booked on {formatDate(booking.createdAt)}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {booking.service?.city || "City not specified"}
                    {booking.service?.category
                      ? ` - ${booking.service.category}`
                      : ""}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-slate-950">
                    {formatServicePrice(booking.service?.sellingPrice ?? 0)}
                  </p>
                  <BookingTracker status={booking.status} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default BookingsPage;
