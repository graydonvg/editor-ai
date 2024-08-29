import { Logger } from "next-axiom";
import { checkResourceProcessing } from "./check-processing";
import { wait } from "../utils";

export async function waitForResourceProcessing(
  url: string,
  resourceType: "image" | "video",
  logger: Logger,
) {
  const maxAttempts = 10;
  const maxDelay = 15000;
  const initialDelay = resourceType === "image" ? 1000 : 2000;
  const capitalizedResourceType =
    resourceType.charAt(0).toUpperCase() + resourceType.slice(1);

  logger.info(`Starting ${resourceType} processing check`, {
    url,
    maxAttempts,
  });

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const isProcessed = await checkResourceProcessing(url);

      if (isProcessed) {
        logger.info(`${capitalizedResourceType} processed successfully`, {
          attempt,
          url,
        });

        return;
      }

      if (attempt === maxAttempts) {
        throw new Error(
          `Unable to process ${resourceType} after multiple attempts. Please try again later.`,
        );
      }

      let delay = initialDelay * Math.pow(2, attempt - 1);
      delay = Math.min(delay, maxDelay);

      logger.warn(`${capitalizedResourceType} not yet processed, retrying...`, {
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
