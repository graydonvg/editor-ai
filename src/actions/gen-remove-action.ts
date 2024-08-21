"use server";

import { checkImageProcessing } from "@/lib/check-processing";
import { actionClient } from "@/lib/safe-action";
import { ActionResult } from "@/lib/types";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const genRemoveSchema = z.object({
  prompt: z.string(),
  activeImageUrl: z.string(),
});

export const genRemoveAction = actionClient
  .schema(genRemoveSchema)
  .action(
    async ({
      parsedInput: { prompt, activeImageUrl },
    }): Promise<ActionResult<string, string>> => {
      try {
        const removeUrl = constructRemoveUrl(activeImageUrl, prompt);

        await waitForImageProcessing(removeUrl);

        return { result: removeUrl };
      } catch (error) {
        if (error instanceof Error) {
          return { error: error.message };
        }
        console.error("Unexpected error:", error);
        return {
          error: "An unexpected error occurred while processing the image.",
        };
      }
    },
  );

function constructRemoveUrl(activeImageUrl: string, prompt: string) {
  const [baseUrl, imagePath] = activeImageUrl.split("/upload/");

  if (!baseUrl || !imagePath) {
    throw new Error("Invalid URL format.");
  }

  return `${baseUrl}/upload/e_gen_remove:${encodeURIComponent(prompt)}/${imagePath}`;
}

async function waitForImageProcessing(url: string) {
  const maxAttempts = 20;
  // const initialDelay = 1000;
  const delay = 1000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const isProcessed = await checkImageProcessing(url);

      if (isProcessed) {
        return;
      }

      // const delay = 1000;
      await sleep(delay);
    } catch (error) {
      if (attempt === maxAttempts) {
        throw new Error("Image processing failed after multiple attempts.");
      }
    }
  }

  throw new Error("Image processing timed out.");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
