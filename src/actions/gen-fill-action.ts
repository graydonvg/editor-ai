"use server";

import { actionClient } from "@/lib/safe-action";
import { ActionResult } from "@/lib/types";
import { z } from "zod";
import { Logger } from "next-axiom";
import { waitForImageProcessing } from "@/lib/processing/wait-for-processing";

const log = new Logger();
const actionLog = log.with({ context: "actions/gen-fill-action" });

const genFillSchema = z.object({
  activeImageUrl: z.string(),
  aspectRatio: z.string(),
  width: z.number(),
  height: z.number(),
});

export const genFillAction = actionClient
  .schema(genFillSchema)
  .action(
    async ({
      parsedInput: { activeImageUrl, aspectRatio, width, height },
    }): Promise<ActionResult<string, string>> => {
      actionLog.info("Starting genFillAction", {
        activeImageUrl,
        aspectRatio,
        width,
        height,
      });

      try {
        const genFillUrl = constructUrl({
          activeImageUrl,
          aspectRatio,
          width,
          height,
        });

        await waitForImageProcessing(genFillUrl, actionLog);

        return { result: genFillUrl };
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

function constructUrl(params: z.infer<typeof genFillSchema>) {
  const { activeImageUrl, aspectRatio, width, height } = params;
  const [baseUrl, imagePath] = activeImageUrl.split("/upload/");

  if (!baseUrl || !imagePath) {
    throw new Error("Invalid URL format");
  }

  const genFillUrl = `${baseUrl}/upload/ar_${aspectRatio},b_gen_fill,c_pad,w_${width},h_${height}/${imagePath}`;

  actionLog.info("Constructed URL successfully", {
    genFillUrl,
  });

  return genFillUrl;
}
