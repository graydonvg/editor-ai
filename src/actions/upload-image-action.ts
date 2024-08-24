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

      const formImage = image.get("image");

      if (!formImage || !image) {
        const messgae = "No image provided";

        actionLog.warn(messgae);

        return { error: messgae };
      }

      const file = formImage as File;

      try {
        actionLog.info("Converting image file to buffer", {
          fileName: file.name,
        });

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        actionLog.info("Uploading image", { fileName: file.name });

        return new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                upload_preset: "ml_default",
              },
              function (error, result) {
                if (error) {
                  actionLog.error("Error during upload", {
                    error,
                  });

                  reject({ error: error.message });
                  return;
                }

                if (result) {
                  actionLog.info("Image uploaded successfully", {
                    publicId: result.public_id,
                  });

                  resolve({ result });
                }
              },
            )
            .end(buffer);
        });
      } catch (error) {
        const message =
          "An unexpected error occurred during image upload process";

        actionLog.error(message, {
          error,
        });

        return { error: message };
      } finally {
        await log.flush();
      }
    },
  );
