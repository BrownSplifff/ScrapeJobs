import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function saveJobs(jobs: any[]) {
  for (const job of jobs) {
    const id = encodeURIComponent(job.url);

    await setDoc(
      doc(db, "jobs", id),
      job,
      { merge: true }
    );
  }
}