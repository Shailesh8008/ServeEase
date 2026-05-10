const ProfilePage = () => {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-950">Business Profile</h1>
        <p className="text-slate-600">
          Update your business information and preferences.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <p className="text-lg text-slate-600">
            Profile management coming soon...
          </p>
          <p className="mt-2 text-sm text-slate-500">
            This page will allow you to update business details, contact
            information, and preferences.
          </p>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
