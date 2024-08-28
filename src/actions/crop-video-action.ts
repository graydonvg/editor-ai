"use server";

import { actionClient } from "@/lib/safe-action";
import { ActionResult } from "@/lib/types";
import { z } from "zod";
import { Logger } from "next-axiom";
import { waitForResourceProcessing } from "@/lib/processing/wait-for-processing";

const log = new Logger();
const actionLog = log.with({ context: "actions/crop-video-action" });

const cropVideoSchema = z.object({
  activeVideoUrl: z.string(),
  aspectRatio: z.string(),
  height: z.number(),
});

export const cropVideoAction = actionClient
  .schema(cropVideoSchema)
  .action(
    async ({
      parsedInput: { activeVideoUrl, aspectRatio, height },
    }): Promise<ActionResult<string, string>> => {
      actionLog.info("Starting cropVideoAction", {
        activeVideoUrl,
        aspectRatio,
        height,
      });

      try {
        const cropVideoUrl = constructUrl({
          activeVideoUrl,
          aspectRatio,
          height,
        });

        await waitForResourceProcessing(cropVideoUrl, "Video", actionLog);

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
  activeVideoUrl,
  aspectRatio,
  height,
}: z.infer<typeof cropVideoSchema>) {
  const [baseUrl, imagePath] = activeVideoUrl.split("/upload/");

  if (!baseUrl || !imagePath) {
    throw new Error("Invalid URL format");
  }

  const cropVideoUrl = `${baseUrl}/upload/ar_${aspectRatio},c_fill,g_auto,h_${height}/${imagePath}`;

  actionLog.info("Constructed URL successfully", {
    cropVideoUrl,
  });

  return cropVideoUrl;
}
