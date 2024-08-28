import { Logger } from "next-axiom";
import { checkResourceProcessing } from "./check-processing";
import { wait } from "../utils";

export async function waitForResourceProcessing(
  url: string,
  resource: "Image" | "Video",
  actionLog: Logger,
) {
  const maxAttempts = 10;
  const maxDelay = 15000;
  const initialDelay = resource === "Image" ? 1000 : 2000;

  actionLog.info(`Starting ${resource} processing check`, {
    url,
    maxAttempts,
  });

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const isProcessed = await checkResourceProcessing(url);

      if (isProcessed) {
        actionLog.info(`${resource} processed successfully`, {
          attempt,
          url,
        });

        return;
      }

      if (attempt === maxAttempts) {
        throw new Error(
          `Unable to process ${resource.toLowerCase()} after multiple attempts. Please try again later.`,
        );
      }

      let delay = initialDelay * Math.pow(2, attempt - 1);
      delay = Math.min(delay, maxDelay);

      actionLog.warn(`${resource} not yet processed, retrying...`, {
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
