import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-700">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}

export default AppLayout;
