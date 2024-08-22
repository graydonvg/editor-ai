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
        const genRemoveUrl = constructUrl(activeImageUrl, prompt);

        await waitForImageProcessing(genRemoveUrl);

        return { result: genRemoveUrl };
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

function constructUrl(activeImageUrl: string, prompt: string) {
  const [baseUrl, imagePath] = activeImageUrl.split("/upload/");

  if (!baseUrl || !imagePath) {
    throw new Error("Invalid URL format");
  }

  const genRemoveUrl = `${baseUrl}/upload/e_gen_remove:${encodeURIComponent(prompt)}/${imagePath}`;

  actionLog.info("Constructed URL successfully", {
    genRemoveUrl,
  });

  return genRemoveUrl;
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
