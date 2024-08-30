"use client";

import { uploadImageAction } from "@/actions/upload-image-action";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "../ui/Card";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  generationStarted,
  generationStopped,
} from "@/lib/redux/features/imageSlice";
import { activeLayerSet, layerUpdated } from "@/lib/redux/features/layerSlice";
import { Flip, toast } from "react-toastify";
import { handleToastUpdate } from "../ui/Toast";
import Lottie from "lottie-react";
import imageUpload from "../../../public/animations/image-upload.json";

export default function UploadImage() {
  const dispatch = useAppDispatch();
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    accept: {
      "image/png": [".png"],
      "image/jpg": [".jpg"],
      "image/jpeg": [".jpeg"],
      "image/webp": [".webp"],
    },
    onDrop: async (acceptedFiles, fileRejections) => {
      if (acceptedFiles.length) {
        const toastId = toast.loading("Uploading...");

        const formData = new FormData();
        formData.append("image", acceptedFiles[0]);

        const objectUrl = URL.createObjectURL(acceptedFiles[0]);

        dispatch(generationStarted());

        dispatch(
          layerUpdated({
            id: activeLayer.id,
            url: objectUrl,
            name: acceptedFiles[0].name,
            width: 0,
            height: 0,
            publicId: "",
            format: "",
            resourceType: "image",
          }),
        );

        dispatch(activeLayerSet(activeLayer.id));

        const result = await uploadImageAction({ image: formData });

        if (result?.data?.result) {
          handleToastUpdate(toastId, "Upload successful", "success");

          dispatch(
            layerUpdated({
              id: activeLayer.id,
              url: result.data.result.url,
              name: result.data.result.original_filename,
              width: result.data.result.width,
              height: result.data.result.height,
              publicId: result.data.result.public_id,
              format: result.data.result.format,
              resourceType: result.data.result.resource_type,
            }),
          );

          dispatch(activeLayerSet(activeLayer.id));
        }

        if (result?.data?.error) {
          handleToastUpdate(toastId, result.data.error, "error");
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
            "transition-all ease-out hover:cursor-pointer hover:border-primary hover:bg-accent",
            {
              "animate-pulse border-primary bg-accent": isDragActive,
            },
          )}
        >
          <CardContent className="flex h-full flex-col items-center justify-center px-2 py-24 text-xs">
            <input {...getInputProps()} type="text" />
            <div className="flex flex-col items-center justify-center gap-2">
              <Lottie animationData={imageUpload} className="h-48" />
              <p className="text-pretty text-center text-2xl text-muted-foreground">
                {isDragActive
                  ? "Drop your image here!"
                  : "Start by uploading an image"}
              </p>
              <p className="text-muted-foreground">
                Supported formats .jpg .jpeg .png .webp
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
