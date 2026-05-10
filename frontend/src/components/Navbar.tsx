import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  UserCircle,
  Settings,
  Briefcase,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";

const customerNavLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Bookings", href: "/bookings" },
  { label: "Contact", href: "/contact" },
];

const vendorNavLinks = [
  { label: "Dashboard", href: "/" },
  { label: "My Services", href: "/services/manage" },
  { label: "Orders", href: "/orders" },
  { label: "Analytics", href: "/analytics" },
];

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navLinks = user?.role === "vendor" ? vendorNavLinks : customerNavLinks;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav
        className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Primary navigation"
      >
        <Link to="/" className="flex items-center gap-3 text-slate-950">
          <span className="grid size-10 place-items-center rounded-lg bg-teal-600 text-lg font-bold text-white">
            SE
          </span>
          <span className="text-xl font-bold tracking-normal">ServiceEase</span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                `text-sm font-medium transition hover:text-teal-700 ${
                  isActive ? "text-teal-700" : "text-slate-600"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="relative flex items-center gap-2" ref={menuRef}>
          {user ? (
            <>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="inline-flex min-h-10 items-center rounded-md bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                title="Profile menu"
              >
                <UserCircle className="h-5 w-5" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white text-sm shadow-xl ring-1 ring-slate-900/5">
                  {user?.role === "vendor" ? (
                    <>
                      <Link
                        to="/orders"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-slate-700 transition hover:bg-slate-50"
                      >
                        <Briefcase className="h-4 w-4" />
                        Manage Orders
                      </Link>
                      <div className="border-t border-slate-100" />
                      <Link
                        to="/services/manage"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-slate-700 transition hover:bg-slate-50"
                      >
                        <Settings className="h-4 w-4" />
                        Manage Services
                      </Link>
                      <div className="border-t border-slate-100" />
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-slate-700 transition hover:bg-slate-50"
                      >
                        <UserCircle className="h-4 w-4" />
                        Business Profile
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/bookings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-slate-700 transition hover:bg-slate-50"
                      >
                        <CalendarDays className="h-4 w-4" />
                        My Bookings
                      </Link>
                      <div className="border-t border-slate-100" />
                      <Link
                        to="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-slate-700 transition hover:bg-slate-50"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </>
                  )}
                  <div className="border-t border-slate-100" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-slate-700 transition hover:bg-slate-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Login / Sign up
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
