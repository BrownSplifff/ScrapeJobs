"use client";

import { useState, useRef, useCallback } from "react";
import {
  Search,
  Upload,
  FileText,
  X,
  Bookmark,
  ExternalLink,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Globe,
  SlidersHorizontal,
  Briefcase,
  Zap,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_JOBS = [
  {
    id: 1,
    title: "Senior Frontend Engineer",
    company: "Vercel",
    logo: "V",
    logoBg: "#000000",
    logoFg: "#ffffff",
    location: "Remote · US",
    locationType: "Remote",
    salary: "$160k – $210k",
    salaryMin: 160,
    salaryMax: 210,
    type: "Full Time",
    experience: "Senior Level",
    posted: "2h ago",
    desc: "Own the performance and DX of our core web platform. Work directly with design and infra to ship features used by millions of developers worldwide.",
    skills: ["React", "TypeScript", "Next.js", "Webpack"],
  },
  {
    id: 2,
    title: "Product Designer",
    company: "Linear",
    logo: "L",
    logoBg: "#5E6AD2",
    logoFg: "#ffffff",
    location: "San Francisco, CA",
    locationType: "Onsite",
    salary: "$140k – $180k",
    salaryMin: 140,
    salaryMax: 180,
    type: "Full Time",
    experience: "Mid Level",
    posted: "5h ago",
    desc: "Shape the design language of the most beloved project tool in the industry. Own end-to-end product design across web, mobile, and API surfaces.",
    skills: ["Figma", "Design Systems", "Prototyping", "User Research"],
  },
  {
    id: 3,
    title: "Machine Learning Engineer",
    company: "Anthropic",
    logo: "A",
    logoBg: "#CC785C",
    logoFg: "#ffffff",
    location: "Remote · Global",
    locationType: "Remote",
    salary: "$200k – $280k",
    salaryMin: 200,
    salaryMax: 280,
    type: "Full Time",
    experience: "Senior Level",
    posted: "1d ago",
    desc: "Work on safety-critical ML systems at one of the world's most impactful AI labs. Strong Python and distributed systems background required.",
    skills: ["Python", "PyTorch", "RLHF", "Transformers"],
  },
  {
    id: 4,
    title: "Backend Engineer — Payments",
    company: "Stripe",
    logo: "S",
    logoBg: "#635BFF",
    logoFg: "#ffffff",
    location: "New York, NY",
    locationType: "Hybrid",
    salary: "$170k – $230k",
    salaryMin: 170,
    salaryMax: 230,
    type: "Full Time",
    experience: "Senior Level",
    posted: "1d ago",
    desc: "Build the financial infrastructure powering millions of businesses. Design APIs for global payments, fraud detection, and reconciliation at massive scale.",
    skills: ["Go", "Distributed Systems", "gRPC", "PostgreSQL"],
  },
  {
    id: 5,
    title: "DevOps / Platform Engineer",
    company: "Notion",
    logo: "N",
    logoBg: "#1a1a1a",
    logoFg: "#ffffff",
    location: "Remote · US",
    locationType: "Remote",
    salary: "$150k – $190k",
    salaryMin: 150,
    salaryMax: 190,
    type: "Full Time",
    experience: "Mid Level",
    posted: "2d ago",
    desc: "Design and operate the infrastructure powering 30M+ users. Own our Kubernetes platform, CI/CD pipelines, and on-call reliability culture.",
    skills: ["Kubernetes", "Terraform", "AWS", "Datadog"],
  },
  {
    id: 6,
    title: "Growth Marketing Intern",
    company: "Figma",
    logo: "F",
    logoBg: "#F24E1E",
    logoFg: "#ffffff",
    location: "Remote",
    locationType: "Remote",
    salary: "$35 – $45 / hr",
    salaryMin: 70,
    salaryMax: 90,
    type: "Internship",
    experience: "Entry Level",
    posted: "3d ago",
    desc: "Drive top-of-funnel growth experiments across paid, SEO, and lifecycle channels. Run A/B tests and analyse cohort data weekly with leadership.",
    skills: ["Analytics", "SEO", "A/B Testing", "SQL"],
  },
  {
    id: 7,
    title: "iOS Engineer",
    company: "Airbnb",
    logo: "A",
    logoBg: "#FF5A5F",
    logoFg: "#ffffff",
    location: "Remote · US/Canada",
    locationType: "Remote",
    salary: "$155k – $200k",
    salaryMin: 155,
    salaryMax: 200,
    type: "Contract",
    experience: "Mid Level",
    posted: "4d ago",
    desc: "Deliver beautiful, high-performance native experiences for millions of guests and hosts. Own features end-to-end from Swift code to App Store release.",
    skills: ["Swift", "SwiftUI", "Xcode", "iOS"],
  },
  {
    id: 8,
    title: "Data Analyst",
    company: "Shopify",
    logo: "S",
    logoBg: "#96BF48",
    logoFg: "#ffffff",
    location: "Toronto, ON (Hybrid)",
    locationType: "Hybrid",
    salary: "$90k – $120k",
    salaryMin: 90,
    salaryMax: 120,
    type: "Full Time",
    experience: "Entry Level",
    posted: "5d ago",
    desc: "Turn merchant data into actionable insights that drive platform growth. Build dashboards, run cohort analyses, and partner closely with product teams.",
    skills: ["SQL", "Python", "Looker", "dbt"],
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const JOB_TYPES = ["Full Time", "Part Time", "Internship", "Contract"];
const LOCATIONS = ["Remote", "Hybrid", "Onsite"];
const EXPERIENCE = ["Entry Level", "Mid Level", "Senior Level"];
const SALARY_MARKS = [0, 50, 100, 150, 200, 250, 300];

const TYPE_STYLES = {
  "Full Time": "bg-blue-50 text-blue-700",
  "Part Time": "bg-violet-50 text-violet-700",
  Internship: "bg-amber-50 text-amber-700",
  Contract: "bg-rose-50 text-rose-700",
};

const LOC_STYLES = {
  Remote: "bg-teal-50 text-teal-700",
  Hybrid: "bg-orange-50 text-orange-700",
  Onsite: "bg-slate-100 text-slate-600",
};

// ─── FilterSection ────────────────────────────────────────────────────────────

// function FilterSection({ title, children, defaultOpen = true }) {
//   const [open, setOpen] = useState(defaultOpen);
//   return (
//     <div className="border-b border-slate-100 last:border-0">
//       <button
//         onClick={() => setOpen((v) => !v)}
//         className="w-full flex items-center justify-between py-3.5 text-left group"
//       >
//         <span className="text-[12.5px] font-semibold text-slate-500 uppercase tracking-wider">
//           {title}
//         </span>
//         {open ? (
//           <ChevronUp
//             size={13}
//             className="text-slate-400 group-hover:text-slate-600 transition-colors"
//           />
//         ) : (
//           <ChevronDown
//             size={13}
//             className="text-slate-400 group-hover:text-slate-600 transition-colors"
//           />
//         )}
//       </button>
//       {open && <div className="pb-4 space-y-2.5">{children}</div>}
//     </div>
//   );
// }

// ─── FilterCheckbox ───────────────────────────────────────────────────────────

// function FilterCheckbox({ label, checked, onChange }) {
//   return (
//     <label className="flex items-center gap-2.5 cursor-pointer group">
//       <div
//         className={`w-4 h-4 rounded-[4px] border flex items-center justify-center flex-shrink-0 transition-all duration-150
//           ${
//             checked
//               ? "bg-blue-600 border-blue-600"
//               : "border-slate-300 bg-white group-hover:border-blue-400"
//           }`}
//         onClick={onChange}
//       >
//         {checked && (
//           <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
//             <path
//               d="M1 3.5L3.5 6L8 1"
//               stroke="white"
//               strokeWidth="1.5"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//           </svg>
//         )}
//       </div>
//       <span
//         className={`text-[13px] transition-colors duration-150 ${checked ? "text-slate-900 font-medium" : "text-slate-600 group-hover:text-slate-800"}`}
//       >
//         {label}
//       </span>
//     </label>
//   );
// }

// ─── FilterSidebar ────────────────────────────────────────────────────────────

// function FilterSidebar({ filters, onChange, onClear, activeCount }) {
//   const toggle = (key, value) => {
//     const set = new Set(filters[key]);
//     set.has(value) ? set.delete(value) : set.add(value);
//     onChange({ ...filters, [key]: set });
//   };

//   return (
//     <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
//       {/* Header */}
//       <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
//         <div className="flex items-center gap-2">
//           <SlidersHorizontal size={14} className="text-slate-500" />
//           <span className="text-[13.5px] font-semibold text-slate-800">
//             Filters
//           </span>
//           {activeCount > 0 && (
//             <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
//               {activeCount}
//             </span>
//           )}
//         </div>
//         {activeCount > 0 && (
//           <button
//             onClick={onClear}
//             className="flex items-center gap-1 text-[11.5px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
//           >
//             <RotateCcw size={11} />
//             Clear
//           </button>
//         )}
//       </div>

//       <div className="px-5 divide-y divide-slate-100">
//         <FilterSection title="Job Type">
//           {JOB_TYPES.map((t) => (
//             <FilterCheckbox
//               key={t}
//               label={t}
//               checked={filters.types.has(t)}
//               onChange={() => toggle("types", t)}
//             />
//           ))}
//         </FilterSection>

//         <FilterSection title="Location">
//           {LOCATIONS.map((l) => (
//             <FilterCheckbox
//               key={l}
//               label={l}
//               checked={filters.locations.has(l)}
//               onChange={() => toggle("locations", l)}
//             />
//           ))}
//         </FilterSection>

//         <FilterSection title="Experience Level">
//           {EXPERIENCE.map((e) => (
//             <FilterCheckbox
//               key={e}
//               label={e}
//               checked={filters.experience.has(e)}
//               onChange={() => toggle("experience", e)}
//             />
//           ))}
//         </FilterSection>

//         <FilterSection title="Salary Range">
//           <div className="space-y-3">
//             <div className="flex items-center justify-between text-[11.5px] text-slate-500 font-medium">
//               <span>${filters.salaryMin}k</span>
//               <span>
//                 ${filters.salaryMax === 300 ? "300k+" : `${filters.salaryMax}k`}
//               </span>
//             </div>
//             <div className="relative">
//               <div className="h-1.5 bg-slate-100 rounded-full relative">
//                 <div
//                   className="absolute h-full bg-blue-500 rounded-full"
//                   style={{
//                     left: `${(filters.salaryMin / 300) * 100}%`,
//                     right: `${100 - (filters.salaryMax / 300) * 100}%`,
//                   }}
//                 />
//               </div>
//               {/* Min thumb */}
//               <input
//                 type="range"
//                 min={0}
//                 max={300}
//                 step={10}
//                 value={filters.salaryMin}
//                 onChange={(e) => {
//                   const v = Math.min(
//                     Number(e.target.value),
//                     filters.salaryMax - 10,
//                   );
//                   onChange({ ...filters, salaryMin: v });
//                 }}
//                 className="absolute inset-0 w-full opacity-0 cursor-pointer h-1.5"
//                 style={{ zIndex: filters.salaryMin > 250 ? 5 : 3 }}
//               />
//               {/* Max thumb */}
//               <input
//                 type="range"
//                 min={0}
//                 max={300}
//                 step={10}
//                 value={filters.salaryMax}
//                 onChange={(e) => {
//                   const v = Math.max(
//                     Number(e.target.value),
//                     filters.salaryMin + 10,
//                   );
//                   onChange({ ...filters, salaryMax: v });
//                 }}
//                 className="absolute inset-0 w-full opacity-0 cursor-pointer h-1.5"
//                 style={{ zIndex: 4 }}
//               />
//             </div>
//             <div className="flex justify-between">
//               {SALARY_MARKS.map((m) => (
//                 <span key={m} className="text-[9px] text-slate-300">
//                   {m === 0 ? "$0" : m === 300 ? "300+" : m}
//                 </span>
//               ))}
//             </div>
//           </div>
//         </FilterSection>
//       </div>

//       {/* Clear all */}
//       <div className="px-5 py-4">
//         <button
//           onClick={onClear}
//           className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-600
//             hover:bg-slate-50 hover:border-slate-300 transition-all duration-150"
//         >
//           <RotateCcw size={13} />
//           Clear All Filters
//         </button>
//       </div>
//     </div>
//   );
// }

// ─── ResumeUpload ─────────────────────────────────────────────────────────────

function ResumeUpload({ file, onFile }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const accept = ".pdf,.doc,.docx";

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files?.[0];
      if (f) onFile(f);
    },
    [onFile],
  );

  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !file && inputRef.current?.click()}
      className={`relative rounded-2xl border-2 border-dashed transition-all duration-200
        ${
          file
            ? "border-blue-200 bg-blue-50/40 cursor-default"
            : dragging
              ? "border-blue-400 bg-blue-50 cursor-copy scale-[1.01]"
              : "border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer"
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />

      {file ? (
        /* Uploaded state */
        <div className="flex items-center gap-4 px-5 py-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <FileText size={18} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-semibold text-slate-800 truncate">
              {file.name}
            </p>
            <p className="text-[11.5px] text-slate-400 mt-0.5">
              {(file.size / 1024).toFixed(0)} KB · Resume uploaded
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <svg width="9" height="9" viewBox="0 0 12 12" fill="currentColor">
                <path
                  d="M10 3L5 8.5 2 5.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Ready
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFile(null);
              }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-200
            ${dragging ? "bg-blue-100 scale-110" : "bg-slate-100"}`}
          >
            <Upload
              size={20}
              className={dragging ? "text-blue-600" : "text-slate-400"}
            />
          </div>
          <p className="text-[14px] font-semibold text-slate-700 mb-1">
            {dragging ? "Drop to upload" : "Upload Resume"}
          </p>
          <p className="text-[12px] text-slate-400 mb-4 max-w-xs leading-relaxed">
            Upload your resume and we'll extract skills to find matching jobs.
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-[12.5px] font-semibold text-slate-700
              hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-all duration-150 shadow-sm"
          >
            Choose File
          </button>
          <p className="mt-2.5 text-[10.5px] text-slate-300 font-medium">
            PDF, DOC, DOCX · Max 10MB
          </p>
        </div>
      )}
    </div>
  );
}

// ─── JobCard ──────────────────────────────────────────────────────────────────

function JobCard({ job, saved, onSave }) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 p-5">
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-[14px] font-bold flex-shrink-0 shadow-sm"
          style={{ background: job.logoBg, color: job.logoFg }}
        >
          {job.logo}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="min-w-0">
              <h3 className="text-[14.5px] font-semibold text-slate-900 leading-snug truncate group-hover:text-blue-700 transition-colors duration-150">
                {job.title}
              </h3>
              <p className="text-[12.5px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Building2 size={11} className="flex-shrink-0" />
                {job.company}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onSave(job.id)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-150
                  ${
                    saved
                      ? "bg-blue-50 border-blue-200 text-blue-600"
                      : "bg-white border-slate-200 text-slate-400 hover:border-blue-200 hover:text-blue-500 hover:bg-blue-50"
                  }`}
                aria-label="Save job"
              >
                <Bookmark size={13} fill={saved ? "currentColor" : "none"} />
              </button>
              <button
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold text-white transition-all duration-150
                  hover:shadow-[0_3px_12px_rgba(37,99,235,0.35)] hover:-translate-y-px active:translate-y-0"
                style={{
                  background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                }}
              >
                Apply <ExternalLink size={10} />
              </button>
            </div>
          </div>

          {/* Meta chips */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${TYPE_STYLES[job.type] || "bg-slate-50 text-slate-600"}`}
            >
              {job.type}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${LOC_STYLES[job.locationType] || "bg-slate-50 text-slate-600"}`}
            >
              {job.locationType === "Remote" && <Globe size={9} />}
              {job.locationType}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-50 text-slate-500">
              {job.experience}
            </span>
          </div>

          {/* Description */}
          <p className="text-[12.5px] text-slate-500 leading-relaxed line-clamp-2 mb-3">
            {job.desc}
          </p>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {job.skills.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 text-[11px] font-medium bg-slate-50 text-slate-600 rounded-md border border-slate-100"
              >
                {s}
              </span>
            ))}
          </div>

          {/* Footer meta */}
          <div className="flex flex-wrap items-center gap-4 text-[11.5px] text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin size={11} className="flex-shrink-0" /> {job.location}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign size={11} className="flex-shrink-0" /> {job.salary}
            </span>
            <span className="flex items-center gap-1 ml-auto">
              <Clock size={11} className="flex-shrink-0" /> {job.posted}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ hasQuery, onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-2">
          <Briefcase size={32} className="text-slate-300" />
        </div>
        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center">
          <Search size={12} className="text-blue-400" />
        </div>
      </div>

      <h3 className="text-[17px] font-bold text-slate-800 mb-2">
        Start Scraping
      </h3>
      <p className="text-[13px] text-slate-400 max-w-xs leading-relaxed mb-6">
        {hasQuery
          ? "No jobs match your current filters. Try adjusting your search or clearing some filters."
          : "Upload your resume or enter keywords above to discover matching jobs."}
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={onReset}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-600
            hover:bg-slate-50 hover:border-slate-300 transition-all duration-150"
        >
          Clear Filters
        </button>
        <button
          className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-150
            hover:shadow-[0_4px_14px_rgba(37,99,235,0.35)] hover:-translate-y-px active:translate-y-0"
          style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}
        >
          Find Jobs
        </button>
      </div>
    </div>
  );
}

// ─── MobileFilterDrawer ───────────────────────────────────────────────────────

function MobileFilterDrawer({ open, onClose, children }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <span className="text-[14px] font-bold text-slate-900">Filters</span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X size={15} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </>
  );
}

// ─── Default filter state ─────────────────────────────────────────────────────

const DEFAULT_FILTERS = {
  types: new Set(),
  locations: new Set(),
  experience: new Set(),
  salaryMin: 0,
  salaryMax: 300,
};

function countActiveFilters(f) {
  return (
    f.types.size +
    f.locations.size +
    f.experience.size +
    (f.salaryMin > 0 || f.salaryMax < 300 ? 1 : 0)
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ScrapeJobsJobsPage() {
  const [query, setQuery] = useState("");
  const [resume, setResume] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [savedJobs, setSavedJobs] = useState(new Set([2, 5]));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scraped, setScraped] = useState(true); // true = show jobs by default

  const clearFilters = () => setFilters(DEFAULT_FILTERS);
  const activeCount = countActiveFilters(filters);

  const toggleSave = (id) => {
    setSavedJobs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Apply filters + search
  const filteredJobs = MOCK_JOBS.filter((job) => {
    if (filters.types.size && !filters.types.has(job.type)) return false;
    if (filters.locations.size && !filters.locations.has(job.locationType))
      return false;
    if (filters.experience.size && !filters.experience.has(job.experience))
      return false;
    if (job.salaryMin < filters.salaryMin || job.salaryMax > filters.salaryMax)
      return false;

    const q = query.trim().toLowerCase();
    if (q) {
      const haystack =
        `${job.title} ${job.company} ${job.skills.join(" ")}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const showJobs =
    scraped && (filteredJobs.length > 0 || query || activeCount > 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {/* <FilterSidebar
          filters={filters}
          onChange={setFilters}
          onClear={clearFilters}
          activeCount={activeCount}
        /> */}
      </MobileFilterDrawer>

      <div className="flex min-h-screen">
        {/* ── Left Sidebar (desktop) ────────────────────────────────── */}
        {/* <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0 p-6 sticky top-0 h-screen overflow-y-auto">
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onClear={clearFilters}
            activeCount={activeCount}
          />
        </aside> */}

        {/* ── Main Content ──────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Page heading */}
          <div className="mb-7">
            <div className="flex items-center justify-between gap-4 mb-1">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Jobs
              </h1>

              {/* Mobile filter button */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-[12.5px] font-medium text-slate-600
                  hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
              >
                <SlidersHorizontal size={13} />
                Filters
                {activeCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </button>
            </div>
            <p className="text-[13.5px] text-slate-400 leading-relaxed">
              Upload your resume or search with keywords to discover relevant
              opportunities.
            </p>
          </div>

          {/* Resume Upload */}
          <div className="mb-5">
            <ResumeUpload file={resume} onFile={setResume} />
          </div>

          {/* Search + CTA */}
          <div className="flex items-center gap-3 mb-7">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setScraped(true)}
                placeholder="Search jobs, companies, skills, keywords..."
                className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl border border-slate-200 text-[13.5px] text-slate-800 placeholder-slate-400
                  outline-none transition-all duration-200 shadow-sm
                  hover:border-slate-300
                  focus:border-blue-400 focus:ring-[3px] focus:ring-blue-500/10"
              />
            </div>
            <button
              onClick={() => setScraped(true)}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl text-[13.5px] font-semibold text-white whitespace-nowrap flex-shrink-0
                transition-all duration-150 shadow-sm
                hover:shadow-[0_4px_16px_rgba(37,99,235,0.4)] hover:-translate-y-px active:translate-y-0"
              style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}
            >
              <Zap size={14} strokeWidth={2.5} />
              Start Scraping
            </button>
          </div>

          {/* Results header */}
          {scraped && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-slate-700">
                  {filteredJobs.length}{" "}
                  {filteredJobs.length === 1 ? "job" : "jobs"} found
                </span>
                {(query || activeCount > 0) && (
                  <span className="text-[12px] text-slate-400">
                    {query && `for "${query}"`}
                    {query && activeCount > 0 && " · "}
                    {activeCount > 0 &&
                      `${activeCount} filter${activeCount > 1 ? "s" : ""} active`}
                  </span>
                )}
              </div>
              {(query || activeCount > 0) && (
                <button
                  onClick={() => {
                    setQuery("");
                    clearFilters();
                  }}
                  className="text-[12px] font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors flex items-center gap-1"
                >
                  <RotateCcw size={11} /> Reset
                </button>
              )}
            </div>
          )}

          {/* Jobs List */}
          {showJobs ? (
            filteredJobs.length > 0 ? (
              <div className="space-y-3 pb-10">
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
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                <EmptyState
                  hasQuery={!!(query || activeCount > 0)}
                  onReset={() => {
                    setQuery("");
                    clearFilters();
                  }}
                />
              </div>
            )
          ) : (
            /* Pre-scrape empty state */
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
              <EmptyState hasQuery={false} onReset={() => setScraped(true)} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
