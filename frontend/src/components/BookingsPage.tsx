function BookingsPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-950">Your Bookings</h1>
        <p className="mt-4 text-sm text-slate-600">
          View your booked services, appointment details, and booking status
          here.
        </p>
      </div>
    </main>
  );
}

export default BookingsPage;
