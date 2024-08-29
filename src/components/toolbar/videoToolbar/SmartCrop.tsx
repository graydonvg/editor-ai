import { cropVideoAction } from "@/actions/crop-video-action";
import TikTok from "@/components/icons/TikTok";
import Youtube from "@/components/icons/Youtube";
import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { handleToastUpdate } from "@/components/ui/Toast";
import {
  generationStarted,
  generationStopped,
} from "@/lib/redux/features/imageSlice";
import { activeLayerSet, layerAdded } from "@/lib/redux/features/layerSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { cn } from "@/lib/utils";
import { Crop, Square } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

const BUTTON_DISABLED_KEYWORDS = ["ar_", "c_fill"];

export default function SmartCrop() {
  const dispatch = useAppDispatch();
  const isGenerating = useAppSelector((state) => state.image.isGenerating);
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [isCropping, setIsCropping] = useState(false);

  async function cropVideo() {
    setIsCropping(true);
    dispatch(generationStarted());
    const toastId = toast.loading("Processing...");

    const result = await cropVideoAction({
      assetUrl: activeLayer.url!,
      aspectRatio: aspectRatio,
      height: activeLayer.height,
    });

    if (result?.data?.result) {
      const newLayerId = crypto.randomUUID();

      handleToastUpdate(toastId, "Processing completed", "success");

      const videoUrl = result.data.result;
      const videoThumbnailUrl = videoUrl.replace(/\.[^/.]+$/, ".jpg");
      const ratio = aspectRatio.split(":");
      const ratioDivision = Number(ratio[0]) / Number(ratio[1]);

      dispatch(
        layerAdded({
          id: newLayerId,
          url: result.data.result,
          name: "cropped-" + activeLayer.name,
          format: activeLayer.format,
          height: activeLayer.height,
          width: activeLayer.height * ratioDivision,
          publicId: activeLayer.publicId,
          resourceType: activeLayer.resourceType,
          posterUrl: videoThumbnailUrl,
        }),
      );

      dispatch(activeLayerSet(newLayerId));
    }

    if (result?.data?.error) {
      handleToastUpdate(toastId, result.data.error, "error");
    }

    setIsCropping(false);
    dispatch(generationStopped());
  }

  return (
    <Popover>
      <PopoverTrigger
        disabled={
          !activeLayer.url ||
          BUTTON_DISABLED_KEYWORDS.some((keyword) =>
            activeLayer.url?.includes(keyword),
          )
        }
        asChild
      >
        <Button variant="outline" className="p-8">
          <span className="flex flex-col items-center justify-center gap-1 text-xs font-medium">
            Smart Crop <Crop size={20} aria-hidden="true" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        className="ml-4 w-full max-w-sm space-y-6"
      >
        <h3 className="text-lg font-medium leading-none tracking-tight">
          Smart Crop
        </h3>
        <p className="text-pretty text-sm text-muted-foreground">
          Automatically crop your video to the requested dimensions while always
          keeping the main video subject in focus.
        </p>
        <div className="space-y-2">
          <h4 className="font-medium">Format</h4>
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={() => setAspectRatio("16:9")}
              variant="outline"
              className={cn(
                "flex h-fit w-full cursor-pointer flex-col items-center justify-center gap-2 border-secondary p-4 text-muted-foreground",
                {
                  "border-primary text-primary": aspectRatio === "16:9",
                },
              )}
            >
              <h5 className="text-base font-bold">Youtube</h5>
              <span className="text-sm font-bold text-muted-foreground">
                16:9
              </span>
              <Youtube />
            </Button>
            <Button
              onClick={() => setAspectRatio("9:16")}
              variant="outline"
              className={cn(
                "flex h-fit w-full cursor-pointer flex-col items-center justify-center gap-2 border-secondary p-4 text-muted-foreground",
                {
                  "border-primary text-primary": aspectRatio === "9:16",
                },
              )}
            >
              <h5 className="text-base font-bold">Tiktok</h5>
              <span className="text-sm font-bold text-muted-foreground">
                9:16
              </span>
              <TikTok />
            </Button>
            <Button
              onClick={() => setAspectRatio("1:1")}
              variant="outline"
              className={cn(
                "flex h-fit w-full cursor-pointer flex-col items-center justify-center gap-2 border-secondary p-4 text-muted-foreground",
                {
                  "border-primary text-primary": aspectRatio === "1:1",
                },
              )}
            >
              <h5 className="text-base font-bold">Square</h5>
              <span className="text-sm font-bold text-muted-foreground">
                1:1
              </span>
              <Square className="h-10 w-10 text-primary" />
            </Button>
          </div>
        </div>
        <Button
          onClick={cropVideo}
          className="w-full"
          disabled={
            !activeLayer.url ||
            isGenerating ||
            isCropping ||
            BUTTON_DISABLED_KEYWORDS.some((keyword) =>
              activeLayer.url?.includes(keyword),
            )
          }
        >
          {isCropping ? "Cropping..." : "Crop Video"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
