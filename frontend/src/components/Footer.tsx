import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-teal-500 text-sm font-bold text-white">
              SE
            </span>
            <span className="text-lg font-bold">ServiceEase</span>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-300">
            Book trusted services as a customer or sell your services as a
            verified vendor.
          </p>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase text-slate-400">
            Company
          </h2>
          <div className="grid gap-2 text-sm text-slate-300">
            <Link to="#" className="transition hover:text-white">
              About
            </Link>
            <Link to="#" className="transition hover:text-white">
              Services
            </Link>
            <Link to="#" className="transition hover:text-white">
              Contact
            </Link>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase text-slate-400">
            Support
          </h2>
          <div className="grid gap-2 text-sm text-slate-300">
            <Link to="#" className="transition hover:text-white">
              Help Center
            </Link>
            <Link to="#" className="transition hover:text-white">
              Privacy
            </Link>
            <Link to="#" className="transition hover:text-white">
              Terms
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 px-4 py-5 text-center text-sm text-slate-400">
        © Copyright 2026 ServiceEase. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
