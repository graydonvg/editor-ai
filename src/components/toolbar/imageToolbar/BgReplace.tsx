import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { Button } from "@/components/ui/Button";
import { Image } from "lucide-react";
import { activeLayerSet, layerAdded } from "@/lib/redux/features/layerSlice";
import {
  generationStarted,
  generationStopped,
} from "@/lib/redux/features/imageSlice";
import { toast } from "react-toastify";
import { handleToastUpdate } from "@/components/ui/Toast";
import { bgReplaceAction } from "@/actions/bg-replace-action";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

const BUTTON_DISABLED_KEYWORDS = ["mask", "background_removal"];

export default function BgReplace() {
  const dispatch = useAppDispatch();
  const isGenerating = useAppSelector((state) => state.image.isGenerating);
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);
  const [prompt, setPrompt] = useState("");
  const [isReplacing, setIsReplacing] = useState(false);

  async function replaceBackground() {
    setIsReplacing(true);
    dispatch(generationStarted());
    const toastId = toast.loading("Processing...");

    const result = await bgReplaceAction({
      activeImageUrl: activeLayer.url!,
      prompt: activeLayer.format!,
    });

    if (result?.data?.result) {
      const newLayerId = crypto.randomUUID();

      handleToastUpdate(toastId, "Processing completed", "success");

      dispatch(
        layerAdded({
          id: newLayerId,
          url: result.data.result,
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

    if (result?.data?.error) {
      handleToastUpdate(toastId, result.data.error, "error");
    }

    setIsReplacing(false);
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
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            Background Replace <Image size={20} aria-hidden="true" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="ml-4 w-full max-w-sm space-y-6"
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
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="background">Background:</Label>
            <Input
              id="background"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              className="h-8"
              placeholder="Describe the new background"
            />
          </div>
          <Button
            disabled={
              !activeLayer.url ||
              isGenerating ||
              isReplacing ||
              BUTTON_DISABLED_KEYWORDS.some((keyword) =>
                activeLayer.url?.includes(keyword),
              )
            }
            onClick={replaceBackground}
            className="w-full"
          >
            {isReplacing ? "Replacing..." : "Replace Background"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
