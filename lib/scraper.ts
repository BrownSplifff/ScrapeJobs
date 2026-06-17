import { chromium } from "playwright";

export async function scrapeJobs() {
  console.log("🚀 Starting scraper");

  const browser = await chromium.launch({
    headless: true,
  });

  console.log("✅ Browser launched");

  try {
    const page = await browser.newPage();

    console.log("✅ New page created");

    console.log("🌐 Navigating to WeWorkRemotely...");

    await page.goto(
      "https://weworkremotely.com/remote-jobs",
      {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      }
    );

    console.log("✅ Page loaded");
    console.log("📄 Title:", await page.title());

    await page.screenshot({
      path: "wwr.png",
      fullPage: true,
    });

    console.log("📸 Screenshot saved");

    const linkCount = await page.locator("a").count();

    console.log("🔗 Total links found:", linkCount);

    console.log("🔍 Extracting links...");

    const jobs = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll("a")
      )
        .slice(0, 20)
        .map((el) => ({
          text: el.textContent?.trim(),
          href: el.getAttribute("href"),
        }));
    });

    console.log("✅ Extraction complete");
    console.log("📊 Jobs Found:", jobs.length);
    console.log("📋 First 5 Results:");
    console.log(jobs.slice(0, 5));

    return jobs;
  } catch (error) {
    console.error("❌ Scraper Error:", error);
    return [];
  } finally {
    console.log("🧹 Closing browser...");
    await browser.close();
    console.log("✅ Browser closed");
  }
}