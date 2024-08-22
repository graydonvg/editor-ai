import { Logger } from "next-axiom";
import { checkImageProcessing } from "./check-processing";
import { sleep } from "../utils";

export async function waitForImageProcessing(url: string, actionLog: Logger) {
  const maxAttempts = 20;
  const delay = 1000;

  actionLog.info("Starting image processing check", {
    url,
    maxAttempts,
  });

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const isProcessed = await checkImageProcessing(url);

      if (isProcessed) {
        actionLog.info("Image processed successfully", {
          attempt,
          url,
        });

        return;
      }

      if (attempt < maxAttempts) {
        actionLog.warn("Image not yet processed, retrying...", {
          attempt,
          url,
          nextCheckIn: `${delay / 1000}s`,
        });
      }

      await sleep(delay);
    } catch (error) {
      throw new Error(
        "An unexpected error occurred during image processing check",
      );
    }

    if (attempt === maxAttempts) {
      throw new Error("Image processing failed after multiple attempts");
    }
  }
}
