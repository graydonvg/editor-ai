import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";
import { Button } from "../ui/Button";
import { Image } from "lucide-react";
import { activeLayerSet, layerAdded } from "@/lib/redux/features/layerSlice";
import {
  generationStarted,
  generationStopped,
} from "@/lib/redux/features/imageSlice";
import { bgRemoveAction } from "@/actions/bg-remove-action";

export default function BgRemove() {
  const dispatch = useAppDispatch();
  const isGenerating = useAppSelector((state) => state.image.isGenerating);
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);

  async function handleRemove() {
    const newLayerId = crypto.randomUUID();

    dispatch(generationStarted());

    const res = await bgRemoveAction({
      activeImageUrl: activeLayer.url!,
      format: activeLayer.format!,
    });

    if (res?.data?.result) {
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
      console.error(res?.data?.error);
    }

    dispatch(generationStopped());
  }

  return (
    <Popover>
      <PopoverTrigger disabled={!activeLayer.url} asChild>
        <Button variant="outline" className="p-8">
          <span className="flex flex-col items-center justify-center gap-1 text-xs font-medium">
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            Background Removal <Image size={20} aria-hidden="true" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="ml-4 w-full max-w-[400px]">
        <div>
          <h3>Remove Background</h3>
          <p>Remove the background of an image with one simple click.</p>
        </div>
        <Button
          disabled={!activeLayer.url || isGenerating}
          onClick={handleRemove}
          className="mt-4 w-full"
        >
          {isGenerating ? "Removing..." : "Remove Background"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
