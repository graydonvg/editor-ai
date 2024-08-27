import { useAppSelector } from "@/lib/redux/hooks";
import { cn } from "@/lib/utils";
import Image from "next/image";
import ImageComparison from "./ImageComparison";

export default function ActiveImage() {
  const isGenerating = useAppSelector((state) => state.image.isGenerating);
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);
  const layerComparisonMode = useAppSelector(
    (state) => state.layer.layerComparisonMode,
  );
  const comparedLayers = useAppSelector((state) => state.layer.comparedLayers);

  if (!activeLayer.url && comparedLayers.length === 0) return null;

  if (layerComparisonMode && comparedLayers.length > 0) {
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center bg-secondary p-24">
        <ImageComparison />
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-secondary p-24">
      <div className="relative flex h-full w-full items-center justify-center">
        {activeLayer.resourceType === "image" && (
          <Image
            src={activeLayer.url!}
            alt={activeLayer.name!}
            priority
            fill
            sizes="calc(100vw - 792px)"
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
            className="max-h-full max-w-full object-contain"
          />
        )}
      </div>
    </div>
  );
}
