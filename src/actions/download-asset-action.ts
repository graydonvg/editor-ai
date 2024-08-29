"use server";

import { actionClient } from "@/lib/safe-action";
import { ActionResult } from "@/lib/types";
import { z } from "zod";
import { Logger } from "next-axiom";
import { waitForResourceProcessing } from "@/lib/processing/wait-for-processing";

const log = new Logger();
const actionLog = log.with({ context: "actions/download-asset-action" });

const downloadAssetSchema = z.object({
  assetUrl: z.string(),
  publicId: z.string(),
  quality: z.string(),
  resourceType: z.string(),
  format: z.string(),
});

export const downloadAssetAction = actionClient
  .schema(downloadAssetSchema)
  .action(
    async ({
      parsedInput: { assetUrl, publicId, quality, resourceType, format },
    }): Promise<
      ActionResult<
        {
          url: string;
          filename: string;
        },
        string
      >
    > => {
      actionLog.info("Starting downloadAssetAction", {
        assetUrl,
        publicId,
        quality,
        resourceType,
        format,
      });

      try {
        const assetQuality = mapQualityToParam({ quality });

        const url = constructUrl({ assetUrl, quality: assetQuality });

        await waitForResourceProcessing(
          url,
          resourceType as "image" | "video",
          log,
        );

        // const response = await fetch(url);

        // if (!response.ok) {
        //   throw new Error(`Failed to fetch ${resourceType}`);
        // }

        // const blob = await response.blob();
        // console.log(blob);

        // const downloadUrl = URL.createObjectURL(blob);
        // console.log(downloadUrl);

        return {
          result: {
            url,
            filename: `${publicId}.${quality}.${format}`,
          },
        };
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

function mapQualityToParam({
  quality,
}: Pick<z.infer<typeof downloadAssetSchema>, "quality">) {
  switch (quality) {
    case "original":
      break;
    case "large":
      return "q_80";
    case "medium":
      return "q_50";
    case "small":
      return "q_30";
    default:
      throw new Error("Invalid quality parameter");
  }
}

function constructUrl({
  assetUrl,
  quality,
}: {
  assetUrl: string;
  quality?: string;
}) {
  const [baseUrl, assetPath] = assetUrl!.split("/upload/");

  if (!baseUrl || !assetPath) {
    throw new Error("Invalid URL format");
  }

  const url = quality ? `${baseUrl}/upload/${quality}/${assetPath}` : assetUrl!;

  actionLog.info("Constructed URL successfully", {
    url,
  });

  return url;
}
