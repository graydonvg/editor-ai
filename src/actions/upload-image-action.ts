"use server";

import cloudinary from "@/lib/cloudinary";
import { actionClient } from "@/lib/safe-action";
import { ActionResult } from "@/lib/types";
import { UploadApiResponse } from "cloudinary";
import { z } from "zod";
import { Logger } from "next-axiom";

const log = new Logger();
const actionLog = log.with({ context: "actions/upload-image-action" });

const formDataSchema = z.object({
  image: z.instanceof(FormData),
});

export const uploadImageAction = actionClient
  .schema(formDataSchema)
  .action(
    async ({
      parsedInput: { image },
    }): Promise<ActionResult<UploadApiResponse, string>> => {
      actionLog.info("Starting uploadImageAction");

      const formImage = image.get("image") as File | null;

      if (!formImage) {
        const message = "No image provided";
        actionLog.warn(message);
        return { error: message };
      }

      try {
        actionLog.info("Converting image file to buffer", {
          fileName: formImage.name,
        });
        const buffer = Buffer.from(await formImage.arrayBuffer());

        actionLog.info("Uploading image", { fileName: formImage.name });
        const result = await uploadImageToCloudinary(buffer, formImage.name);

        actionLog.info("Image uploaded successfully", {
          publicId: result.public_id,
        });

        return { result };
      } catch (error) {
        const message = "An unexpected error occurred during image upload";

        actionLog.error(message, { error });

        return { error: message };
      } finally {
        await log.flush();
      }
    },
  );

function uploadImageToCloudinary(
  buffer: Buffer,
  fileName: string,
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          use_filename: true,
          unique_filename: false,
          filename_override: fileName,
        },
        (error, result) => {
          if (error) {
            actionLog.error("Error during upload stream", { error });
            return reject(error);
          }

          resolve(result as UploadApiResponse);
        },
      )
      .end(buffer);
  });
}
