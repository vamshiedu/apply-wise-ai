import { useState, type FormEvent } from "react";
import api from "../api";
import {
  BriefcaseBusiness,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

type AuthResponse = {
  token: string;
  userId: number;
  name: string;
  email: string;
};

type AuthPageProps = {
  onAuthenticated: (response: AuthResponse) => void;
};

function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint =
        mode === "login" ? "/auth/login" : "/auth/register";

      const payload =
        mode === "login"
          ? { email: email.trim().toLowerCase(), password }
          : {
              name: name.trim(),
              email: email.trim().toLowerCase(),
              password,
            };

      const response = await api.post<AuthResponse>(endpoint, payload);

      // Save the JWT so api.ts can attach it to protected requests.
      localStorage.setItem("token", response.data.token);

      onAuthenticated(response.data);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.response?.status === 401
          ? "Invalid email or password."
          : err.response?.status === 409
          ? "An account with this email already exists."
          : "Could not authenticate. Please check the backend and try again.");

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode: "login" | "register") {
    setMode(nextMode);
    setError("");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden flex-1 flex-col justify-between bg-slate-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <BriefcaseBusiness size={20} />
          </div>
          <span className="text-xl font-semibold tracking-tight">ApplyWise</span>
        </div>

        <div className="max-w-lg">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
            Your career workspace
          </p>
          <h1 className="text-4xl font-semibold leading-tight">
            Make your job search more organized and less stressful.
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-300">
            Track applications, manage follow-ups, and keep every opportunity
            moving forward in one place.
          </p>
        </div>

        <p className="text-sm text-slate-400">
          Stay focused on your next opportunity.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              <BriefcaseBusiness size={18} />
            </div>
            <span className="text-lg font-semibold text-slate-900">
              ApplyWise
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
            <div className="mb-7">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {mode === "login"
                  ? "Sign in to continue to your workspace."
                  : "Start organizing your job search with ApplyWise."}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  mode === "login"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  mode === "register"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Create account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Full name
                  </label>
                  <div className="relative">
                    <UserRound
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-11 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {mode === "register" && (
                  <p className="mt-1.5 text-xs text-slate-400">
                    Use at least 8 characters.
                  </p>
                )}
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2.5 text-sm text-rose-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <LoaderCircle size={17} className="animate-spin" />}
                {loading
                  ? "Please wait..."
                  : mode === "login"
                  ? "Sign in"
                  : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
              Your account keeps your applications private and synced.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;