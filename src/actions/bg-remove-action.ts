"use server";

import { checkImageProcessing } from "@/lib/check-processing";
import { actionClient } from "@/lib/safe-action";
import { ActionResult } from "@/lib/types";
import { z } from "zod";
import { Logger } from "next-axiom";

const log = new Logger();
const actionLog = log.with({ context: "actions/bg-remove-action" });

const bgRemoveSchema = z.object({
  activeImageUrl: z.string(),
  format: z.string(),
});

export const bgRemoveAction = actionClient
  .schema(bgRemoveSchema)
  .action(
    async ({
      parsedInput: { activeImageUrl, format },
    }): Promise<ActionResult<string, string>> => {
      actionLog.info("Starting bgRemoveAction", {
        activeImageUrl,
        format,
      });

      try {
        const bgRemoveUrl = constructUrl(activeImageUrl, format);

        await waitForImageProcessing(bgRemoveUrl);

        return { result: bgRemoveUrl };
      } catch (error) {
        actionLog.error("Error during image processing", {
          error,
        });

        if (error instanceof Error) {
          return { error: error.message };
        }

        return {
          error: "An unexpected error occurred while processing the image",
        };
      } finally {
        await log.flush();
      }
    },
  );

function constructUrl(activeImageUrl: string, format: string) {
  const urlParts = activeImageUrl.split(format);
  const pngConvert = urlParts[0] + "png";
  const [baseUrl, imagePath] = pngConvert.split("/upload/");

  if (!baseUrl || !imagePath) {
    throw new Error("Invalid URL format");
  }

  const bgRemoveUrl = `${baseUrl}/upload/e_background_removal/${imagePath}`;

  actionLog.info("Constructed URL successfully", {
    bgRemoveUrl,
  });

  return bgRemoveUrl;
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
      throw new Error(
        "An unexpected error occurred during image processing check",
      );
    }

    if (attempt === maxAttempts) {
      throw new Error("Image processing failed after multiple attempts");
    }
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
