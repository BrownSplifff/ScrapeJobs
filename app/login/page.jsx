"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

function BriefcaseIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <path d="M2 13h20" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function EyeOpenIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function Spinner({ light = true }) {
  return (
    <svg
      className={`animate-spin h-4 w-4 ${light ? "text-white" : "text-gray-600"}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

const DOTS = [
  { top: "7%", left: "4%", size: "w-1 h-1", opacity: "opacity-20" },
  { top: "14%", left: "17%", size: "w-1.5 h-1.5", opacity: "opacity-10" },
  { top: "5%", left: "31%", size: "w-1 h-1", opacity: "opacity-15" },
  { top: "10%", left: "64%", size: "w-2 h-2", opacity: "opacity-10" },
  { top: "4%", left: "81%", size: "w-1 h-1", opacity: "opacity-20" },
  { top: "18%", left: "92%", size: "w-1 h-1", opacity: "opacity-10" },
  { top: "34%", left: "2%", size: "w-1.5 h-1.5", opacity: "opacity-10" },
  { top: "60%", left: "5%", size: "w-1 h-1", opacity: "opacity-15" },
  { top: "80%", left: "9%", size: "w-1.5 h-1.5", opacity: "opacity-10" },
  { top: "92%", left: "24%", size: "w-1 h-1", opacity: "opacity-10" },
  { top: "87%", left: "54%", size: "w-1 h-1", opacity: "opacity-15" },
  { top: "93%", left: "70%", size: "w-1.5 h-1.5", opacity: "opacity-10" },
  { top: "80%", left: "83%", size: "w-1 h-1", opacity: "opacity-10" },
  { top: "68%", left: "91%", size: "w-1 h-1", opacity: "opacity-15" },
  { top: "40%", left: "87%", size: "w-1.5 h-1.5", opacity: "opacity-10" },
];

export default function ScrapeJobsLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const router = useRouter();

  const handleSignIn = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLoading(false);
        router.push("/dashboard/landing");
        localStorage.setItem("token", data.user.token);
      }
      console.log(data);
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  const handleGoogle = async () => {
    try {
      setGoogleLoading(true);

      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      const token = await result.user.getIdToken();

      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      console.log(data);
    } catch (error) {
      console.error(error);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden bg-[#0d1b38]"
      style={{
        background:
          "linear-gradient(135deg, #0f1f3d 0%, #1a3260 45%, #0d1b38 100%)",
      }}
    >
      {/* Background dots */}
      {DOTS.map((dot, i) => (
        <span
          key={i}
          className={`absolute rounded-full bg-blue-400 pointer-events-none ${dot.size} ${dot.opacity}`}
          style={{ top: dot.top, left: dot.left }}
        />
      ))}

      {/* Radial glows */}
      <div
        className="absolute top-[8%] right-[6%] w-72 h-72 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[10%] left-[4%] w-56 h-56 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(96,165,250,0.10) 0%, transparent 70%)",
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[440px] bg-white rounded-2xl px-10 py-9 shadow-[0_24px_64px_rgba(0,0,0,0.28),0_4px_16px_rgba(0,0,0,0.12)] sm:px-10 px-6">
        {/* Header */}
        <div className="text-center mb-7">
          {/* Logo icon */}
          <div
            className="inline-flex items-center justify-center w-13 h-13 rounded-[14px] text-white mb-4 shadow-[0_4px_14px_rgba(37,99,235,0.32)]"
            style={{
              background: "linear-gradient(135deg, #1e40af, #2563eb)",
              width: 52,
              height: 52,
            }}
          >
            <BriefcaseIcon />
          </div>

          <h1 className="text-[26px] font-bold tracking-tight text-slate-900 mb-1">
            Scrape<span className="text-blue-600">Jobs</span>
          </h1>

          <p className="text-sm text-slate-500 mb-3">
            Discover jobs tailored to your skills.
          </p>

          {/* Social proof pill */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-medium rounded-full">
            <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor">
              <circle cx="5" cy="5" r="5" />
            </svg>
            Trusted by 12,000+ professionals
          </span>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              aria-label="Email address"
              className="w-full px-4 py-3 rounded-[10px] border border-gray-200 text-[15px] text-slate-800 placeholder-gray-400
                         outline-none transition-all duration-200
                         hover:border-gray-400
                         focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                aria-label="Password"
                className="w-full px-4 py-3 pr-11 rounded-[10px] border border-gray-200 text-[15px] text-slate-800 placeholder-gray-400
                           outline-none transition-all duration-200
                           hover:border-gray-400
                           focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-150"
              >
                {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                aria-label="Remember me"
                className="w-4 h-4 accent-blue-600 cursor-pointer rounded"
              />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <a
              href="#"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-150"
            >
              Forgot password?
            </a>
          </div>

          {/* Sign In button */}
          <button
            onClick={handleSignIn}
            disabled={loading}
            aria-label="Sign in"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-[10px] text-[15px] font-semibold text-white
                       transition-all duration-150
                       hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)]
                       active:translate-y-0
                       disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
          >
            {loading ? <Spinner light /> : "Sign In"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 py-0.5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 whitespace-nowrap">
              or continue with
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            aria-label="Continue with Google"
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-[10px] border border-gray-200 text-[15px] font-medium text-gray-700 bg-white
                       transition-all duration-150
                       hover:bg-slate-50 hover:border-gray-300 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]
                       active:translate-y-0
                       disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {googleLoading ? <Spinner light={false} /> : <GoogleIcon />}
            {googleLoading ? "Connecting…" : "Continue with Google"}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-gray-500">
          Don't have an account?{" "}
          <a
            href="/register"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-150"
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
