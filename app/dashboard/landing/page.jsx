"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  ClipboardList,
  User,
  Settings,
  Bell,
  Search,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  BookmarkPlus,
  ExternalLink,
  TrendingUp,
  CheckCircle2,
  MessageSquare,
  Menu,
  X,
  ChevronRight,
  Zap,
  Globe,
  Building2,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const STATS = [
  {
    label: "Total Jobs",
    value: "12,480",
    delta: "+340 today",
    icon: Briefcase,
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "Saved Jobs",
    value: "24",
    delta: "3 new",
    icon: Bookmark,
    color: "bg-violet-50 text-violet-600",
  },
  {
    label: "Applications",
    value: "8",
    delta: "2 this week",
    icon: ClipboardList,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Interviews",
    value: "2",
    delta: "Next: Tue",
    icon: MessageSquare,
    color: "bg-amber-50 text-amber-600",
  },
];

const FILTERS = [
  "All",
  "Remote",
  "Full Time",
  "Part Time",
  "Internship",
  "Contract",
];

const JOBS = [
  {
    id: 1,
    title: "Senior Frontend Engineer",
    company: "Vercel",
    logo: "V",
    logoColor: "bg-black text-white",
    location: "Remote · US",
    salary: "$160k – $210k",
    type: "Full Time",
    remote: true,
    posted: "2h ago",
    desc: "Own the performance and developer experience of our core web platform. You'll work directly with design and infra to ship features used by millions of developers worldwide.",
    tags: ["React", "TypeScript", "Next.js"],
  },
  {
    id: 2,
    title: "Product Designer",
    company: "Linear",
    logo: "L",
    logoColor: "bg-[#5E6AD2] text-white",
    location: "San Francisco, CA",
    salary: "$140k – $180k",
    type: "Full Time",
    remote: false,
    posted: "5h ago",
    desc: "Shape the design language of the most beloved project management tool in the industry. You'll own end-to-end product design across web, mobile, and API.",
    tags: ["Figma", "Design Systems", "Prototyping"],
  },
  {
    id: 3,
    title: "Machine Learning Engineer",
    company: "Anthropic",
    logo: "A",
    logoColor: "bg-[#CC785C] text-white",
    location: "Remote · Global",
    salary: "$200k – $280k",
    type: "Full Time",
    remote: true,
    posted: "1d ago",
    desc: "Work on safety-critical ML systems and contribute to alignment research at one of the world's most impactful AI labs. Strong Python and distributed systems background required.",
    tags: ["Python", "PyTorch", "RLHF"],
  },
  {
    id: 4,
    title: "Backend Engineer — Payments",
    company: "Stripe",
    logo: "S",
    logoColor: "bg-[#635BFF] text-white",
    location: "New York, NY",
    salary: "$170k – $230k",
    type: "Full Time",
    remote: false,
    posted: "1d ago",
    desc: "Build the financial infrastructure that powers millions of businesses. You'll design APIs for global payments, fraud detection, and reconciliation at massive scale.",
    tags: ["Go", "Distributed Systems", "APIs"],
  },
  {
    id: 5,
    title: "DevOps / Platform Engineer",
    company: "Notion",
    logo: "N",
    logoColor: "bg-slate-900 text-white",
    location: "Remote · US",
    salary: "$150k – $190k",
    type: "Full Time",
    remote: true,
    posted: "2d ago",
    desc: "Design and operate the infrastructure powering 30M+ users. You'll own our Kubernetes platform, CI/CD pipelines, and on-call reliability culture.",
    tags: ["Kubernetes", "Terraform", "AWS"],
  },
  {
    id: 6,
    title: "Growth Marketing Intern",
    company: "Figma",
    logo: "F",
    logoColor: "bg-[#F24E1E] text-white",
    location: "Remote",
    salary: "$35 – $45 / hr",
    type: "Internship",
    remote: true,
    posted: "3d ago",
    desc: "Drive top-of-funnel growth experiments across paid, SEO, and lifecycle channels. You'll run A/B tests, analyse cohort data, and present weekly findings to leadership.",
    tags: ["Analytics", "SEO", "A/B Testing"],
  },
  {
    id: 7,
    title: "Technical Recruiter",
    company: "GitHub",
    logo: "G",
    logoColor: "bg-slate-800 text-white",
    location: "Austin, TX",
    salary: "$90k – $120k",
    type: "Full Time",
    remote: false,
    posted: "3d ago",
    desc: "Source and close world-class engineering talent to grow our developer tooling teams. You'll own pipelines for staff and principal engineers across infrastructure and security.",
    tags: ["Recruiting", "Technical Sourcing", "ATS"],
  },
  {
    id: 8,
    title: "iOS Engineer",
    company: "Airbnb",
    logo: "A",
    logoColor: "bg-[#FF5A5F] text-white",
    location: "Remote · US/Canada",
    salary: "$155k – $200k",
    type: "Contract",
    remote: true,
    posted: "4d ago",
    desc: "Deliver beautiful, high-performance native experiences for millions of guests and hosts. You'll own features end-to-end, from Swift code to App Store release.",
    tags: ["Swift", "SwiftUI", "iOS"],
  },
];

const TYPE_COLORS = {
  "Full Time": "bg-blue-50 text-blue-700",
  "Part Time": "bg-violet-50 text-violet-700",
  Internship: "bg-amber-50 text-amber-700",
  Contract: "bg-rose-50 text-rose-700",
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, delta, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-start gap-4">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
      >
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <div>
        <p className="text-[12px] font-medium text-slate-400 uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p className="text-2xl font-bold text-slate-900 leading-none mb-1">
          {value}
        </p>
        <p className="text-[11.5px] text-emerald-600 font-medium flex items-center gap-1">
          <TrendingUp size={11} />
          {delta}
        </p>
      </div>
    </div>
  );
}

function JobCard({ job, saved, onSave }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      <div className="p-5 flex-1">
        {/* Top row */}
        <div className="flex items-start gap-3 mb-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold flex-shrink-0 ${job.logoColor}`}
          >
            {job.logo}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-semibold text-slate-900 leading-snug truncate">
              {job.title}
            </h3>
            <p className="text-[12.5px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Building2 size={11} />
              {job.company}
            </p>
          </div>
          <button
            onClick={() => onSave(job.id)}
            className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-150
              ${
                saved
                  ? "bg-blue-50 border-blue-200 text-blue-600"
                  : "bg-white border-slate-200 text-slate-400 hover:border-blue-200 hover:text-blue-500"
              }`}
            aria-label="Save job"
          >
            <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${TYPE_COLORS[job.type] || "bg-slate-50 text-slate-600"}`}
          >
            {job.type}
          </span>
          {job.remote && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-teal-50 text-teal-700">
              <Globe size={9} /> Remote
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-[12.5px] text-slate-500 leading-relaxed line-clamp-2 mb-3.5">
          {job.desc}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {job.tags.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 text-[11px] font-medium bg-slate-50 text-slate-600 rounded-md border border-slate-100"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Footer meta */}
        <div className="flex flex-wrap items-center gap-3 text-[11.5px] text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            {job.location}
          </span>
          <span className="flex items-center gap-1">
            <DollarSign size={11} />
            {job.salary}
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Clock size={11} />
            {job.posted}
          </span>
        </div>
      </div>

      {/* Apply button */}
      <div className="px-5 pb-4">
        <button
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-150
            hover:shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:-translate-y-px active:translate-y-0"
          style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}
        >
          Apply Now <ExternalLink size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function ScrapeJobsDashboard() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [savedJobs, setSavedJobs] = useState(new Set([2, 5]));
  const [search, setSearch] = useState("");

  const toggleSave = (id) => {
    setSavedJobs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredJobs = JOBS.filter((job) => {
    const matchFilter =
      activeFilter === "All" ||
      (activeFilter === "Remote" && job.remote) ||
      job.type === activeFilter;

    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.tags.some((t) => t.toLowerCase().includes(q));

    return matchFilter && matchSearch;
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-sm border-b border-slate-100 px-5 lg:px-8 py-3.5 flex items-center gap-4">
          <button className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 transition-colors">
            <Menu size={17} />
          </button>

          <div>
            <p className="text-[11.5px] text-slate-400 font-medium">
              Monday, 16 June
            </p>
            <h1 className="text-[17px] font-bold text-slate-900 leading-tight">
              Welcome back, Adi 👋
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            {/* Notification bell */}
            <button className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 transition-colors">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 border-2 border-white" />
            </button>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
              AD
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 px-5 lg:px-8 py-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs, companies, skills..."
              className="w-full pl-11 pr-5 py-3.5 bg-white rounded-2xl border border-slate-200 text-[14px] text-slate-800 placeholder-slate-400
                outline-none transition-all duration-200
                hover:border-slate-300
                focus:border-blue-400 focus:ring-[3px] focus:ring-blue-500/10
                shadow-sm"
            />
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 border
                  ${
                    activeFilter === f
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
              >
                {f}
              </button>
            ))}
            <span className="ml-auto text-[12px] text-slate-400 font-medium">
              {filteredJobs.length} result{filteredJobs.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Job grid */}
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pb-6">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  saved={savedJobs.has(job.id)}
                  onSave={toggleSave}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Search size={22} className="text-slate-400" />
              </div>
              <p className="text-[15px] font-semibold text-slate-700 mb-1">
                No jobs found
              </p>
              <p className="text-[13px] text-slate-400">
                Try a different keyword or filter.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
