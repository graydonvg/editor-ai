import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { ImageOff } from "lucide-react";
import { activeLayerSet, layerAdded } from "@/lib/redux/features/layerSlice";
import {
  generationStarted,
  generationStopped,
} from "@/lib/redux/features/imageSlice";
import { bgRemoveAction } from "@/actions/bg-remove-action";
import { toast } from "react-toastify";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { handleToastUpdate } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

const BUTTON_DISABLED_KEYWORDS = ["mask", "background_removal"];

export default function BgRemove() {
  const dispatch = useAppDispatch();
  const isGenerating = useAppSelector((state) => state.image.isGenerating);
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);
  const [isRemoving, setIsRemoving] = useState(false);

  async function removeBackground() {
    setIsRemoving(true);
    dispatch(generationStarted());
    const toastId = toast.loading("Processing...");

    const result = await bgRemoveAction({
      assetUrl: activeLayer.url!,
      format: activeLayer.format!,
    });

    if (result?.data?.result) {
      const newLayerId = crypto.randomUUID();

      handleToastUpdate(toastId, "Processing completed", "success");

      dispatch(
        layerAdded({
          id: newLayerId,
          url: result.data.result,
          name: "bg-removed-" + activeLayer.name,
          format: "png",
          height: activeLayer.height,
          width: activeLayer.width,
          publicId: activeLayer.publicId,
          resourceType: activeLayer.resourceType,
        }),
      );

      dispatch(activeLayerSet(newLayerId));
    }

    if (result?.data?.error) {
      handleToastUpdate(toastId, result.data.error, "error");
    }

    setIsRemoving(false);
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
            Background Removal <ImageOff size={20} />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="ml-4 w-full max-w-sm space-y-8"
        side="right"
        align="start"
      >
        <div className="space-y-2">
          <h3 className="text-lg font-medium leading-none tracking-tight">
            Background Removal
          </h3>
          <p className="text-pretty text-sm text-muted-foreground">
            Remove the background of an image with one simple click.
          </p>
        </div>
        <Button
          disabled={
            !activeLayer.url ||
            isGenerating ||
            isRemoving ||
            BUTTON_DISABLED_KEYWORDS.some((keyword) =>
              activeLayer.url?.includes(keyword),
            )
          }
          onClick={removeBackground}
          className="w-full"
        >
          {isRemoving ? "Removing..." : "Remove Background"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
