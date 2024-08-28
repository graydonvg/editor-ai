"use server";

import { actionClient } from "@/lib/safe-action";
import { ActionResult } from "@/lib/types";
import { z } from "zod";
import { Logger } from "next-axiom";
import cloudinary from "@/lib/cloudinary";
import { wait } from "@/lib/utils";

const log = new Logger();
const actionLog = log.with({ context: "actions/transcribe-video-action" });

const transcribeVideoSchema = z.object({
  publicId: z.string(),
});

export const transcribeVideoAction = actionClient
  .schema(transcribeVideoSchema)
  .action(
    async ({
      parsedInput: { publicId },
    }): Promise<ActionResult<string, string>> => {
      actionLog.info("Starting transcribeVideoAction", { publicId });

      try {
        await updateVideoWithTranscription(publicId);

        const transcriptionStatus = await waitForVideoTranscription(publicId);

        if (transcriptionStatus === "complete") {
          const transcribedVideoUrl = generateTranscribedVideoUrl(publicId);

          return { result: transcribedVideoUrl };
        } else {
          actionLog.error("Transcription failed", { publicId });

          return {
            error: "Video transcription failed. Please try again later.",
          };
        }
      } catch (error) {
        actionLog.error("An unexpected error occurred", { error, publicId });

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

async function updateVideoWithTranscription(publicId: string) {
  actionLog.info("Updating video with transcription request", { publicId });

  try {
    await cloudinary.api.update(publicId, {
      resource_type: "video",
      raw_convert: "google_speech",
    });

    actionLog.info("Video transcription request sent successfully", {
      publicId,
    });
  } catch (error) {
    actionLog.error("Error during video transcription request", {
      error,
      publicId,
    });

    throw error;
  }
}

async function waitForVideoTranscription(publicId: string) {
  const maxAttempts = 5;
  const initialDelay = 2000;

  actionLog.info("Waiting for video transcription", {
    publicId,
    maxAttempts,
    initialDelay,
  });

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    actionLog.info(`Checking transcription status (Attempt ${attempt})`, {
      publicId,
    });

    const status = await checkVideoTranscriptionStatus(publicId);

    if (status === "complete" || status === "failed") {
      return status;
    }

    if (attempt < maxAttempts) {
      const delay = initialDelay * Math.pow(2, attempt - 1);

      actionLog.info(`Waiting ${delay}ms before next attempt`, { publicId });

      await wait(delay);
    }
  }

  throw new Error(
    "Unable to transcribe video after multiple attempts. Please try again later.",
  );
}

async function checkVideoTranscriptionStatus(publicId: string) {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: "video",
    });

    const googleSpeechStatus = result?.info?.raw_convert?.google_speech?.status;

    return googleSpeechStatus || "pending";
  } catch (error) {
    actionLog.error("Error during video transcription status check", { error });

    throw error;
  }
}

function generateTranscribedVideoUrl(publicId: string): string {
  actionLog.info("Generating transcribed video URL", { publicId });
  const transcribedVideoUrl = cloudinary.url(publicId, {
    resource_type: "video",
    transformation: [
      {
        overlay: {
          resource_type: "subtitles",
          public_id: `${publicId}.transcript`,
        },
      },
      { flags: "layer_apply" },
    ],
  });
  actionLog.info("Transcribed video URL generated successfully", {
    publicId,
    transcribedVideoUrl,
  });
  return transcribedVideoUrl;
}
