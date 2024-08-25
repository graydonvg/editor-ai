import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";
import { Button } from "../ui/Button";
import { Eraser } from "lucide-react";
import { Label } from "../ui/Label";
import { Input } from "../ui/Input";
import { useState } from "react";
import { activeLayerSet, layerAdded } from "@/lib/redux/features/layerSlice";
import {
  generationStarted,
  generationStopped,
} from "@/lib/redux/features/imageSlice";
import { genRemoveAction } from "@/actions/gen-remove-action";
import { toast } from "react-toastify";
import { handleToastUpdate } from "../ui/Toast";

export default function GenRemove() {
  const dispatch = useAppDispatch();
  const isGenerating = useAppSelector((state) => state.image.isGenerating);
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);
  const [object, setObject] = useState("");

  async function removeObject() {
    dispatch(generationStarted());
    const toastId = toast.loading(`Removing ${object}...`);

    const res = await genRemoveAction({
      prompt: object,
      activeImageUrl: activeLayer.url!,
    });

    const newLayerId = crypto.randomUUID();

    if (res?.data?.result) {
      handleToastUpdate(toastId, `${object} removed successfully`, "success");

      dispatch(
        layerAdded({
          id: newLayerId,
          url: res?.data?.result,
          name: `${object}-removed-` + activeLayer.name,
          format: activeLayer.format,
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
            Generative Remove <Eraser size={20} />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="ml-4 w-full max-w-sm space-y-4"
        side="right"
        align="start"
      >
        <h3 className="font-medium leading-none">Generative Remove</h3>
        <p className="text-sm text-muted-foreground">
          Remove unwanted objects, text, or user-defined regions from images.
        </p>
        <p className="text-sm text-muted-foreground">
          Specify the objects you want to remove by using a short prompt like:
          fork, text, mountain, etc.
        </p>
        <div className="flex items-center gap-2">
          <Label htmlFor="object">Object:</Label>
          <Input
            id="object"
            value={object}
            onChange={(e) => setObject(e.target.value)}
            disabled={isGenerating}
            className="h-8"
            placeholder="Enter 1 object at a time"
          />
        </div>
        <Button
          disabled={!activeLayer.url || !object || isGenerating}
          onClick={removeObject}
          className="w-full"
        >
          {isGenerating ? "Removing..." : "Remove Object"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
