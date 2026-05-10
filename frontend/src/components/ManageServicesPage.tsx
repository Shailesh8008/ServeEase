import { useEffect, useRef, useState, type FormEvent } from "react";
import { Edit3, ImagePlus, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import {
  vendorApi,
  type VendorService,
  type VendorServiceInput,
} from "../lib/vendorApi";
import { serviceCategoryLabels } from "../lib/serviceCategories";
import { majorCities } from "../lib/cities";

const emptyForm: VendorServiceInput = {
  sname: "",
  marginPrice: 0,
  sellingPrice: 0,
  category: "",
  city: "",
  description: "",
  poster: "",
  posterFile: null,
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const getDiscountPercent = (marginPrice: number, sellingPrice: number) => {
  if (marginPrice <= 0 || sellingPrice >= marginPrice) return 0;
  return Math.round(((marginPrice - sellingPrice) / marginPrice) * 100);
};

const ManageServicesPage = () => {
  const [services, setServices] = useState<VendorService[]>([]);
  const [form, setForm] = useState<VendorServiceInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  const loadServices = async () => {
    try {
      setError("");
      setServices(await vendorApi.getServices());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load services");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node) &&
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
        setIsCityOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateForm = (
    field: keyof VendorServiceInput,
    value: string | number,
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsCategoryOpen(false);
    setIsCityOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        marginPrice: Number(form.marginPrice),
        sellingPrice: Number(form.sellingPrice),
      };
      const saved = editingId
        ? await vendorApi.updateService(editingId, payload)
        : await vendorApi.createService(payload);

      setServices((current) =>
        editingId
          ? current.map((service) =>
              service.id === saved.id ? saved : service,
            )
          : [saved, ...current],
      );
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save service");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (service: VendorService) => {
    setEditingId(service.id);
    setForm({
      sname: service.sname,
      marginPrice: service.marginPrice,
      sellingPrice: service.sellingPrice,
      category: service.category,
      city: service.city,
      description: service.description,
      poster: service.poster,
      posterFile: null,
    });
  };

  const handleDelete = async (serviceId: string) => {
    setDeletingId(serviceId);
    setError("");

    try {
      await vendorApi.deleteService(serviceId);
      setServices((current) =>
        current.filter((service) => service.id !== serviceId),
      );
      if (editingId === serviceId) resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete service");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-950">Manage Services</h1>
        <p className="text-slate-600">
          Create, update, and delete your service listings.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-950">
            {editingId ? "Edit service" : "Add service"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-700"
            >
              <X className="h-4 w-4" />
              Cancel edit
            </button>
          )}
        </div>

        <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-semibold text-slate-900">
            <span>
              Service name <span className="text-rose-600">*</span>
            </span>
            <input
              value={form.sname}
              onChange={(event) => updateForm("sname", event.target.value)}
              className="min-h-11 rounded-md border border-slate-300 px-3 text-sm font-normal text-slate-950 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              required
            />
          </label>

          <div
            ref={categoryDropdownRef}
            className="relative grid gap-2 text-sm font-semibold text-slate-900"
          >
            <span>
              Category <span className="text-rose-600">*</span>
            </span>
            <button
              type="button"
              onClick={() => setIsCategoryOpen((open) => !open)}
              className="flex min-h-11 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 text-left text-sm font-normal text-slate-950 outline-none transition hover:border-teal-600 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              aria-haspopup="listbox"
              aria-expanded={isCategoryOpen}
            >
              <span
                className={form.category ? "text-slate-950" : "text-slate-400"}
              >
                {form.category || "Select a category"}
              </span>
              <span className="text-slate-400">v</span>
            </button>
            <input value={form.category} required readOnly className="sr-only" />
            {isCategoryOpen && (
              <div
                className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-auto rounded-md border border-slate-200 bg-white shadow-xl"
                role="listbox"
              >
                {serviceCategoryLabels.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      updateForm("category", category);
                      setIsCategoryOpen(false);
                    }}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-normal text-slate-700 transition hover:bg-slate-50"
                    role="option"
                    aria-selected={form.category === category}
                  >
                    <span>{category}</span>
                    {form.category === category ? (
                      <span className="text-teal-600">Selected</span>
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            ref={cityDropdownRef}
            className="relative grid gap-2 text-sm font-semibold text-slate-900"
          >
            <span>
              City <span className="text-rose-600">*</span>
            </span>
            <button
              type="button"
              onClick={() => setIsCityOpen((open) => !open)}
              className="flex min-h-11 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 text-left text-sm font-normal text-slate-950 outline-none transition hover:border-teal-600 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              aria-haspopup="listbox"
              aria-expanded={isCityOpen}
            >
              <span className={form.city ? "text-slate-950" : "text-slate-400"}>
                {form.city || "Select a city"}
              </span>
              <span className="text-slate-400">v</span>
            </button>
            <input value={form.city} required readOnly className="sr-only" />
            {isCityOpen && (
              <div
                className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-auto rounded-md border border-slate-200 bg-white shadow-xl"
                role="listbox"
              >
                {majorCities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      updateForm("city", city);
                      setIsCityOpen(false);
                    }}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-normal text-slate-700 transition hover:bg-slate-50"
                    role="option"
                    aria-selected={form.city === city}
                  >
                    <span>{city}</span>
                    {form.city === city ? (
                      <span className="text-teal-600">Selected</span>
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </div>

          <label className="grid gap-2 text-sm font-semibold text-slate-900">
            <span>
              Margin price <span className="text-rose-600">*</span>
            </span>
            <input
              type="number"
              min="0"
              value={form.marginPrice}
              onChange={(event) =>
                updateForm("marginPrice", Number(event.target.value))
              }
              className="min-h-11 rounded-md border border-slate-300 px-3 text-sm font-normal text-slate-950 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              required
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-slate-900">
            <span>
              Selling price <span className="text-rose-600">*</span>
            </span>
            <input
              type="number"
              min="0"
              value={form.sellingPrice}
              onChange={(event) =>
                updateForm("sellingPrice", Number(event.target.value))
              }
              className="min-h-11 rounded-md border border-slate-300 px-3 text-sm font-normal text-slate-950 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              required
            />
          </label>

          <div className="grid gap-3 lg:col-span-2">
            <label className="grid gap-2 text-sm font-semibold text-slate-900">
              <span>Upload poster image</span>
              <span className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-teal-500 hover:bg-teal-50">
                <ImagePlus className="h-6 w-6 text-teal-700" />
                <span className="text-sm font-medium text-slate-700">
                  {form.posterFile
                    ? form.posterFile.name
                    : "Choose an image from your computer"}
                </span>
                <span className="text-xs font-normal text-slate-500">
                  JPG, PNG, or WebP up to 20 MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      posterFile: event.target.files?.[0] ?? null,
                    }))
                  }
                  className="sr-only"
                />
              </span>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-900">
              Poster image URL
              <input
                type="url"
                value={form.poster}
                onChange={(event) => updateForm("poster", event.target.value)}
                placeholder="Optional if you upload an image"
                className="min-h-11 rounded-md border border-slate-300 px-3 text-sm font-normal text-slate-950 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              />
            </label>

            {(form.posterFile || form.poster) && (
              <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                <img
                  src={
                    form.posterFile
                      ? URL.createObjectURL(form.posterFile)
                      : form.poster
                  }
                  alt="Service poster preview"
                  className="h-48 w-full object-cover"
                />
              </div>
            )}
          </div>

          <label className="grid gap-2 text-sm font-semibold text-slate-900 lg:col-span-2">
            Description
            <textarea
              value={form.description}
              onChange={(event) =>
                updateForm("description", event.target.value)
              }
              rows={4}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal text-slate-950 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            />
          </label>

          <div className="lg:col-span-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-70"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingId ? (
                <Save className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {editingId ? "Save changes" : "Create service"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Your Services</h2>

        {isLoading ? (
          <div className="grid min-h-40 place-items-center">
            <Loader2 className="h-7 w-7 animate-spin text-teal-600" />
          </div>
        ) : services.length === 0 ? (
          <p className="mt-4 rounded-md bg-slate-50 p-4 text-sm text-slate-600">
            No services yet. Add your first listing above.
          </p>
        ) : (
          <div className="mt-5 grid gap-4">
            {services.map((service) => (
              <article
                key={service.id}
                className="grid gap-4 rounded-md border border-slate-200 p-4 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-950">
                      {service.sname}
                    </h3>
                    <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700">
                      {service.category}
                    </span>
                    {service.city && (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                        {service.city}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {service.description || "No description provided."}
                  </p>
                  {service.poster && (
                    <img
                      src={service.poster}
                      alt={service.sname}
                      className="mt-3 h-28 w-full max-w-sm rounded-md object-cover"
                    />
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {getDiscountPercent(
                      service.marginPrice,
                      service.sellingPrice,
                    ) > 0 && (
                      <span className="text-sm text-slate-400 line-through">
                        {formatPrice(service.marginPrice)}
                      </span>
                    )}
                    <span className="text-lg font-bold text-slate-950">
                      {formatPrice(service.sellingPrice)}
                    </span>
                    {getDiscountPercent(
                      service.marginPrice,
                      service.sellingPrice,
                    ) > 0 && (
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                        {getDiscountPercent(
                          service.marginPrice,
                          service.sellingPrice,
                        )}
                        % off
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 md:justify-end">
                  <button
                    type="button"
                    onClick={() => handleEdit(service)}
                    className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-700"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(service.id)}
                    disabled={deletingId === service.id}
                    className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700 disabled:opacity-70"
                  >
                    {deletingId === service.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete
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

export default ManageServicesPage;
