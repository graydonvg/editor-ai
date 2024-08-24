"use server";

import { actionClient } from "@/lib/safe-action";
import { ActionResult } from "@/lib/types";
import { z } from "zod";
import { Logger } from "next-axiom";
import { waitForImageProcessing } from "@/lib/processing/wait-for-processing";

const log = new Logger();
const actionLog = log.with({ context: "actions/bg-replace-action" });

const bgReplaceSchema = z.object({
  activeImageUrl: z.string(),
  prompt: z.string(),
});

export const bgReplaceAction = actionClient
  .schema(bgReplaceSchema)
  .action(
    async ({
      parsedInput: { activeImageUrl, prompt },
    }): Promise<ActionResult<string, string>> => {
      actionLog.info("Starting bgReplaceAction", {
        activeImageUrl,
        prompt,
      });

      try {
        const bgReplaceUrl = constructUrl(activeImageUrl, prompt);

        await waitForImageProcessing(bgReplaceUrl, actionLog);

        return { result: bgReplaceUrl };
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

  const bgReplaceUrl = prompt
    ? `${baseUrl}/upload/e_gen_background_replace:prompt_${encodeURIComponent(prompt)}/${imagePath}`
    : `${baseUrl}/upload/e_gen_background_replace/${imagePath}`;

  actionLog.info("Constructed URL successfully", {
    bgReplaceUrl,
  });

  return bgReplaceUrl;
}
