import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { Button } from "@/components/ui/Button";
import { Info, Scissors, Trash2 } from "lucide-react";
import { activeLayerSet, layerAdded } from "@/lib/redux/features/layerSlice";
import {
  generationStarted,
  generationStopped,
} from "@/lib/redux/features/imageSlice";
import { toast } from "react-toastify";
import { handleToastUpdate } from "@/components/ui/Toast";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { areaExtractAction } from "@/actions/area-extract-action";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";

const DEFAULT_DETAILS = {
  multiple: false,
  mode: "content" as "content" | "mask",
  invert: false,
};

export default function AreaExtract() {
  const dispatch = useAppDispatch();
  const isGenerating = useAppSelector((state) => state.image.isGenerating);
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);
  const [prompts, setPrompts] = useState([
    { id: crypto.randomUUID(), data: "" },
  ]);
  const [details, setDetails] = useState(DEFAULT_DETAILS);
  const [isExtracting, setIsExtracting] = useState(false);

  async function extractObject() {
    setIsExtracting(true);
    dispatch(generationStarted());
    const toastId = toast.loading(`Processing...`);

    const promptData = prompts
      .map((prompt) => prompt.data)
      .filter((prompt) => prompt.trim() !== "");

    const result = await areaExtractAction({
      activeImageUrl: activeLayer.url!,
      prompts: promptData,
      multiple: details.multiple,
      mode: details.mode,
      invert: details.invert,
      format: activeLayer.format!,
    });

    if (result?.data?.result) {
      const newLayerId = crypto.randomUUID();

      handleToastUpdate(toastId, "Processing completed", "success");

      dispatch(
        layerAdded({
          id: newLayerId,
          url: result.data.result,
          name: "bg-replaced-" + activeLayer.name,
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

    setIsExtracting(false);
    dispatch(generationStopped());
  }

  function addPrompt() {
    setPrompts((prev) => [...prev, { id: crypto.randomUUID(), data: "" }]);
  }

  function removePrompt(id: string) {
    setPrompts((prev) => prev.filter((prompt) => prompt.id !== id));
  }

  function updatePrompt(index: number, value: string) {
    setPrompts((prev) => {
      const newPrompts = [...prev];
      newPrompts[index].data = value;
      return newPrompts;
    });
  }

  return (
    <Popover>
      <PopoverTrigger disabled={!activeLayer.url} asChild>
        <Button variant="outline" className="p-8">
          <span className="flex flex-col items-center justify-center gap-1 text-xs font-medium">
            Area Extract <Scissors size={20} />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="ml-4 w-full max-w-sm space-y-6"
        side="right"
        align="center"
      >
        <h3 className="font-medium leading-none">Area Extract</h3>
        <p className="text-sm text-muted-foreground">
          Extract specific areas of an image using natural language prompts.
        </p>
        <p className="text-sm text-muted-foreground">
          Choose to keep or remove the selected areas, with options for
          transparency and masking.
        </p>
        {prompts.map((prompt, index) => (
          <div key={`prompt-${index}`} className="grid gap-2">
            <Label htmlFor={`prompt-${index}`} className="text-nowrap">
              Prompt {index + 1}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id={`prompt-${index}`}
                value={prompt.data}
                onChange={(e) => updatePrompt(index, e.target.value)}
                disabled={isGenerating}
                className="h-8"
                placeholder="Describe what to extract"
              />
              {prompts.length > 1 && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8"
                  onClick={() => removePrompt(prompt.id)}
                >
                  <Trash2 size={20} />
                </Button>
              )}
            </div>
          </div>
        ))}
        <Button onClick={addPrompt} size="sm" className="w-full">
          Add Prompt
        </Button>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="multiple"
              checked={details.multiple}
              onCheckedChange={(checked) =>
                setDetails((prev) => ({
                  ...prev,
                  multiple: checked as boolean,
                }))
              }
            />
            <Label htmlFor="multiple">Detect multiple</Label>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={14} />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Whether to detect multiple instances of the prompt.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <RadioGroup
            value={details.mode}
            onValueChange={(value) =>
              setDetails((prev) => ({
                ...prev,
                mode: value as "content" | "mask",
              }))
            }
          >
            <h4>Mode:</h4>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="mode-content" value="content" />
                <Label htmlFor="mode-content">Content</Label>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info size={14} />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Keep the content of the extracted area only.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="mode-mask" value="mask" />
                <Label htmlFor="mode-mask">Mask</Label>
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info size={14} />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="max-w-xs text-pretty">
                        Generates a black-and-white mask of the entire image
                        where the selected areas are shown in white and the
                        non-selected areas in black.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </RadioGroup>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="invert"
              checked={details.invert}
              onCheckedChange={(checked) =>
                setDetails((prev) => ({
                  ...prev,
                  invert: checked as boolean,
                }))
              }
            />
            <Label htmlFor="invert">Invert</Label>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={14} />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="max-w-xs text-pretty">
                    If true, in content mode, keep all the content except the
                    extracted area; in mask mode, the selected areas are shown
                    in black and the non-selected areas in white.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <Button
          disabled={!activeLayer.url || isExtracting || isGenerating}
          onClick={extractObject}
          className="w-full"
        >
          {isExtracting ? "Extracting..." : "Extract"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
