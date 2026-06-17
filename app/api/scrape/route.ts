import { scrapeJobs } from "@/lib/scraper";
import { saveJobs } from "@/lib/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const start = Date.now();

  try {
    const sourcesParam =
      req.nextUrl.searchParams.get("sources");

    const sources = sourcesParam
      ? sourcesParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

    console.log(
      "[SCRAPER] Starting...",
      sources ?? "all sources"
    );

    const result = await scrapeJobs(sources);

    let savedCount = 0;

    if (result.jobs.length) {
      try {
        await saveJobs(result.jobs);
        savedCount = result.jobs.length;

        console.log(
          `[SCRAPER] Saved ${savedCount} jobs`
        );
      } catch (saveError) {
        console.error(
          "[SCRAPER] Firestore save failed:",
          saveError
        );
      }
    }

    return NextResponse.json({
      success: true,

      meta: {
        ...result.meta,
        savedCount,
        errorCount: result.errors.length,
        savedAt: new Date().toISOString(),
        responseTimeMs: Date.now() - start,
      },

      warnings: result.errors,

      jobs: result.jobs,
    });
  } catch (error) {
    console.error(
      "[SCRAPER] Fatal error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        meta: {
          responseTimeMs:
            Date.now() - start,
        },

        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}