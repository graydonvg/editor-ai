"use server";

import { actionClient } from "@/lib/safe-action";
import { ActionResult } from "@/lib/types";
import { z } from "zod";
import { Logger } from "next-axiom";
import { waitForImageProcessing } from "@/lib/processing/wait-for-processing";

const log = new Logger();
const actionLog = log.with({ context: "actions/area-extract-action" });

const areaExtractSchema = z.object({
  activeImageUrl: z.string(),
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
      parsedInput: { activeImageUrl, prompts, multiple, mode, invert, format },
    }): Promise<ActionResult<string, string>> => {
      actionLog.info("Starting areaExtractAction", {
        activeImageUrl,
        prompts,
        multiple,
        mode,
        invert,
        format,
      });

      try {
        const areaExtractUrl = constructUrl({
          activeImageUrl,
          prompts,
          multiple,
          mode,
          invert,
          format,
        });

        await waitForImageProcessing(areaExtractUrl, actionLog);

        return { result: areaExtractUrl };
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

function constructUrl(params: z.infer<typeof areaExtractSchema>) {
  const { activeImageUrl, prompts, multiple, mode, invert, format } = params;
  const urlParts = activeImageUrl.split(format);
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
