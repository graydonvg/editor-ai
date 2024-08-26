"use client";

import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "../ui/Card";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  generationStarted,
  generationStopped,
} from "@/lib/redux/features/imageSlice";
import { activeLayerSet, layerUpdated } from "@/lib/redux/features/layerSlice";
import { toast } from "react-toastify";
import { handleToastUpdate } from "../ui/Toast";
import Lottie from "lottie-react";
import imageUpload from "../../../public/animations/video-upload.json";
import { uploadVideoAction } from "@/actions/upload-video-action";

export default function UploadVideo() {
  const dispatch = useAppDispatch();
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    accept: {
      "video/mp4": [".mp4", ".MP4"],
    },
    onDrop: async (acceptedFiles, fileRejections) => {
      if (acceptedFiles.length) {
        const toastId = toast.loading("Uploading...");

        const formData = new FormData();
        formData.append("video", acceptedFiles[0]);

        dispatch(generationStarted());

        dispatch(activeLayerSet(activeLayer.id));

        const res = await uploadVideoAction({ video: formData });

        if (res?.data?.result) {
          handleToastUpdate(toastId, "Upload successful", "success");

          const videoUrl = res.data.result.url;
          const videoThumbnailUrl = videoUrl.replace(/\.[^/.]+$/, ".jpg");

          dispatch(
            layerUpdated({
              id: activeLayer.id,
              url: videoUrl,
              name: res.data.result.original_filename,
              width: res.data.result.width,
              height: res.data.result.height,
              publicId: res.data.result.public_id,
              format: res.data.result.format,
              resourceType: res.data.result.resource_type,
              thumbnailUrl: videoThumbnailUrl,
            }),
          );

          dispatch(activeLayerSet(activeLayer.id));
        }

        if (res?.data?.error) {
          handleToastUpdate(toastId, res.data.error, "error");
        }

        dispatch(generationStopped());
      }
    },
  });

  return (
    <>
      {!activeLayer.url ? (
        <Card
          {...getRootProps()}
          className={cn(
            "transition-all ease-out hover:cursor-pointer hover:border-primary hover:bg-secondary",
            {
              "animate-pulse border-primary bg-secondary": isDragActive,
            },
          )}
        >
          <CardContent className="flex h-full flex-col items-center justify-center px-2 py-24 text-xs">
            <input {...getInputProps()} type="text" />
            <div className="flex flex-col items-center justify-center gap-2">
              <Lottie animationData={imageUpload} className="h-48" />
              <p className="text-2xl text-muted-foreground">
                {isDragActive
                  ? "Drop your video here!"
                  : "Start by uploading a video"}
              </p>
              <p className="text-muted-foreground">Supported formats .mp4</p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
