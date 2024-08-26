import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";
import { Button } from "../ui/Button";
import { ImageOff } from "lucide-react";
import { activeLayerSet, layerAdded } from "@/lib/redux/features/layerSlice";
import {
  generationStarted,
  generationStopped,
} from "@/lib/redux/features/imageSlice";
import { bgRemoveAction } from "@/actions/bg-remove-action";
import { toast } from "react-toastify";
import { handleToastUpdate } from "../ui/Toast";

export default function BgRemove() {
  const dispatch = useAppDispatch();
  const isGenerating = useAppSelector((state) => state.image.isGenerating);
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);

  async function removeBackground() {
    dispatch(generationStarted());
    const toastId = toast.loading("Processing...");

    const res = await bgRemoveAction({
      activeImageUrl: activeLayer.url!,
      format: activeLayer.format!,
    });

    const newLayerId = crypto.randomUUID();

    if (res?.data?.result) {
      handleToastUpdate(toastId, "Processing completed", "success");

      dispatch(
        layerAdded({
          id: newLayerId,
          url: res?.data?.result,
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

    if (res?.data?.error) {
      handleToastUpdate(toastId, res.data.error, "error");
    }

    dispatch(generationStopped());
  }

  return (
    <Popover>
      <PopoverTrigger disabled={!activeLayer.url} asChild>
        <Button variant="outline" className="p-8">
          <span className="flex flex-col items-center justify-center gap-1 text-xs font-medium">
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            Background Removal <ImageOff size={20} aria-hidden="true" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="ml-4 w-full max-w-sm space-y-6"
        side="right"
        align="start"
      >
        <h3 className="font-medium leading-none">Background Removal</h3>
        <p className="text-pretty text-sm text-muted-foreground">
          Remove the background of an image with one simple click.
        </p>
        <Button
          disabled={!activeLayer.url || isGenerating}
          onClick={removeBackground}
          className="w-full"
        >
          {isGenerating ? "Removing..." : "Remove Background"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
