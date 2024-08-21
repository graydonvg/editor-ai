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

export default function GenRemove() {
  const dispatch = useAppDispatch();
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);
  const [activeTag, setActiveTag] = useState("");

  async function handleRemove() {
    const newLayerId = crypto.randomUUID();

    dispatch(generationStarted());

    const res = await genRemoveAction({
      prompt: activeTag,
      activeImageUrl: activeLayer.url!,
    });

    if (res?.data?.result) {
      console.log(res?.data?.result);

      dispatch(
        layerAdded({
          id: newLayerId,
          url: res?.data?.result,
          name: activeLayer.name,
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
      console.log(res?.data?.error);
    }

    dispatch(generationStopped());
  }

  return (
    <Popover>
      <PopoverTrigger disabled={!activeLayer.url} asChild>
        <Button variant="outline" className="p-8">
          <span className="flex flex-col items-center justify-center gap-1 text-xs font-medium">
            Content Aware <Eraser size={20} />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="ml-4 w-full max-w-[400px]">
        <div>
          <h3>Remove Object</h3>
          <p>
            Specify the object you want to remove by using a short prompt like:
            tree, couch, etc.
          </p>
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="selection">Selection</Label>
          <Input
            name="selection"
            value={activeTag}
            onChange={(e) => setActiveTag(e.target.value)}
            className="col-span-2 h-8"
            placeholder="Enter 1 object at a time..."
          />
        </div>
        <Button onClick={handleRemove} className="mt-4 w-full">
          Magic Remove
        </Button>
      </PopoverContent>
    </Popover>
  );
}
