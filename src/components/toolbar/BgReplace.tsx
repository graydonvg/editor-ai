import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";
import { Button } from "../ui/Button";
import { Image } from "lucide-react";
import { activeLayerSet, layerAdded } from "@/lib/redux/features/layerSlice";
import {
  generationStarted,
  generationStopped,
} from "@/lib/redux/features/imageSlice";
import { toast } from "react-toastify";
import { handleToastUpdate } from "../ui/Toast";
import { bgReplaceAction } from "@/actions/bg-replace-action";
import { Label } from "../ui/Label";
import { Input } from "../ui/Input";
import { useState } from "react";

export default function BgReplace() {
  const dispatch = useAppDispatch();
  const isGenerating = useAppSelector((state) => state.image.isGenerating);
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);
  const [prompt, setPrompt] = useState("");

  async function handleRemove() {
    dispatch(generationStarted());
    const toastId = toast.loading("Replacing background...");

    const res = await bgReplaceAction({
      activeImageUrl: activeLayer.url!,
      prompt: activeLayer.format!,
    });

    const newLayerId = crypto.randomUUID();

    if (res?.data?.result) {
      handleToastUpdate(toastId, "Background replaced successfully", "success");

      dispatch(
        layerAdded({
          id: newLayerId,
          url: res?.data?.result,
          name: "bg-replaced-" + activeLayer.name,
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
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            Background Replace <Image size={20} aria-hidden="true" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="ml-4 w-full max-w-sm space-y-4"
        side="right"
        align="start"
      >
        <h3 className="font-medium leading-none">
          Generative Background Replace
        </h3>
        <p className="text-sm text-muted-foreground">
          Replace the background of an image with AI-generated content.
        </p>
        <p className="text-sm text-muted-foreground">
          Provide your own description, or let the AI create a random background
          for you.
        </p>
        <div className="flex items-center gap-2">
          <Label htmlFor="prompt">Prompt:</Label>
          <Input
            name="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            className="col-span-2 h-8"
            placeholder="Describe the new background..."
          />
        </div>
        <Button
          disabled={!activeLayer.url || isGenerating}
          onClick={handleRemove}
          className="w-full"
        >
          {isGenerating ? "Replacing..." : "Replace Background"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
