import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import technicianImage from "../assets/home-image.png";
import { useAuth } from "../context/AuthContext";
import { majorCities } from "../lib/cities";
import { serviceCategories } from "../lib/serviceCategories";
import {
  formatServicePrice,
  getPublicServices,
  getServiceDiscountPercent,
  type PublicService,
} from "../lib/servicesApi";

const steps = [
  "Choose a service",
  "Compare trusted vendors",
  "Book a slot",
  "Track and confirm orders",
];

const homeSections = [
  {
    title: "Popular repairing services",
    description:
      "Quick help for appliances, fixtures, wiring, and everyday breakdowns.",
    categories: ["Repairs", "Electrical"],
    href: "/services",
  },
  {
    title: "Plumbing services",
    description:
      "Book trusted plumbers for leaks, blockages, installations, and repairs.",
    categories: ["Plumbing"],
    href: "/services",
  },
  {
    title: "Popular hotels",
    description:
      "Find stays for business trips, family visits, and weekend plans.",
    categories: ["Hotels"],
    href: "/hotels",
  },
];

const getCategoryImage = (category: string) =>
  serviceCategories.find((item) => item.label === category)?.image ||
  serviceCategories.find((item) => item.label === "Others")?.image ||
  "";

function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const showVendorCard = user?.role !== "customer";
  const [services, setServices] = useState<PublicService[]>([]);
  const [homeSearch, setHomeSearch] = useState("");
  const [homeCity, setHomeCity] = useState("");
  const [isCityOpen, setIsCityOpen] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getPublicServices()
      .then(setServices)
      .catch(() => setServices([]));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCityOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const servicesBySection = useMemo(() => {
    return homeSections.map((section) => ({
      ...section,
      services: services
        .filter((service) => section.categories.includes(service.category))
        .slice(0, 3),
    }));
  }, [services]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();
    if (homeSearch.trim()) params.set("search", homeSearch.trim());
    if (homeCity) params.set("city", homeCity);

    navigate(`/services${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <main className="flex-1 bg-white">
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="mb-3 text-sm font-bold uppercase text-teal-700">
              Book local services with confidence
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
              Find trusted vendors for home, travel, repair, and personal
              services.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              ServiceEase helps customers book reliable services and gives
              vendors one place to list offerings, receive orders, and manage
              confirmations.
            </p>

            <form
              className="mt-8 grid gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/70 sm:grid-cols-[1fr_0.8fr_auto]"
              onSubmit={handleSearchSubmit}
            >
              <label className="sr-only" htmlFor="service">
                Search service
              </label>
              <input
                id="service"
                type="search"
                value={homeSearch}
                onChange={(event) => setHomeSearch(event.target.value)}
                placeholder="Search cleaning, plumber, salon..."
                className="min-h-12 rounded-md border border-slate-200 px-4 text-slate-950 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              />
              <label className="sr-only" htmlFor="location">
                Location
              </label>
              <div ref={cityDropdownRef} className="relative">
                <button
                  id="location"
                  type="button"
                  onClick={() => setIsCityOpen((open) => !open)}
                  className="flex min-h-12 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-4 text-left text-slate-950 outline-none transition hover:border-teal-600 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                  aria-haspopup="listbox"
                  aria-expanded={isCityOpen}
                >
                  <span
                    className={homeCity ? "text-slate-950" : "text-slate-400"}
                  >
                    {homeCity || "Your city"}
                  </span>
                  <span className="text-slate-400">v</span>
                </button>
                {isCityOpen && (
                  <div
                    className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-auto rounded-md border border-slate-200 bg-white shadow-xl"
                    role="listbox"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setHomeCity("");
                        setIsCityOpen(false);
                      }}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                      role="option"
                      aria-selected={homeCity === ""}
                    >
                      <span>Your city</span>
                      {!homeCity ? (
                        <span className="text-teal-600">Selected</span>
                      ) : null}
                    </button>
                    {majorCities.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setHomeCity(city);
                          setIsCityOpen(false);
                        }}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                        role="option"
                        aria-selected={homeCity === city}
                      >
                        <span>{city}</span>
                        {homeCity === city ? (
                          <span className="text-teal-600">Selected</span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="min-h-12 rounded-md bg-teal-600 px-6 font-bold text-white transition hover:bg-teal-700"
              >
                Search
              </button>
            </form>

            <div className="mt-7 flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
              <Link
                to="/signup"
                className="rounded-md bg-teal-600 px-4 py-2 text-white transition hover:bg-teal-700"
              >
                Create an Account
              </Link>
              <span className="rounded-md border border-slate-200 bg-white px-3 py-2">
                Verified Vendors
              </span>
              <span className="rounded-md border border-slate-200 bg-white px-3 py-2">
                Hassle-free Experience
              </span>
              <span className="rounded-md border border-slate-200 bg-white px-3 py-2">
                Fast Services
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="grid min-h-[380px] place-items-center rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/80">
              <div className="grid w-full place-items-center rounded-lg bg-slate-50 ">
                <img
                  src={technicianImage}
                  alt="Service technician ready for work"
                  className="h-96 w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-bold uppercase text-teal-700">
              Popular picks
            </p>
            <h2 className="text-3xl font-bold text-slate-950"></h2>
          </div>
          <Link
            to="/services"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-bold text-slate-800 transition hover:border-teal-600 hover:text-teal-700"
          >
            View all services
          </Link>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {serviceCategories.slice(0, 4).map((category) => (
            <article
              key={category.label}
              className={`overflow-hidden group duration-500 hover:-translate-y-1 rounded-lg border bg-white ${category.accent}`}
            >
              <img
                src={category.image}
                alt={category.label}
                className="h-36 w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="p-5">
                <h3 className="text-lg font-bold">{category.label}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {category.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="grid gap-10">
          {servicesBySection.map((section) => (
            <div key={section.title}>
              <div className="mb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-2xl font-bold text-slate-950">
                    {section.title}
                  </h3>
                  <Link
                    to={section.href}
                    className="text-sm font-bold text-teal-700 transition hover:text-teal-800"
                  >
                    View all
                  </Link>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {section.description}
                </p>
              </div>
              {section.services.length === 0 ? (
                <p className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-600">
                  No live listings yet in this section.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {section.services.map((service) => {
                    const discount = getServiceDiscountPercent(
                      service.marginPrice,
                      service.sellingPrice,
                    );
                    return (
                      <article
                        key={service.id}
                        className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        <img
                          src={
                            service.poster || getCategoryImage(service.category)
                          }
                          alt={service.sname}
                          className="h-40 w-full object-cover"
                        />
                        <div className="p-5">
                          <h4 className="text-lg font-bold text-slate-950">
                            {service.sname}
                          </h4>
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {service.description ||
                              "Service details coming soon."}
                          </p>
                          {service.city && (
                            <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                              {service.city}
                            </span>
                          )}
                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            {discount > 0 && (
                              <span className="text-sm text-slate-400 line-through">
                                {formatServicePrice(service.marginPrice)}
                              </span>
                            )}
                            <span className="font-bold text-slate-950">
                              {formatServicePrice(service.sellingPrice)}
                            </span>
                            {discount > 0 && (
                              <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                                {discount}% off
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div
          className={`mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:px-8 ${
            showVendorCard ? "lg:grid-cols-2" : ""
          }`}
        >
          <div>
            <p className="mb-2 text-sm font-bold uppercase text-teal-300">
              For customers
            </p>
            <h2 className="text-3xl font-bold">
              Compare, book, and manage every service request.
            </h2>
            <div className="mt-7 grid gap-3">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-900 p-4"
                >
                  <span className="grid size-9 place-items-center rounded-md bg-teal-500 text-sm font-bold text-slate-950">
                    {index + 1}
                  </span>
                  <p className="font-semibold text-slate-100">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {showVendorCard && (
            <div className="rounded-lg bg-white p-6 text-slate-900">
              <p className="mb-2 text-sm font-bold uppercase text-amber-700">
                For vendors
              </p>
              <h2 className="text-3xl font-bold text-slate-950">
                Sell services and confirm orders from one dashboard.
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                Vendors can register, publish service listings, receive customer
                bookings, update availability, and confirm completed orders.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  to="/vendor/register"
                  className="inline-flex min-h-12 items-center justify-center rounded-md bg-amber-500 px-4 font-bold text-slate-950 transition hover:bg-amber-400"
                >
                  Become a vendor
                </Link>
                <Link
                  to="/vendor/login"
                  className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 px-4 font-bold text-slate-800 transition hover:border-teal-600 hover:text-teal-700"
                >
                  Vendor login
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default HomePage;
