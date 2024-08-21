"use client";

import { uploadImageAction } from "@/actions/upload-image-action";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "../ui/Card";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  imageGenerationStarted,
  imageGenerationStopped,
} from "@/lib/redux/features/imageSlice";
import { activeLayerSet, layerUpdated } from "@/lib/redux/features/layerSlice";

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
        const formData = new FormData();
        formData.append("image", acceptedFiles[0]);

        const objectUrl = URL.createObjectURL(acceptedFiles[0]);

        dispatch(imageGenerationStarted());
        dispatch(
          layerUpdated({
            id: activeLayer.id,
            url: objectUrl,
            width: 0,
            height: 0,
            name: "uploading",
            publicId: "",
            format: "",
            resourceType: "image",
          }),
        );
        dispatch(activeLayerSet(activeLayer.id));

        const res = await uploadImageAction({ image: formData });

        if (res?.data?.result) {
          dispatch(
            layerUpdated({
              id: activeLayer.id,
              url: res.data.result.url,
              width: res.data.result.width,
              height: res.data.result.height,
              name: res.data.result.original_filename,
              publicId: res.data.result.public_id,
              format: res.data.result.format,
              resourceType: res.data.result.resource_type,
            }),
          );
          dispatch(activeLayerSet(activeLayer.id));
        }

        dispatch(imageGenerationStopped());
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
              <p className="text-2xl text-muted-foreground">
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
