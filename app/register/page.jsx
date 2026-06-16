"use client";
import { useState } from "react";
import {
  confirmPasswordReset,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

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

function CheckIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
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
  { top: "5%", left: "3%", size: "w-1 h-1", opacity: "opacity-20" },
  { top: "12%", left: "16%", size: "w-1.5 h-1.5", opacity: "opacity-10" },
  { top: "4%", left: "30%", size: "w-1 h-1", opacity: "opacity-15" },
  { top: "9%", left: "62%", size: "w-2 h-2", opacity: "opacity-10" },
  { top: "3%", left: "80%", size: "w-1 h-1", opacity: "opacity-20" },
  { top: "17%", left: "91%", size: "w-1 h-1", opacity: "opacity-10" },
  { top: "33%", left: "2%", size: "w-1.5 h-1.5", opacity: "opacity-10" },
  { top: "58%", left: "4%", size: "w-1 h-1", opacity: "opacity-15" },
  { top: "79%", left: "8%", size: "w-1.5 h-1.5", opacity: "opacity-10" },
  { top: "91%", left: "23%", size: "w-1 h-1", opacity: "opacity-10" },
  { top: "86%", left: "53%", size: "w-1 h-1", opacity: "opacity-15" },
  { top: "94%", left: "69%", size: "w-1.5 h-1.5", opacity: "opacity-10" },
  { top: "81%", left: "82%", size: "w-1 h-1", opacity: "opacity-10" },
  { top: "67%", left: "90%", size: "w-1 h-1", opacity: "opacity-15" },
  { top: "41%", left: "88%", size: "w-1.5 h-1.5", opacity: "opacity-10" },
];

// Password strength rules
const RULES = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
];

function PasswordStrength({ password }) {
  if (!password) return null;
  const passed = RULES.filter((r) => r.test(password)).length;
  const colors = ["bg-red-400", "bg-amber-400", "bg-emerald-500"];
  const barColor = colors[passed - 1] ?? "bg-gray-200";

  return (
    <div className="mt-2.5 space-y-2">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < passed ? barColor : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      {/* Rules */}
      <ul className="space-y-1">
        {RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <li key={rule.label} className="flex items-center gap-1.5">
              <span
                className={`flex items-center justify-center w-4 h-4 rounded-full transition-colors duration-200 ${
                  ok ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-400"
                }`}
              >
                <CheckIcon />
              </span>
              <span
                className={`text-[12px] transition-colors duration-200 ${ok ? "text-emerald-600" : "text-gray-400"}`}
              >
                {rule.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function ScrapeJobsSignup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSignUp = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      });
      const data = await res.json();
      console.log(data);
      if (data.success) {
        router.push("/login");
        setError("");
      } else {
        setError("User Already Exists");
      }
    } catch (error) {
      console.log(error);
      setError(error);
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
      console.log("User: ", result.user);
      router.push("/login");
    } catch (error) {
      console.error("google signin error: ", error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-[10px] border border-gray-200 text-[15px] text-slate-800 placeholder-gray-400 " +
    "outline-none transition-all duration-200 hover:border-gray-400 " +
    "focus:border-blue-500 focus:ring-[3px] focus:ring-blue-500/10";

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden"
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
      <div className="relative z-10 w-full max-w-[440px] bg-white rounded-2xl px-10 py-9 shadow-[0_24px_64px_rgba(0,0,0,0.28),0_4px_16px_rgba(0,0,0,0.12)]">
        {/* Header */}
        <div className="text-center mb-7">
          <div
            className="inline-flex items-center justify-center rounded-[14px] text-white mb-4 shadow-[0_4px_14px_rgba(37,99,235,0.32)]"
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
            Create your account and start exploring.
          </p>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-medium rounded-full">
            <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor">
              <circle cx="5" cy="5" r="5" />
            </svg>
            Free forever · No credit card needed
          </span>
        </div>

        {/* Google button — shown first on signup */}
        <div className="mb-5">
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            aria-label="Sign up with Google"
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-[10px] border border-gray-200 text-[15px] font-medium text-gray-700 bg-white
                       transition-all duration-150
                       hover:bg-slate-50 hover:border-gray-300 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]
                       active:translate-y-0
                       disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {googleLoading ? <Spinner light={false} /> : <GoogleIcon />}
            {googleLoading ? "Connecting…" : "Sign up with Google"}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 whitespace-nowrap">
            or sign up with email
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          {/* Full name */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Smith"
              autoComplete="name"
              aria-label="Full name"
              className={inputClass}
            />
          </div>

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
              className={inputClass}
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
                placeholder="Create a password"
                autoComplete="new-password"
                aria-label="Password"
                className={`${inputClass} pr-11`}
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

            <PasswordStrength password={password} />
          </div>

          {/* Terms checkbox */}
          <div className="pt-0.5">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                aria-label="Agree to terms"
                className="mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer rounded flex-shrink-0"
              />
              <span className="text-sm text-gray-600 leading-snug">
                I agree to the{" "}
                <a
                  href="#"
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-150"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-150"
                >
                  Privacy Policy
                </a>
              </span>
            </label>
          </div>

          {/* Create Account button */}
          <button
            onClick={handleSignUp}
            disabled={loading || !agreed}
            aria-label="Create account"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-[10px] text-[15px] font-semibold text-white
                       transition-all duration-150
                       hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)]
                       active:translate-y-0
                       disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
          >
            {loading ? <Spinner light /> : "Create Account"}
          </button>
        </div>

        <div className="text-red-600 mt-2 text-center">{error}</div>

        {/* Footer */}
        <p className="text-center mt-4 text-sm text-gray-500">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-150"
          >
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
