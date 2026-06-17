"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Search,
  Upload,
  FileText,
  X,
  Bookmark,
  ExternalLink,
  MapPin,
  Clock,
  Building2,
  Globe,
  Briefcase,
  Zap,
  RotateCcw,
  AlertCircle,
  Loader2,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SOURCE_STYLES = {
  RemoteOK: "bg-emerald-50 text-emerald-700",
  WeWorkRemotely: "bg-blue-50 text-blue-700",
};

function getLogoStyle(company) {
  const colors = [
    { bg: "#2563eb", fg: "#fff" },
    { bg: "#7c3aed", fg: "#fff" },
    { bg: "#db2777", fg: "#fff" },
    { bg: "#d97706", fg: "#fff" },
    { bg: "#059669", fg: "#fff" },
    { bg: "#0891b2", fg: "#fff" },
    { bg: "#dc2626", fg: "#fff" },
    { bg: "#4f46e5", fg: "#fff" },
  ];
  const idx =
    (company ?? "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    colors.length;
  return {
    letter: (company ?? "?").charAt(0).toUpperCase(),
    ...colors[idx],
  };
}

function timeAgo(iso) {
  if (!iso) return "Recently";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ─── ResumeUpload ─────────────────────────────────────────────────────────────

function ResumeUpload({ file, onFile }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files?.[0];
      if (f) onFile(f);
    },
    [onFile],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !file && inputRef.current?.click()}
      className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 ${
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
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />

      {file ? (
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
        <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-200 ${
              dragging ? "bg-blue-100 scale-110" : "bg-slate-100"
            }`}
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
            Upload your resume and we&apos;ll extract skills to find matching
            jobs.
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
  const logo = getLogoStyle(job.company);
  const posted = timeAgo(job.postedAt ?? job.scrapedAt);
  const sourceStyle = SOURCE_STYLES[job.source] ?? "bg-slate-50 text-slate-500";

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 p-5">
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-[14px] font-bold flex-shrink-0 shadow-sm"
          style={{ background: logo.bg, color: logo.fg }}
        >
          {logo.letter}
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

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onSave(job.id)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-150 ${
                  saved
                    ? "bg-blue-50 border-blue-200 text-blue-600"
                    : "bg-white border-slate-200 text-slate-400 hover:border-blue-200 hover:text-blue-500 hover:bg-blue-50"
                }`}
                aria-label="Save job"
              >
                <Bookmark size={13} fill={saved ? "currentColor" : "none"} />
              </button>
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold text-white transition-all duration-150
                  hover:shadow-[0_3px_12px_rgba(37,99,235,0.35)] hover:-translate-y-px active:translate-y-0"
                style={{
                  background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                }}
              >
                Apply <ExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* Meta chips */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${sourceStyle}`}
            >
              {job.source}
            </span>
            {job.location && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700">
                <Globe size={9} />
                {job.location}
              </span>
            )}
          </div>

          {/* Tags */}
          {job.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[11px] font-medium bg-slate-50 text-slate-600 rounded-md border border-slate-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer meta */}
          <div className="flex flex-wrap items-center gap-4 text-[11.5px] text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin size={11} className="flex-shrink-0" />
              {job.location || "Remote"}
            </span>
            <span className="flex items-center gap-1 ml-auto">
              <Clock size={11} className="flex-shrink-0" />
              {posted}
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
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center">
          <Briefcase size={32} className="text-slate-300" />
        </div>
        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center">
          <Search size={12} className="text-blue-400" />
        </div>
      </div>
      <h3 className="text-[17px] font-bold text-slate-800 mb-2">
        {hasQuery ? "No matches" : "No jobs yet"}
      </h3>
      <p className="text-[13px] text-slate-400 max-w-xs leading-relaxed mb-6">
        {hasQuery
          ? "No jobs match your search. Try different keywords or clear the filter."
          : 'Hit "Start Scraping" to pull the latest remote jobs into your dashboard.'}
      </p>
      {hasQuery && (
        <button
          onClick={onReset}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-600
            hover:bg-slate-50 hover:border-slate-300 transition-all duration-150"
        >
          Clear Search
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ScrapeJobsJobsPage() {
  const [query, setQuery] = useState("");
  const [resume, setResume] = useState(null);
  const [savedJobs, setSavedJobs] = useState(new Set());

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState(null);

  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState(null);
  const [lastScraped, setLastScraped] = useState(null);

  async function fetchJobs() {
    setLoadingJobs(true);
    setJobsError(null);
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Failed to load jobs");
      setJobs(data.jobs);
    } catch (err) {
      setJobsError(err instanceof Error ? err.message : "Failed to load jobs");
    } finally {
      setLoadingJobs(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  async function handleScrape() {
    setScraping(true);
    setScrapeError(null);
    try {
      const res = await fetch("/api/scrape");
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? "Scrape failed");
      setLastScraped(new Date().toLocaleTimeString());
      await fetchJobs();
    } catch (err) {
      setScrapeError(err instanceof Error ? err.message : "Scrape failed");
    } finally {
      setScraping(false);
    }
  }

  const toggleSave = (id) => {
    setSavedJobs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredJobs = jobs.filter((job) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const haystack =
      `${job.title} ${job.company} ${(job.tags ?? []).join(" ")} ${job.location}`.toLowerCase();
    return haystack.includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Page heading */}
          <div className="mb-7">
            <div className="flex items-center justify-between gap-4 mb-1">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Jobs
              </h1>
              {lastScraped && (
                <span className="text-[11.5px] text-slate-400">
                  Last scraped at {lastScraped}
                </span>
              )}
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

          {/* Search + Scrape CTA */}
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
                placeholder="Search jobs, companies, tags..."
                className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl border border-slate-200 text-[13.5px] text-slate-800 placeholder-slate-400
                  outline-none transition-all duration-200 shadow-sm
                  hover:border-slate-300
                  focus:border-blue-400 focus:ring-[3px] focus:ring-blue-500/10"
              />
            </div>
            <button
              onClick={handleScrape}
              disabled={scraping}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl text-[13.5px] font-semibold text-white whitespace-nowrap flex-shrink-0
                transition-all duration-150 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed
                hover:shadow-[0_4px_16px_rgba(37,99,235,0.4)] hover:-translate-y-px active:translate-y-0"
              style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}
            >
              {scraping ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Scraping...
                </>
              ) : (
                <>
                  <Zap size={14} strokeWidth={2.5} /> Start Scraping
                </>
              )}
            </button>
          </div>

          {/* Scrape error */}
          {scrapeError && (
            <div className="flex items-center gap-2.5 px-4 py-3 mb-5 rounded-xl bg-red-50 border border-red-100 text-[12.5px] text-red-600">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{scrapeError}</span>
              <button
                onClick={() => setScrapeError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Results header */}
          {!loadingJobs && !jobsError && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-semibold text-slate-700">
                {filteredJobs.length}{" "}
                {filteredJobs.length === 1 ? "job" : "jobs"} found
                {query && (
                  <span className="font-normal text-slate-400">
                    {" "}
                    for &quot;{query}&quot;
                  </span>
                )}
              </span>
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-[12px] font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors flex items-center gap-1"
                >
                  <RotateCcw size={11} /> Clear
                </button>
              )}
            </div>
          )}

          {/* Jobs list */}
          {loadingJobs ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Loader2 size={28} className="animate-spin mb-3 text-blue-400" />
              <p className="text-[13px]">Loading jobs...</p>
            </div>
          ) : jobsError ? (
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
              <AlertCircle size={28} className="text-red-300 mx-auto mb-3" />
              <p className="text-[14px] font-semibold text-slate-700 mb-1">
                Failed to load jobs
              </p>
              <p className="text-[12.5px] text-slate-400 mb-4">{jobsError}</p>
              <button
                onClick={fetchJobs}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-all"
              >
                Try Again
              </button>
            </div>
          ) : filteredJobs.length > 0 ? (
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
              <EmptyState hasQuery={!!query} onReset={() => setQuery("")} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
