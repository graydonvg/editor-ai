"use server";

import { actionClient } from "@/lib/safe-action";
import { ActionResult } from "@/lib/types";
import { z } from "zod";
import { Logger } from "next-axiom";
import { waitForResourceProcessing } from "@/lib/processing/wait-for-processing";

const log = new Logger();
const actionLog = log.with({ context: "actions/gen-fill-action" });

const genFillSchema = z.object({
  assetUrl: z.string(),
  aspectRatio: z.string(),
  width: z.number(),
  height: z.number(),
});

export const genFillAction = actionClient
  .schema(genFillSchema)
  .action(
    async ({
      parsedInput: { assetUrl, aspectRatio, width, height },
    }): Promise<ActionResult<string, string>> => {
      actionLog.info("Starting genFillAction", {
        assetUrl,
        aspectRatio,
        width,
        height,
      });

      try {
        const genFillUrl = constructUrl({
          assetUrl,
          aspectRatio,
          width,
          height,
        });

        await waitForResourceProcessing(genFillUrl, "image", actionLog);

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
  const { assetUrl, aspectRatio, width, height } = params;
  const [baseUrl, imagePath] = assetUrl.split("/upload/");

  if (!baseUrl || !imagePath) {
    throw new Error("Invalid URL format");
  }

  const genFillUrl = `${baseUrl}/upload/ar_${aspectRatio},b_gen_fill,c_pad,w_${width},h_${height}/${imagePath}`;

  actionLog.info("Constructed URL successfully", {
    genFillUrl,
  });

  return genFillUrl;
}
