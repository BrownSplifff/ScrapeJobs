"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  ClipboardList,
  User,
  Settings,
  ChevronRight,
  Zap,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/landing" },
  { icon: Briefcase, label: "Jobs", href: "/dashboard/jobs" },
  { icon: Bookmark, label: "Saved Jobs", href: "/saved" },
  { icon: ClipboardList, label: "Applied Jobs", href: "/applied" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-slate-100
          flex flex-col transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg text-white"
            style={{ background: "linear-gradient(135deg,#1e40af,#2563eb)" }}
          >
            <Zap size={15} strokeWidth={2.5} />
          </div>

          <span className="text-[15px] font-bold text-slate-900 tracking-tight">
            Scrape<span className="text-blue-600">Jobs</span>
          </span>

          <button
            className="ml-auto lg:hidden text-slate-400 hover:text-slate-600"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
            const active = pathname === href;

            return (
              <Link
                key={label}
                href={href}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                  text-[13.5px] font-medium transition-all duration-150
                  ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }
                `}
              >
                <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />

                {label}

                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="px-3 pb-4">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
              AD
            </div>

            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-slate-800 truncate">
                Adi Dev
              </p>

              <p className="text-[11px] text-slate-400 truncate">
                adi@example.com
              </p>
            </div>

            <ChevronRight
              size={14}
              className="ml-auto text-slate-300 flex-shrink-0"
            />
          </div>
        </div>
      </aside>
    </>
  );
}
