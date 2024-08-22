"use server";

import { checkImageProcessing } from "@/lib/check-processing";
import { actionClient } from "@/lib/safe-action";
import { ActionResult } from "@/lib/types";
import { z } from "zod";
import { Logger } from "next-axiom";

const log = new Logger();
const actionLog = log.with({ context: "actions/gen-remove-action" });

const genRemoveSchema = z.object({
  prompt: z.string(),
  activeImageUrl: z.string(),
});

export const genRemoveAction = actionClient
  .schema(genRemoveSchema)
  .action(
    async ({
      parsedInput: { prompt, activeImageUrl },
    }): Promise<ActionResult<string, string>> => {
      actionLog.info("Starting genRemoveAction", {
        prompt,
        activeImageUrl,
      });

      try {
        const removeUrl = constructRemoveUrl(activeImageUrl, prompt);

        await waitForImageProcessing(removeUrl);

        return { result: removeUrl };
      } catch (error) {
        actionLog.error("Error during image processing", {
          error,
        });

        if (error instanceof Error) {
          return { error: error.message };
        }

        return {
          error: "An unexpected error occurred while processing the image.",
        };
      } finally {
        await log.flush();
      }
    },
  );

function constructRemoveUrl(activeImageUrl: string, prompt: string) {
  const [baseUrl, imagePath] = activeImageUrl.split("/upload/");

  if (!baseUrl || !imagePath) {
    throw new Error("Invalid URL format.");
  }

  const removeUrl = `${baseUrl}/upload/e_gen_remove:${encodeURIComponent(prompt)}/${imagePath}`;

  actionLog.info("Constructed Remove URL", {
    removeUrl,
  });

  return removeUrl;
}

async function waitForImageProcessing(url: string) {
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
      if (attempt === maxAttempts) {
        throw new Error("Image processing failed after multiple attempts.");
      }
    }
  }

  throw new Error("Image processing timed out.");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
