import { useAppSelector } from "@/lib/redux/hooks";
import { useState } from "react";
import UploadImage from "./UploadImage";
import { cn } from "@/lib/utils";
import { ImageIcon, Video } from "lucide-react";
import { Button } from "../ui/Button";
import UploadVideo from "./UploadVideo";

export default function UploadForm() {
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);
  const [selectedType, setSelectedType] = useState("image");

  return (
    <>
      {!activeLayer.url ? (
        <div className="flex h-full w-full flex-col justify-center p-24">
          {selectedType === "image" ? <UploadImage /> : null}
          {selectedType === "video" ? <UploadVideo /> : null}

          <div className="flex items-center justify-center gap-8 py-8">
            <Button
              onClick={() => setSelectedType("image")}
              variant="outline"
              className={cn(
                "flex h-fit cursor-pointer flex-col items-center justify-center gap-4 border-secondary px-6 py-4 text-muted-foreground",
                {
                  "border-primary text-primary": selectedType === "image",
                },
              )}
            >
              Image Mode
              <ImageIcon size={36} />
            </Button>
            <Button
              onClick={() => setSelectedType("video")}
              variant="outline"
              className={cn(
                "flex h-fit cursor-pointer flex-col items-center justify-center gap-4 border-secondary px-6 py-4 text-muted-foreground",
                {
                  "border-primary text-primary": selectedType === "video",
                },
              )}
            >
              Video Mode
              <Video size={36} />
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
