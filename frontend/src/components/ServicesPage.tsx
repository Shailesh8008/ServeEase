import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  serviceCategories,
  serviceCategoryFilterOptions,
} from "../lib/serviceCategories";
import { cityFilterOptions } from "../lib/cities";
import {
  formatServicePrice,
  getPublicServices,
  getServiceDiscountPercent,
  type PublicService,
} from "../lib/servicesApi";

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

const getCategoryImage = (category: string) =>
  serviceCategories.find((item) => item.label === category)?.image ||
  serviceCategories.find((item) => item.label === "Others")?.image ||
  "";

function ServicesPage() {
  const { user } = useAuth();
  const isVendor = user?.role === "vendor";
  const [services, setServices] = useState<PublicService[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [city, setCity] = useState("All");
  const [sort, setSort] = useState("relevance");
  const [activeDropdown, setActiveDropdown] = useState<
    "category" | "city" | "sort" | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setError("");
        setServices(await getPublicServices());
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load services",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filtersRef.current &&
        !filtersRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (type: "category" | "city" | "sort", value: string) => {
    if (type === "category") setCategory(value);
    if (type === "city") setCity(value);
    if (type === "sort") setSort(value);
    setActiveDropdown(null);
  };

  const filteredServices = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return services
      .filter((service) => {
        const matchesSearch =
          normalizedSearch === "" ||
          service.sname.toLowerCase().includes(normalizedSearch) ||
          service.description.toLowerCase().includes(normalizedSearch);
        const matchesCategory =
          category === "All" || service.category === category;
        const matchesCity = city === "All" || service.city === city;
        return matchesSearch && matchesCategory && matchesCity;
      })
      .sort((a, b) => {
        if (sort === "price-asc") return a.sellingPrice - b.sellingPrice;
        if (sort === "price-desc") return b.sellingPrice - a.sellingPrice;
        return 0;
      });
  }, [services, search, category, city, sort]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-slate-200 bg-linear-to-br from-white via-slate-50 to-teal-50 p-8 shadow-xl shadow-slate-200/40 ring-1 ring-slate-100">
        <div className="grid gap-10">
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-sm font-semibold uppercase text-teal-700">
                Services catalog
              </p>
              <h1 className="mt-3 text-4xl font-bold text-slate-950 sm:text-5xl">
                Find the right service for your home or stay.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Browse live listings published by vendors.
              </p>
            </div>

            <div className="grid gap-6">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  Search services
                </span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search cleaning, plumbing, hotels..."
                  className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </label>

              <div ref={filtersRef} className="grid gap-4 sm:grid-cols-3">
                <div className="relative">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Category
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveDropdown((prev) =>
                        prev === "category" ? null : "category",
                      )
                    }
                    className="flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-900 transition hover:border-teal-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                  >
                    <span>{category}</span>
                    <span className="text-slate-400">v</span>
                  </button>
                  {activeDropdown === "category" && (
                    <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl">
                      {serviceCategoryFilterOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleSelect("category", option)}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                          <span>{option}</span>
                          {category === option ? (
                            <span className="text-teal-600">Selected</span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    City
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveDropdown((prev) =>
                        prev === "city" ? null : "city",
                      )
                    }
                    className="flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-900 transition hover:border-teal-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                  >
                    <span>{city}</span>
                    <span className="text-slate-400">v</span>
                  </button>
                  {activeDropdown === "city" && (
                    <div className="absolute left-0 right-0 z-20 mt-2 max-h-72 overflow-auto rounded-md border border-slate-200 bg-white shadow-xl">
                      {cityFilterOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleSelect("city", option)}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                          <span>{option}</span>
                          {city === option ? (
                            <span className="text-teal-600">Selected</span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Sort by
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveDropdown((prev) =>
                        prev === "sort" ? null : "sort",
                      )
                    }
                    className="flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-900 transition hover:border-teal-500 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
                  >
                    <span>
                      {
                        sortOptions.find((option) => option.value === sort)
                          ?.label
                      }
                    </span>
                    <span className="text-slate-400">v</span>
                  </button>
                  {activeDropdown === "sort" && (
                    <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleSelect("sort", option.value)}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                          <span>{option.label}</span>
                          {sort === option.value ? (
                            <span className="text-teal-600">Selected</span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          Showing{" "}
          <span className="font-semibold text-slate-950">
            {filteredServices.length}
          </span>{" "}
          services.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid min-h-56 place-items-center rounded-md border border-slate-200 bg-white">
          <Loader2 className="h-7 w-7 animate-spin text-teal-600" />
        </div>
      ) : filteredServices.length === 0 ? (
        <p className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No services found for the selected filters.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredServices.map((service) => {
            const discount = getServiceDiscountPercent(
              service.marginPrice,
              service.sellingPrice,
            );
            return (
              <article
                key={service.id}
                className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-60 overflow-hidden bg-slate-100">
                  <img
                    src={service.poster || getCategoryImage(service.category)}
                    alt={service.sname}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-950 shadow-sm">
                    {service.category}
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-medium">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                      {service.city || "City not specified"}
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-950">
                    {service.sname}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {service.description || "Service details coming soon."}
                  </p>

                  <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      {discount > 0 && (
                        <span className="text-sm text-slate-400 line-through">
                          {formatServicePrice(service.marginPrice)}
                        </span>
                      )}
                      <span className="text-lg font-bold text-slate-950">
                        {formatServicePrice(service.sellingPrice)}
                      </span>
                      {discount > 0 && (
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                          {discount}% off
                        </span>
                      )}
                    </div>
                    {!isVendor && (
                      <button className="rounded-md bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700">
                        Book now
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default ServicesPage;
