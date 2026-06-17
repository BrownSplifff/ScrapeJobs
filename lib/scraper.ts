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

    // ── BUG FIX 1: Use Playwright's locator API (runs in Node.js) for debug
    // logging instead of console.log inside page.evaluate() — evaluate() runs
    // in the browser context, so its console output goes to the browser's
    // devtools, NOT your terminal. That's why skip logs never appeared.
    const liCount = await page.locator("ul.jobs > li:not(.view-all)").count();
    console.log(`[WWR] li count: ${liCount}`);

    // Grab the first <li>'s HTML from Node.js side for selector debugging
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

          // ── BUG FIX 2: WWR's <span class="title"> and <span class="company">
          // are DIRECT children of <a>, not of <li>. Querying from `li` works
          // fine, but the prior code was correct — the real issue was that the
          // selector ".title" matches elements with EXACTLY the class "title".
          // Some WWR li's have compound classes like "company-and-position"
          // wrappers. We query both the anchor and the li to cover all variants.
          const title =
            (anchor?.querySelector("span.title") ?? li.querySelector("span.title"))
              ?.textContent?.trim() ?? "";

          const company =
            (anchor?.querySelector("span.company") ?? li.querySelector("span.company"))
              ?.textContent?.trim() ?? "";

          const location =
            (anchor?.querySelector("span.region") ?? li.querySelector("span.region"))
              ?.textContent?.trim() ?? "Remote";

          // Skip sponsored/ad rows that have href but no real job data
          if (!title && !company) return;

          results.push({
            title: title || company,   // some rows use company as the display title
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

    // ── If still 0: the page structure changed. Log more detail to narrow it down.
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