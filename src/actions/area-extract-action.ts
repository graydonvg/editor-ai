"use server";

import { actionClient } from "@/lib/safe-action";
import { ActionResult } from "@/lib/types";
import { z } from "zod";
import { Logger } from "next-axiom";
import { waitForResourceProcessing } from "@/lib/processing/wait-for-processing";

const log = new Logger();
const actionLog = log.with({ context: "actions/area-extract-action" });

const areaExtractSchema = z.object({
  assetUrl: z.string(),
  prompts: z.array(z.string()),
  multiple: z.boolean().optional(),
  mode: z.enum(["content", "mask"]),
  invert: z.boolean().optional(),
  format: z.string(),
});

export const areaExtractAction = actionClient
  .schema(areaExtractSchema)
  .action(
    async ({
      parsedInput: { assetUrl, prompts, multiple, mode, invert, format },
    }): Promise<ActionResult<string, string>> => {
      actionLog.info("Starting areaExtractAction", {
        assetUrl,
        prompts,
        multiple,
        mode,
        invert,
        format,
      });

      try {
        const areaExtractUrl = constructUrl({
          assetUrl,
          prompts,
          multiple,
          mode,
          invert,
          format,
        });

        await waitForResourceProcessing(areaExtractUrl, "image", actionLog);

        return { result: areaExtractUrl };
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

function constructUrl(params: z.infer<typeof areaExtractSchema>) {
  const { assetUrl, prompts, multiple, mode, invert, format } = params;
  const urlParts = assetUrl.split(format);
  const pngConvert = urlParts[0] + "png";
  const [baseUrl, imagePath] = pngConvert.split("/upload/");

  if (!baseUrl || !imagePath) {
    throw new Error("Invalid URL format");
  }

  let extractParams = `prompt_(${prompts.map((prompt) => encodeURIComponent(prompt)).join(";")})`;

  if (multiple) extractParams += ";multiple_true";
  if (mode === "mask") extractParams += ";mode_mask";
  if (invert) extractParams += ";invert_true";

  const areaExtractUrl = `${baseUrl}/upload/e_extract:${extractParams}/${imagePath}`;

  actionLog.info("Constructed URL successfully", {
    areaExtractUrl,
  });

  return areaExtractUrl;
}
