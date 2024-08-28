"use server";

import cloudinary from "@/lib/cloudinary";
import { actionClient } from "@/lib/safe-action";
import { ActionResult } from "@/lib/types";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { string, z } from "zod";
import { Logger } from "next-axiom";

const log = new Logger();
const actionLog = log.with({ context: "actions/upload-video-action" });

const formDataSchema = z.object({
  video: z.instanceof(FormData),
});

export const uploadVideoAction = actionClient
  .schema(formDataSchema)
  .action(
    async ({
      parsedInput: { video },
    }): Promise<ActionResult<UploadApiResponse, string>> => {
      actionLog.info("Starting uploadVideoAction");

      const formVideo = video.get("video") as File | null;

      if (!formVideo) {
        const message = "No video provided";
        actionLog.warn(message);
        return { error: message };
      }

      try {
        actionLog.info("Converting video file to buffer", {
          fileName: formVideo.name,
        });
        const buffer = Buffer.from(await formVideo.arrayBuffer());

        actionLog.info("Uploading video", { fileName: formVideo.name });
        const result = await uploadVideoToCloudinary(buffer, formVideo.name);

        actionLog.info("Video uploaded successfully", {
          publicId: result.public_id,
        });

        return { result };
      } catch (error) {
        actionLog.error("An unexpected error occurred", { error });

        if (error && (error as UploadApiErrorResponse).http_code) {
          return {
            error: (error as UploadApiErrorResponse).message,
          };
        }

        return {
          error: "An unexpected error occurred. Please try again later.",
        };
      } finally {
        await log.flush();
      }
    },
  );

function uploadVideoToCloudinary(
  buffer: Buffer,
  fileName: string,
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "video",
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
