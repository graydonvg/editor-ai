"use server";

import { checkImageProcessing } from "@/lib/processing/check-processing";
import { actionClient } from "@/lib/safe-action";
import { ActionResult } from "@/lib/types";
import { z } from "zod";
import { Logger } from "next-axiom";
import { waitForImageProcessing } from "@/lib/processing/wait-for-processing";

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

        await waitForImageProcessing(bgRemoveUrl, actionLog);

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
