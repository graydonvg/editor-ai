import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { Button } from "@/components/ui/Button";
import { Eraser } from "lucide-react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import { activeLayerSet, layerAdded } from "@/lib/redux/features/layerSlice";
import {
  generationStarted,
  generationStopped,
} from "@/lib/redux/features/imageSlice";
import { genRemoveAction } from "@/actions/gen-remove-action";
import { toast } from "react-toastify";
import { handleToastUpdate } from "@/components/ui/Toast";

export default function GenRemove() {
  const dispatch = useAppDispatch();
  const isGenerating = useAppSelector((state) => state.image.isGenerating);
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);
  const [selection, setSelection] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);

  async function removeObject() {
    setIsRemoving(true);
    dispatch(generationStarted());
    const toastId = toast.loading("Processing...");

    const result = await genRemoveAction({
      prompt: selection,
      assetUrl: activeLayer.url!,
    });

    if (result?.data?.result) {
      const newLayerId = crypto.randomUUID();

      handleToastUpdate(toastId, "Processing completed", "success");

      dispatch(
        layerAdded({
          id: newLayerId,
          url: result.data.result,
          name: "gen-removed-" + activeLayer.name,
          format: activeLayer.format,
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
      <PopoverTrigger disabled={!activeLayer.url} asChild>
        <Button variant="outline" className="p-8">
          <span className="flex flex-col items-center justify-center gap-1 text-xs font-medium">
            Generative Remove <Eraser size={20} />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="ml-4 w-full max-w-sm space-y-6"
        side="right"
        align="start"
      >
        <h3 className="text-lg font-medium leading-none tracking-tight">
          Generative Remove
        </h3>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Remove unwanted objects, text, or user-defined regions from images.
          </p>
          <p className="text-sm text-muted-foreground">
            Specify the item you want to remove by using a short prompt like:
            fork, text, mountain, etc.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="object">Object:</Label>
          <Input
            id="object"
            value={selection}
            onChange={(e) => setSelection(e.target.value)}
            disabled={isGenerating}
            className="h-8"
            placeholder="Enter 1 object at a time"
          />
        </div>
        <Button
          disabled={
            !activeLayer.url || !selection || isGenerating || isRemoving
          }
          onClick={removeObject}
          className="w-full"
        >
          {isRemoving ? "Removing..." : "Remove Object"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
