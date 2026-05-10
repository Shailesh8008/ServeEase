import { Link, NavLink } from "react-router-dom";
import { UserCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Bookings", href: "/bookings" },
  { label: "Contact", href: "/contact" },
];

function Navbar() {
  const { user } = useAuth();

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

        <div className="flex items-center gap-2">
          {user ? (
            <Link
              to="/"
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700"
              title="Profile"
            >
              <UserCircle className="h-5 w-5" />
            </Link>
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
