import { Logger } from "next-axiom";
import { checkImageProcessing } from "./check-processing";
import { wait } from "../utils";

export async function waitForImageProcessing(url: string, actionLog: Logger) {
  const maxAttempts = 5;
  const initialDelay = 1000;

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

      if (attempt === maxAttempts) {
        throw new Error(
          "Unable to process image after multiple attempts. Please try again later.",
        );
      }

      const delay = initialDelay * Math.pow(2, attempt - 1);

      actionLog.warn("Image not yet processed, retrying...", {
        attempt,
        url,
        nextCheckIn: `${delay / 1000}s`,
      });

      await wait(delay);
    } catch (error) {
      throw error;
    }
  }
}
