"use server";

import { actionClient } from "@/lib/safe-action";
import { ActionResult } from "@/lib/types";
import { z } from "zod";
import { Logger } from "next-axiom";
import { waitForResourceProcessing } from "@/lib/processing/wait-for-processing";

const log = new Logger();
const actionLog = log.with({ context: "actions/bg-replace-action" });

const bgReplaceSchema = z.object({
  assetUrl: z.string(),
  prompt: z.string(),
});

export const bgReplaceAction = actionClient
  .schema(bgReplaceSchema)
  .action(
    async ({
      parsedInput: { assetUrl, prompt },
    }): Promise<ActionResult<string, string>> => {
      actionLog.info("Starting bgReplaceAction", {
        assetUrl,
        prompt,
      });

      try {
        const bgReplaceUrl = constructUrl({ assetUrl, prompt });

        await waitForResourceProcessing(bgReplaceUrl, "image", actionLog);

        return { result: bgReplaceUrl };
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

function constructUrl({ assetUrl, prompt }: z.infer<typeof bgReplaceSchema>) {
  const [baseUrl, imagePath] = assetUrl.split("/upload/");

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
