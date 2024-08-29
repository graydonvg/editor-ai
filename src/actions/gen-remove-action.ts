"use server";

import { actionClient } from "@/lib/safe-action";
import { ActionResult } from "@/lib/types";
import { z } from "zod";
import { Logger } from "next-axiom";
import { waitForResourceProcessing } from "@/lib/processing/wait-for-processing";

const log = new Logger();
const actionLog = log.with({ context: "actions/gen-remove-action" });

const genRemoveSchema = z.object({
  prompt: z.string(),
  assetUrl: z.string(),
});

export const genRemoveAction = actionClient
  .schema(genRemoveSchema)
  .action(
    async ({
      parsedInput: { prompt, assetUrl },
    }): Promise<ActionResult<string, string>> => {
      actionLog.info("Starting genRemoveAction", {
        prompt,
        assetUrl,
      });

      try {
        const genRemoveUrl = constructUrl({ assetUrl, prompt });

        await waitForResourceProcessing(genRemoveUrl, "image", actionLog);

        return { result: genRemoveUrl };
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

function constructUrl({ assetUrl, prompt }: z.infer<typeof genRemoveSchema>) {
  const [baseUrl, imagePath] = assetUrl.split("/upload/");

  if (!baseUrl || !imagePath) {
    throw new Error("Invalid URL format");
  }

  const genRemoveUrl = `${baseUrl}/upload/e_gen_remove:prompt_${encodeURIComponent(prompt)}/${imagePath}`;

  actionLog.info("Constructed URL successfully", {
    genRemoveUrl,
  });

  return genRemoveUrl;
}
