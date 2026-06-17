import { adminDb } from "./firebase-admin";
import { Job } from "./scraper";

export async function saveJobs(jobs: Job[]): Promise<void> {
  if (!jobs.length) return;

  // Firestore batch limit is 500 ops per commit
  const BATCH_SIZE = 500;

  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const chunk = jobs.slice(i, i + BATCH_SIZE);
    const batch = adminDb.batch();

    for (const job of chunk) {
      // Use job.id as the document ID — naturally deduplicates on re-scrape
      const ref = adminDb.collection("jobs").doc(job.id);
      batch.set(ref, job, { merge: true });
    }

    await batch.commit();
    console.log(`[Firestore] Committed batch ${i / BATCH_SIZE + 1}: ${chunk.length} jobs`);
  }
}