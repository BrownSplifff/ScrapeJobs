import { scrapeJobs } from "@/lib/scraper";
import { saveJobs } from "@/lib/firestore";

export async function GET() {
  try {
    const jobs = await scrapeJobs();

    console.log("Jobs Count:", jobs.length);
    console.log("First Job:", jobs[0]);

    await saveJobs(jobs);

    return Response.json({
      success: true,
      count: jobs.length,
      scrapedJobs : jobs
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}