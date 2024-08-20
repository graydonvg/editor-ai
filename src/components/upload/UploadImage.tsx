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

type Props = {};

export default function UploadImage() {
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
        // STATE MANAGEMENT STUFF
        const res = await uploadImageAction({ image: formData });
      }
    },
  });

  return (
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
  );
}
