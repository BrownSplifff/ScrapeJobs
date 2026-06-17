import {
  chromium,
  BrowserContext,
  Page,
} from "playwright";

import fs from "fs/promises";
import crypto from "crypto";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  tags: string[];
  url: string;
  postedAt: string | null;
  source: string;
  scrapedAt: string;
}

interface ScrapeError {
  source: string;
  message: string;
  url: string;
}

export interface ScrapeResult {
  jobs: Job[];
  errors: ScrapeError[];
  meta: {
    totalFound: number;
    duration: number;
    sources: string[];
  };
}

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────

const CONFIG = {
  maxRetries: 3,
  retryDelayMs: 1500,
  rateLimitMs: 1000,
  navigationTimeout: 30000,
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function generateId(source: string, url: string) {
  return crypto
    .createHash("sha256")
    .update(`${source}:${url}`)
    .digest("hex")
    .slice(0, 16);
}

async function withRetry<T>(fn: () => Promise<T>, retries = CONFIG.maxRetries): Promise<T> {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.warn(`[retry ${attempt}/${retries}]`, err);
      if (attempt < retries) await sleep(CONFIG.retryDelayMs * attempt);
    }
  }
  throw lastError;
}

async function createPage(context: BrowserContext) {
  const page = await context.newPage();
  page.setDefaultNavigationTimeout(CONFIG.navigationTimeout);
  return page;
}

async function dumpDebug(page: Page, source: string) {
  const timestamp = Date.now();
  await page.screenshot({ path: `debug-${source}-${timestamp}.png`, fullPage: true });
  await fs.writeFile(`debug-${source}-${timestamp}.html`, await page.content());
  console.log(`[${source}] title:`, await page.title());
  console.log(`[${source}] links:`, await page.locator("a").count());
}

async function detectBlock(page: Page) {
  const body = (await page.textContent("body")) || "";
  const blockedTerms = [
    "Just a moment",
    "Verify you are human",
    "Checking your browser",
    "Cloudflare",
    "Attention Required",
  ];
  if (blockedTerms.some((term) => body.includes(term))) {
    throw new Error("Blocked by Cloudflare / Bot Protection");
  }
}

// ─────────────────────────────────────────────────────────────
// WWR
// ─────────────────────────────────────────────────────────────

async function scrapeWWR(context: BrowserContext): Promise<Job[]> {
  const page = await createPage(context);

  try {
    await withRetry(() =>
      page.goto("https://weworkremotely.com/remote-jobs", {
        waitUntil: "domcontentloaded",
      })
    );

    await detectBlock(page);

    const liCount = await page.locator("ul.jobs > li:not(.view-all)").count();
    console.log(`[WWR] li count: ${liCount}`);

    const firstLiHTML = await page
      .locator("ul.jobs > li:not(.view-all)")
      .first()
      .innerHTML()
      .catch(() => "none");
    console.log("[WWR] First <li> HTML:\n", firstLiHTML);

    const jobs = await page.evaluate(() => {
      const results: {
        title: string;
        company: string;
        location: string;
        tags: string[];
        url: string;
        postedAt: null;
        source: string;
      }[] = [];

      document.querySelectorAll("section.jobs").forEach((section) => {
        const category = section.querySelector("h2")?.textContent?.trim() ?? "";

        section.querySelectorAll("ul.jobs > li:not(.view-all)").forEach((li) => {
          const anchor = li.querySelector("a[href]");
          const href = anchor?.getAttribute("href") ?? "";
          if (!href) return;

          const title =
            (anchor?.querySelector("span.title") ?? li.querySelector("span.title"))
              ?.textContent?.trim() ?? "";

          const company =
            (anchor?.querySelector("span.company") ?? li.querySelector("span.company"))
              ?.textContent?.trim() ?? "";

          const location =
            (anchor?.querySelector("span.region") ?? li.querySelector("span.region"))
              ?.textContent?.trim() ?? "Remote";

          if (!title && !company) return;

          results.push({
            title: title || company,
            company,
            location,
            tags: category ? [category] : [],
            url: href.startsWith("http")
              ? href
              : `https://weworkremotely.com${href}`,
            postedAt: null,
            source: "WeWorkRemotely",
          });
        });
      });

      return results;
    });

    console.log(`[WWR] Extracted ${jobs.length} jobs`);

    if (jobs.length === 0) {
      const sectionCount = await page.locator("section.jobs").count();
      const spanClasses = await page.evaluate(() =>
        Array.from(
          new Set(
            Array.from(
              document.querySelectorAll("ul.jobs > li:not(.view-all) span")
            ).map((s) => s.className)
          )
        )
      );
      console.warn(`[WWR] 0 jobs extracted. sections=${sectionCount}, span classes found:`, spanClasses);
      await dumpDebug(page, "wwr");
    }

    return jobs.map((job) => ({
      ...job,
      id: generateId("WWR", job.url),
      scrapedAt: new Date().toISOString(),
    }));
  } finally {
    await page.close();
  }
}

// ─────────────────────────────────────────────────────────────
// REMOTEOK
// ─────────────────────────────────────────────────────────────

async function scrapeRemoteOK(context: BrowserContext): Promise<Job[]> {
  const page = await createPage(context);

  try {
    await withRetry(() =>
      page.goto("https://remoteok.com", { waitUntil: "networkidle" })
    );

    await detectBlock(page);
    await dumpDebug(page, "remoteok");

    console.log("RemoteOK rows:", await page.locator("tr.job").count());
    console.log("RemoteOK data-id:", await page.locator("[data-id]").count());

    const jobs = await page.evaluate(() => {
      const results: {
        title: string;
        company: string;
        location: string;
        tags: string[];
        url: string;
        postedAt: string | null;
        source: string;
      }[] = [];

      document.querySelectorAll("tr.job").forEach((row) => {
        const href = row.getAttribute("data-href") ?? "";
        const title = row.querySelector("h2")?.textContent?.trim() ?? "";
        const company = row.querySelector("h3")?.textContent?.trim() ?? "";

        if (!title) return;

        const tags = Array.from(row.querySelectorAll(".tag"))
          .map((t) => t.textContent?.trim() ?? "")
          .filter(Boolean);

        const timeEl = row.querySelector("td.time time");
        const postedAt = timeEl?.getAttribute("datetime") ?? null;

        results.push({
          title,
          company,
          location: "Remote",
          tags,
          url: href.startsWith("http") ? href : `https://remoteok.com${href}`,
          postedAt,
          source: "RemoteOK",
        });
      });

      return results;
    });

    return jobs.map((job) => ({
      ...job,
      id: generateId("RemoteOK", job.url),
      scrapedAt: new Date().toISOString(),
    }));
  } finally {
    await page.close();
  }
}

// ─────────────────────────────────────────────────────────────
// JOBSPRESSO
// ─────────────────────────────────────────────────────────────
//
// Jobspresso is built on WP Job Manager. Jobs are injected into the DOM
// via JavaScript after page load, so we must wait for the listing container
// to be populated before scraping.
//
// DOM shape (as of 2025):
//   <ul class="job_listings">
//     <li class="job_listing">
//       <a href="https://jobspresso.co/remote-work/job-slug/">
//         <div class="position">
//           <h3>Job Title</h3>
//           <div class="company"><span class="company-name">Acme Inc.</span></div>
//         </div>
//         <ul class="meta">
//           <li class="job-type full-time">Full Time</li>
//           <li class="location">Worldwide</li>
//         </ul>
//       </a>
//     </li>
//   </ul>

async function scrapeJobspresso(context: BrowserContext): Promise<Job[]> {
  const page = await createPage(context);

  try {
    await withRetry(() =>
      page.goto("https://jobspresso.co/remote-work/", {
        waitUntil: "domcontentloaded",
      })
    );

    await detectBlock(page);

    // Jobs are JS-rendered — wait up to 15 s for at least one listing to appear.
    // If the selector times out, the page structure has changed; dumpDebug helps.
    try {
      await page.waitForSelector("ul.job_listings li.job_listing", {
        timeout: 15_000,
      });
    } catch {
      console.warn("[Jobspresso] Timed out waiting for job listings — dumping debug info");
      await dumpDebug(page, "jobspresso");
      return [];
    }

    const liCount = await page.locator("ul.job_listings li.job_listing").count();
    console.log(`[Jobspresso] li count: ${liCount}`);

    const jobs = await page.evaluate(() => {
      const results: {
        title: string;
        company: string;
        location: string;
        tags: string[];
        url: string;
        postedAt: string | null;
        source: string;
      }[] = [];

      document.querySelectorAll("ul.job_listings li.job_listing").forEach((li) => {
        const anchor = li.querySelector<HTMLAnchorElement>("a[href]");
        const href = anchor?.href ?? "";
        if (!href) return;

        const title =
          li.querySelector("h3")?.textContent?.trim() ??
          li.querySelector(".position h3")?.textContent?.trim() ??
          "";

        const company =
          li.querySelector(".company-name")?.textContent?.trim() ??
          li.querySelector(".company")?.textContent?.trim() ??
          "";

        const location =
          li.querySelector("li.location")?.textContent?.trim() ??
          li.querySelector(".location")?.textContent?.trim() ??
          "Remote";

        // Job type tags (e.g. "Full Time", "Contract")
        const tags: string[] = [];
        li.querySelectorAll("li.job-type").forEach((el) => {
          const t = el.textContent?.trim();
          if (t) tags.push(t);
        });

        // posted_at is stored in a <time datetime="..."> if present
        const postedAt =
          li.querySelector("time")?.getAttribute("datetime") ?? null;

        if (!title && !company) return;

        results.push({
          title: title || company,
          company,
          location,
          tags,
          url: href,
          postedAt,
          source: "Jobspresso",
        });
      });

      return results;
    });

    console.log(`[Jobspresso] Extracted ${jobs.length} jobs`);

    if (jobs.length === 0) {
      // Log span/class names to help debug selector drift
      const foundClasses = await page.evaluate(() =>
        Array.from(
          new Set(
            Array.from(document.querySelectorAll("ul.job_listings li *")).map(
              (el) => el.className
            )
          )
        ).filter(Boolean)
      );
      console.warn("[Jobspresso] 0 jobs. Inner classes found:", foundClasses);
      await dumpDebug(page, "jobspresso");
    }

    return jobs.map((job) => ({
      ...job,
      id: generateId("Jobspresso", job.url),
      scrapedAt: new Date().toISOString(),
    }));
  } finally {
    await page.close();
  }
}

// ─────────────────────────────────────────────────────────────
// REMOTIVE
// ─────────────────────────────────────────────────────────────
//
// Remotive server-renders the first ~20 visible jobs into the HTML.
// Additional jobs are behind a paywall ("Unlock All Jobs"). We scrape
// whatever is publicly visible without logging in.
//
// DOM shape (as of 2025):
//   <ul> (the main job list, no special class — identified by job link shape)
//     <li>
//       <a href="/remote-jobs/category/job-slug-id">
//         <div class="...">
//           <span>Job Title • Company</span>   ← fused in some variants
//           — OR —
//           <p>Job Title</p>
//           <p class="company ...">Company</p>
//         </div>
//         <div> [Software Development] [full-time] [senior] $salary  [Location]</div>
//         <div>N days ago</div>
//       </a>
//     </li>
//   </ul>
//
// We use the public Remotive API as a resilient fallback: it returns clean JSON
// and is officially supported for read access.

const REMOTIVE_API = "https://remotive.com/api/remote-jobs?limit=50";

async function scrapeRemotive(context: BrowserContext): Promise<Job[]> {
  const page = await createPage(context);

  try {
    // ── Strategy 1: official public JSON API (most reliable) ──────────────
    console.log("[Remotive] Trying public API …");
    const apiResponse = await page.goto(REMOTIVE_API, {
      waitUntil: "domcontentloaded",
    });

    if (apiResponse?.ok()) {
      const body = await page.textContent("body");
      try {
        const json = JSON.parse(body ?? "");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiJobs = (json.jobs ?? []) as any[];

        if (apiJobs.length > 0) {
          console.log(`[Remotive] API returned ${apiJobs.length} jobs`);
          return apiJobs.map((job) => ({
            id: generateId("Remotive", job.url),
            title: (job.title ?? "").trim(),
            company: (job.company_name ?? "").trim(),
            location: (job.candidate_required_location || "Remote").trim(),
            tags: [
              job.category,
              job.job_type,
              ...(job.tags ?? []),
            ].filter(Boolean),
            url: job.url,
            postedAt: job.publication_date ?? null,
            source: "Remotive",
            scrapedAt: new Date().toISOString(),
          }));
        }
      } catch {
        console.warn("[Remotive] API response was not valid JSON — falling back to HTML scrape");
      }
    }

    // ── Strategy 2: HTML scrape fallback ──────────────────────────────────
    console.log("[Remotive] Falling back to HTML scrape …");
    await withRetry(() =>
      page.goto("https://remotive.com/remote-jobs", { waitUntil: "networkidle" })
    );

    await detectBlock(page);

    // Each public job links to /remote-jobs/category/slug
    const jobs = await page.evaluate(() => {
      const results: {
        title: string;
        company: string;
        location: string;
        tags: string[];
        url: string;
        postedAt: string | null;
        source: string;
      }[] = [];

      // Target anchors whose href matches the job URL pattern
      document
        .querySelectorAll<HTMLAnchorElement>("a[href*='/remote-jobs/']")
        .forEach((anchor) => {
          const href = anchor.href;

          // Filter out category/filter links (they have no slug ID suffix)
          // Real job links look like: /remote-jobs/software-development/job-title-12345
          if (!/\/remote-jobs\/[^/]+\/[^/]+-\d+/.test(href)) return;

          // Title: largest text node or first <p>/<span> child
          const title =
            anchor.querySelector("p:first-child")?.textContent?.trim() ??
            anchor.querySelector("span")?.textContent?.trim() ??
            anchor.textContent?.trim().split("\n")[0] ??
            "";

          // Company: second <p> or element with "company" in class
          const company =
            anchor.querySelector("[class*='company']")?.textContent?.trim() ??
            anchor.querySelectorAll("p")[1]?.textContent?.trim() ??
            "";

          // Tags: elements containing category/type keywords
          const tags: string[] = [];
          anchor.querySelectorAll("span, div").forEach((el) => {
            const t = el.textContent?.trim() ?? "";
            if (
              t &&
              t.length < 50 &&
              /full.?time|part.?time|contract|freelance|software|design|marketing|sales|support|data|product|writing|finance|ai/i.test(t)
            ) {
              tags.push(t);
            }
          });

          // Location
          const location =
            anchor.querySelector("[class*='location']")?.textContent?.trim() ??
            "Remote";

          // Posted at
          const postedAt =
            anchor.querySelector("time")?.getAttribute("datetime") ?? null;

          if (!title) return;

          results.push({
            title,
            company,
            location,
            tags: [...new Set(tags)],
            url: href,
            postedAt,
            source: "Remotive",
          });
        });

      return results;
    });

    console.log(`[Remotive] HTML scrape extracted ${jobs.length} jobs`);

    if (jobs.length === 0) {
      await dumpDebug(page, "remotive");
    }

    return jobs.map((job) => ({
      ...job,
      id: generateId("Remotive", job.url),
      scrapedAt: new Date().toISOString(),
    }));
  } finally {
    await page.close();
  }
}

// ─────────────────────────────────────────────────────────────
// WELLFOUND (formerly AngelList Talent)
// ─────────────────────────────────────────────────────────────
//
// ⚠️  IMPORTANT: Wellfound is heavily protected and login-walled.
//
// - The jobs listing page (wellfound.com/jobs) requires a logged-in session
//   to display actual job cards. Without auth, the page renders a sign-up wall.
// - Even with a session, Wellfound uses React + GraphQL, meaning all job data
//   is loaded via XHR — not present in the initial HTML.
//
// RECOMMENDED APPROACH: intercept the GraphQL XHR response.
//
//   1. Set a valid logged-in `Cookie` header in context (pass via env var).
//   2. Intercept `**/graphql` requests and capture the JSON payload.
//   3. Parse `data.talent_featured_listings` (or similar) from the response.
//
// This scraper implements the intercept approach. Set the env var
// WELLFOUND_COOKIE to a full cookie string from your logged-in browser
// session (DevTools → Network → any request → copy "cookie" header value).
//
// If the cookie is absent or expired, the scraper returns 0 jobs gracefully
// rather than throwing, so it does not block other sources.

async function scrapeWellfound(context: BrowserContext): Promise<Job[]> {
  const cookie = process.env.WELLFOUND_COOKIE;

  if (!cookie) {
    console.warn(
      "[Wellfound] WELLFOUND_COOKIE env var not set. " +
        "Wellfound requires a logged-in session cookie to access job listings. " +
        "Set WELLFOUND_COOKIE=<your cookie string> and re-run."
    );
    return [];
  }

  const page = await createPage(context);

  // Inject auth cookie before navigation
  await context.setExtraHTTPHeaders({ Cookie: cookie });

  // Captured GraphQL payloads
  const capturedJobs: Job[] = [];

  // Intercept GraphQL responses to extract job data from the API directly
  page.on("response", async (response) => {
    const url = response.url();
    if (!url.includes("graphql") && !url.includes("/api/")) return;

    try {
      const json = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const listings: any[] =
        json?.data?.talent_featured_listings ??
        json?.data?.jobs ??
        json?.data?.jobListings ??
        [];

      for (const listing of listings) {
        const jobUrl =
          listing.slug
            ? `https://wellfound.com/jobs/${listing.slug}`
            : listing.url ?? "";

        if (!jobUrl || capturedJobs.some((j) => j.url === jobUrl)) continue;

        capturedJobs.push({
          id: generateId("Wellfound", jobUrl),
          title: (listing.title ?? listing.role ?? "").trim(),
          company: (
            listing.startup?.name ??
            listing.company?.name ??
            listing.companyName ??
            ""
          ).trim(),
          location: (
            listing.locationNames?.join(", ") ??
            listing.remote_ok
              ? "Remote"
              : listing.location ?? "Remote"
          ).trim(),
          tags: [
            ...(listing.tags ?? []).map((t: { display_name?: string; name?: string }) =>
              t.display_name ?? t.name ?? ""
            ),
            listing.role_type ?? "",
          ].filter(Boolean),
          url: jobUrl,
          postedAt: listing.created_at ?? listing.liveStartAt ?? null,
          source: "Wellfound",
          scrapedAt: new Date().toISOString(),
        });
      }
    } catch {
      // Not JSON or irrelevant endpoint — skip
    }
  });

  try {
    await withRetry(() =>
      page.goto("https://wellfound.com/jobs", { waitUntil: "networkidle" })
    );

    await detectBlock(page);

    // Give React time to fire its data-fetching GraphQL requests
    await sleep(4000);

    // If intercept captured nothing, try scraping visible DOM as a last resort
    if (capturedJobs.length === 0) {
      console.warn("[Wellfound] No jobs captured via GraphQL intercept — attempting DOM fallback");

      const domJobs = await page.evaluate(() => {
        const results: {
          title: string;
          company: string;
          location: string;
          tags: string[];
          url: string;
          postedAt: null;
          source: string;
        }[] = [];

        // Wellfound job cards are divs with a data-test attribute or role links
        document
          .querySelectorAll<HTMLAnchorElement>("a[href*='/jobs/']")
          .forEach((anchor) => {
            const href = anchor.href;
            if (!href.includes("wellfound.com/jobs/")) return;

            const title =
              anchor.querySelector("h2, h3, [class*='title']")?.textContent?.trim() ?? "";
            const company =
              anchor.querySelector("[class*='company'], [class*='startup']")?.textContent?.trim() ?? "";
            const location =
              anchor.querySelector("[class*='location']")?.textContent?.trim() ?? "Remote";

            if (!title) return;

            results.push({
              title,
              company,
              location,
              tags: [],
              url: href,
              postedAt: null,
              source: "Wellfound",
            });
          });

        return results;
      });

      const isLoginWall = await page
        .locator("text=/sign up|log in|create account/i")
        .first()
        .isVisible()
        .catch(() => false);

      if (isLoginWall) {
        console.warn(
          "[Wellfound] Login wall detected — the provided cookie may be expired. " +
            "Please refresh WELLFOUND_COOKIE with a current session token."
        );
        await dumpDebug(page, "wellfound");
        return [];
      }

      return domJobs.map((job) => ({
        ...job,
        id: generateId("Wellfound", job.url),
        scrapedAt: new Date().toISOString(),
      }));
    }

    console.log(`[Wellfound] Captured ${capturedJobs.length} jobs via GraphQL intercept`);
    return capturedJobs;
  } finally {
    // Clear injected cookie so it doesn't bleed into other sources
    await context.setExtraHTTPHeaders({});
    await page.close();
  }
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

export async function scrapeJobs(filterSources?: string[]): Promise<ScrapeResult> {
  const startTime = Date.now();
  const jobs: Job[] = [];
  const errors: ScrapeError[] = [];

  const allSources = [
    {
      name: "WeWorkRemotely",
      url: "https://weworkremotely.com/remote-jobs",
      scrape: scrapeWWR,
    },
    {
      name: "RemoteOK",
      url: "https://remoteok.com",
      scrape: scrapeRemoteOK,
    },
    {
      name: "Jobspresso",
      url: "https://jobspresso.co/remote-work/",
      scrape: scrapeJobspresso,
    },
    {
      name: "Remotive",
      url: "https://remotive.com/remote-jobs",
      scrape: scrapeRemotive,
    },
    {
      name: "Wellfound",
      url: "https://wellfound.com/jobs",
      scrape: scrapeWellfound,
    },
  ];

  const sources = filterSources?.length
    ? allSources.filter((s) => filterSources.includes(s.name))
    : allSources;

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const context = await browser.newContext({
    userAgent: CONFIG.userAgent,
    viewport: { width: 1280, height: 800 },
    extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
  });

  try {
    for (const source of sources) {
      try {
        console.log(`\n🚀 Scraping ${source.name}`);
        const result = await source.scrape(context);
        console.log(`✅ ${source.name}: ${result.length}`);
        jobs.push(...result);
        await sleep(CONFIG.rateLimitMs);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`❌ ${source.name}`, message);
        errors.push({ source: source.name, message, url: source.url });
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }

  const seen = new Set<string>();
  const deduped = jobs.filter((job) => {
    if (seen.has(job.url)) return false;
    seen.add(job.url);
    return true;
  });

  return {
    jobs: deduped,
    errors,
    meta: {
      totalFound: deduped.length,
      duration: Date.now() - startTime,
      sources: sources.map((s) => s.name),
    },
  };
}