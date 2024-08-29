"use server";

import { actionClient } from "@/lib/safe-action";
import { ActionResult } from "@/lib/types";
import { z } from "zod";
import { Logger } from "next-axiom";
import { waitForResourceProcessing } from "@/lib/processing/wait-for-processing";

const log = new Logger();
const actionLog = log.with({ context: "actions/bg-remove-action" });

const bgRemoveSchema = z.object({
  assetUrl: z.string(),
  format: z.string(),
});

export const bgRemoveAction = actionClient
  .schema(bgRemoveSchema)
  .action(
    async ({
      parsedInput: { assetUrl, format },
    }): Promise<ActionResult<string, string>> => {
      actionLog.info("Starting bgRemoveAction", {
        assetUrl,
        format,
      });

      try {
        const bgRemoveUrl = constructUrl({ assetUrl, format });

        await waitForResourceProcessing(bgRemoveUrl, "image", actionLog);

        return { result: bgRemoveUrl };
      } catch (error) {
        actionLog.error("An unexpected error occurred", {
          error,
        });

        if (error instanceof Error) {
          return { error: error.message };
        }

        return {
          error: "An unexpected error occurred. Please try again later.",
        };
      } finally {
        await log.flush();
      }
    },
  );

function constructUrl({ assetUrl, format }: z.infer<typeof bgRemoveSchema>) {
  const urlParts = assetUrl.split(format);
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
