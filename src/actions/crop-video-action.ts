"use server";

import { actionClient } from "@/lib/safe-action";
import { ActionResult } from "@/lib/types";
import { z } from "zod";
import { Logger } from "next-axiom";
import { waitForResourceProcessing } from "@/lib/processing/wait-for-processing";

const log = new Logger();
const actionLog = log.with({ context: "actions/crop-video-action" });

const cropVideoSchema = z.object({
  assetUrl: z.string(),
  aspectRatio: z.string(),
  height: z.number(),
});

export const cropVideoAction = actionClient
  .schema(cropVideoSchema)
  .action(
    async ({
      parsedInput: { assetUrl, aspectRatio, height },
    }): Promise<ActionResult<string, string>> => {
      actionLog.info("Starting cropVideoAction", {
        assetUrl,
        aspectRatio,
        height,
      });

      try {
        const cropVideoUrl = constructUrl({
          assetUrl,
          aspectRatio,
          height,
        });

        await waitForResourceProcessing(cropVideoUrl, "video", actionLog);

        return { result: cropVideoUrl };
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

function constructUrl({
  assetUrl,
  aspectRatio,
  height,
}: z.infer<typeof cropVideoSchema>) {
  const [baseUrl, videoPath] = assetUrl.split("/upload/");

  if (!baseUrl || !videoPath) {
    throw new Error("Invalid URL format");
  }

  const cropVideoUrl = `${baseUrl}/upload/ar_${aspectRatio},c_fill,g_auto,h_${height}/${videoPath}`;

  actionLog.info("Constructed URL successfully", {
    cropVideoUrl,
  });

  return cropVideoUrl;
}
