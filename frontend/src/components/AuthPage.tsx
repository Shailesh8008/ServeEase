import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "../lib/apiUrl";

type AuthPanel = "login" | "signup";
type AccountType = "customer" | "vendor";

type AuthPageProps = {
  initialPanel?: AuthPanel;
  accountType?: AccountType;
};

function AuthPage({
  initialPanel = "login",
  accountType = "customer",
}: AuthPageProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [authPanel, setAuthPanel] = useState<AuthPanel>(initialPanel);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [serviceCity, setServiceCity] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");

  useEffect(() => {
    if (resendCountdown > 0) {
      const timerId = setTimeout(
        () => setResendCountdown(resendCountdown - 1),
        1000,
      );
      return () => clearTimeout(timerId);
    }
  }, [resendCountdown]);

  const isVendor = accountType === "vendor";
  const authHomePath = isVendor ? "/vendor/login" : "/login";
  const authSignupPath = isVendor ? "/vendor/register" : "/signup";
  const brandLabel = isVendor ? "ServiceEase Vendors" : "ServiceEase";

  const getBackendAuthUrl = () => {
    return apiUrl(`/api/auth/${isVendor ? "vendor" : "customer"}`);
  };

  const postBackendAuth = async (body: unknown) => {
    const response = await fetch(getBackendAuthUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    let data: unknown;

    try {
      data = await response.json();
    } catch (jsonError) {
      const text = await response.text();
      throw new Error(
        `Authentication request failed: ${response.status} ${response.statusText} - ${text}`,
      );
    }

    if (!response.ok) {
      const payload = data as Record<string, string>;
      throw new Error(
        payload.error || payload.message || "Authentication request failed",
      );
    }

    return data;
  };
  const pageTitle =
    authPanel === "login"
      ? isVendor
        ? "Vendor sign in"
        : "Sign in to your account"
      : isVendor
        ? "Register your service business"
        : "Create your account";
  const pageDescription =
    authPanel === "login"
      ? isVendor
        ? "Access service listings, customer bookings, and order confirmations."
        : "Access bookings, service requests, and your customer profile."
      : isVendor
        ? "Register your service business to list services and manage orders."
        : "Register as a customer to book trusted services and manage orders.";
  const submitLabel = isLoading
    ? authPanel === "signup"
      ? "Creating account..."
      : !isOtpSent
        ? "Sending OTP..."
        : "Signing in..."
    : authPanel === "signup"
      ? isVendor
        ? "Register as vendor"
        : "Create account"
      : !isOtpSent
        ? "Send OTP"
        : isVendor
          ? "Vendor sign in"
          : "Customer sign in";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (authPanel === "login") {
      await handleLogin();
      return;
    }

    await handleSignup();
  };

  const handleLogin = async () => {
    setIsLoading(true);

    if (isOtpSent) {
      await verifyOtpCode();
    } else {
      await sendOtpCode();
    }
    setIsLoading(false);
  };

  const handleSignup = async () => {
    try {
      setIsLoading(true);
      await postBackendAuth({
        action: "signup",
        email,
        fullName,
        phone,
        businessName: isVendor ? businessName : undefined,
        serviceCategory: isVendor ? serviceCategory : undefined,
        serviceCity: isVendor ? serviceCity : undefined,
      });
      toast.success(
        "Account created. OTP sent to your email. Enter it below to complete login.",
      );
      setAuthPanel("login");
      setIsOtpSent(true);
      setResendCountdown(30);
      setFullName("");
      setBusinessName("");
      setServiceCategory("");
      setServiceCity("");
      setPhone("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtpCode = async (isResend = false) => {
    try {
      if (isResend) setIsResending(true);
      await postBackendAuth({
        action: "login",
        email,
      });
      setIsOtpSent(true);
      setResendCountdown(30);
      toast.success("OTP sent to your email");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send OTP",
      );
    } finally {
      if (isResend) setIsResending(false);
    }
  };

  const verifyOtpCode = async () => {
    try {
      const data = await postBackendAuth({
        action: "verify",
        email,
        otpCode,
      });
      if (data && typeof data === "object" && "user" in data) {
        const user = (
          data as {
            user: {
              id: string;
              email: string;
              role: string;
              name?: string;
              fullName?: string;
            };
          }
        ).user;

        const normalizedRole = user.role?.toLowerCase() ?? "";
        const expectedRole = isVendor ? "vendor" : "customer";
        if (normalizedRole !== expectedRole) {
          toast.error(
            `This email is registered as a ${normalizedRole}. Please use the ${normalizedRole} login page.`,
          );
          navigate(normalizedRole === "vendor" ? "/vendor/login" : "/login");
          return;
        }

        login({ ...user, role: normalizedRole });
      }
      toast.success(
        `Welcome back to ${isVendor ? "ServiceEase Vendors" : "ServiceEase"}!`,
      );
      navigate("/");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "OTP verification failed",
      );
    }
  };

  const switchPanel = (panel: AuthPanel) => {
    setAuthPanel(panel);
    setOtpCode("");
    setIsOtpSent(false);
    setResendCountdown(0);
  };

  return (
    <main className="grid flex-1 place-items-center bg-[linear-gradient(135deg,rgba(20,184,166,0.12),transparent_34%),linear-gradient(315deg,rgba(245,158,11,0.12),transparent_34%)] px-5 py-12">
      <section
        className="w-full max-w-140 rounded-lg border border-slate-200 bg-white p-8 text-left shadow-xl shadow-slate-200/70"
        aria-labelledby="auth-heading"
      >
        <div className="mb-7">
          <p
            className={`mb-2 text-sm font-bold uppercase ${
              isVendor ? "text-amber-700" : "text-teal-600"
            }`}
          >
            {brandLabel}
          </p>
          <h1
            id="auth-heading"
            className="mb-2 text-3xl font-bold text-slate-950"
          >
            {pageTitle}
          </h1>
          <p className="text-base text-slate-600">{pageDescription}</p>
        </div>

        <form className="grid gap-3" onSubmit={handleSubmit}>
          <div className="mb-2 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
            <Link
              to={authHomePath}
              onClick={() => switchPanel("login")}
              className={`min-h-10 rounded-md text-sm font-bold transition ${
                authPanel === "login"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-950"
              } grid place-items-center`}
            >
              Login
            </Link>
            <Link
              to={authSignupPath}
              onClick={() => switchPanel("signup")}
              className={`min-h-10 rounded-md text-sm font-bold transition ${
                authPanel === "signup"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-950"
              } grid place-items-center`}
            >
              Sign up
            </Link>
          </div>

          {authPanel === "signup" && (
            <>
              <label
                htmlFor="fullName"
                className="text-sm font-semibold text-slate-900"
              >
                {isVendor ? "Owner name" : "Full name"}
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                required
              />

              {isVendor && (
                <>
                  <label
                    htmlFor="businessName"
                    className="pt-1 text-sm font-semibold text-slate-900"
                  >
                    Business name
                  </label>
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    autoComplete="organization"
                    placeholder="Your service business"
                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                    className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                    required
                  />
                </>
              )}
            </>
          )}

          <label
            htmlFor="email"
            className="text-sm font-semibold text-slate-900"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={isVendor ? "business@example.com" : "you@example.com"}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            required
          />

          {authPanel === "signup" && (
            <>
              <label
                htmlFor="phone"
                className="pt-1 text-sm font-semibold text-slate-900"
              >
                Phone number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder={isVendor ? "Business phone" : "Your phone number"}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                required
              />

              {isVendor && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-3">
                    <label
                      htmlFor="serviceCategory"
                      className="pt-1 text-sm font-semibold text-slate-900"
                    >
                      Service category
                    </label>
                    <input
                      id="serviceCategory"
                      name="serviceCategory"
                      type="text"
                      placeholder="Cleaning, repairs, salon..."
                      value={serviceCategory}
                      onChange={(event) =>
                        setServiceCategory(event.target.value)
                      }
                      className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                      required
                    />
                  </div>

                  <div className="grid gap-3">
                    <label
                      htmlFor="serviceCity"
                      className="pt-1 text-sm font-semibold text-slate-900"
                    >
                      Service city
                    </label>
                    <input
                      id="serviceCity"
                      name="serviceCity"
                      type="text"
                      autoComplete="address-level2"
                      placeholder="City you serve"
                      value={serviceCity}
                      onChange={(event) => setServiceCity(event.target.value)}
                      className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                      required
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {authPanel === "login" && (
            <>
              {isOtpSent && (
                <>
                  <label
                    htmlFor="otp"
                    className="pt-1 text-sm font-semibold text-slate-900"
                  >
                    OTP code
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter the code from your email"
                    value={otpCode}
                    onChange={(event) => setOtpCode(event.target.value)}
                    className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                    required
                  />
                </>
              )}
              <p className="rounded-md bg-teal-50 px-3 py-2 text-sm leading-6 text-teal-800">
                {isOtpSent
                  ? "Check your email for the one-time sign-in code."
                  : "We will send a one-time sign-in code to your email address."}
              </p>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`mt-3 min-h-12 rounded-md px-4 font-bold transition disabled:cursor-not-allowed disabled:opacity-70 ${
              isVendor && authPanel === "signup"
                ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                : "bg-teal-600 text-white hover:bg-teal-700"
            }`}
          >
            {submitLabel}
          </button>

          {authPanel === "login" && isOtpSent && (
            <button
              type="button"
              onClick={() => sendOtpCode(true)}
              disabled={isLoading || isResending || resendCountdown > 0}
              className="min-h-11 rounded-md border border-slate-300 px-4 text-sm font-bold text-slate-700 transition hover:border-teal-600 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isResending
                ? "Sending..."
                : resendCountdown > 0
                  ? `Resend OTP in ${resendCountdown}s`
                  : "Resend OTP"}
            </button>
          )}
        </form>
      </section>
    </main>
  );
}

export default AuthPage;
