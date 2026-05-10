import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  Outlet,
} from "react-router-dom";
import AnalyticsPage from "./components/AnalyticsPage";
import AuthPage from "./components/AuthPage";
import BookingsPage from "./components/BookingsPage";
import DashboardPage from "./components/DashboardPage";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import ManageServicesPage from "./components/ManageServicesPage";
import Navbar from "./components/Navbar";
import OrdersPage from "./components/OrdersPage";
import ProfilePage from "./components/ProfilePage";
import ServicesPage from "./components/ServicesPage";
import VendorDashboard from "./components/VendorDashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Protected Route component
const ProtectedRoute = ({
  children,
  requireAuth = true,
  allowedRoles,
}: {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}) => {
  const { user, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return (
      <div className="grid min-h-80 place-items-center text-sm text-slate-500">
        Loading...
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate homepage based on role
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const GuestOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return (
      <div className="grid min-h-80 place-items-center text-sm text-slate-500">
        Loading...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Component to conditionally render the homepage based on user role
const HomePageRouter = () => {
  const { user } = useAuth();

  if (user?.role === "vendor") {
    return <VendorDashboard key={`vendor-${user.id}`} />;
  }

  return <HomePage key={`customer-${user?.id || "guest"}`} />;
};

// AppLayout with user-dependent key for forcing re-renders
const AppLayoutWithAuth = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-700">
      <Navbar key={`navbar-${user?.id || "guest"}-${user?.role || "none"}`} />
      <Outlet />
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayoutWithAuth />}>
            <Route path="/" element={<HomePageRouter />} />
            <Route
              path="/login"
              element={
                <GuestOnlyRoute>
                  <AuthPage initialPanel="login" accountType="customer" />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <GuestOnlyRoute>
                  <AuthPage initialPanel="signup" accountType="customer" />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="/vendor/login"
              element={
                <GuestOnlyRoute>
                  <AuthPage initialPanel="login" accountType="vendor" />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="/vendor/register"
              element={
                <GuestOnlyRoute>
                  <AuthPage initialPanel="signup" accountType="vendor" />
                </GuestOnlyRoute>
              }
            />
            {/* Protected routes for customers */}
            <Route
              path="/bookings"
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <BookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["customer"]}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            {/* Public routes */}
            <Route path="/services" element={<ServicesPage />} />
            <Route
              path="/hotels"
              element={<ServicesPage fixedCategory="Hotels" />}
            />
            {/* Protected routes for vendors */}
            <Route
              path="/orders"
              element={
                <ProtectedRoute allowedRoles={["vendor"]}>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={["vendor"]}>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/services/manage"
              element={
                <ProtectedRoute allowedRoles={["vendor"]}>
                  <ManageServicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["vendor", "customer"]}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
