import { useAppSelector } from "@/lib/redux/hooks";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function ActiveImage() {
  const isGenerating = useAppSelector((state) => state.image.isGenerating);
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);

  if (!activeLayer.url) return null;

  return (
    <div className="h-full w-full bg-secondary p-24">
      <div className="relative flex h-full w-full items-center justify-center">
        {activeLayer.resourceType === "image" && (
          <Image
            src={activeLayer.url}
            alt={activeLayer.name!}
            fill
            className={cn("rounded-lg object-contain", {
              "animate-pulse": isGenerating,
            })}
          />
        )}

        {activeLayer.resourceType === "video" && (
          <video
            src={activeLayer.transcriptionUrl || activeLayer.url}
            width={activeLayer.width}
            height={activeLayer.height}
            controls
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        )}
      </div>
    </div>
  );
}
