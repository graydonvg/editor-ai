import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";
import { Button } from "../ui/Button";
import { Info, Scissors, Trash2 } from "lucide-react";
import { activeLayerSet, layerAdded } from "@/lib/redux/features/layerSlice";
import {
  generationStarted,
  generationStopped,
} from "@/lib/redux/features/imageSlice";
import { toast } from "react-toastify";
import { handleToastUpdate } from "../ui/Toast";
import { Label } from "../ui/Label";
import { Input } from "../ui/Input";
import { useState } from "react";
import { Checkbox } from "../ui/Checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/RadioGroup";
import { areaExtractAction } from "@/actions/area-extract-action";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/Tooltip";

export default function AreaExtract() {
  const dispatch = useAppDispatch();
  const isGenerating = useAppSelector((state) => state.image.isGenerating);
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);
  const [prompts, setPrompts] = useState([
    { id: crypto.randomUUID(), data: "" },
  ]);
  const [details, setDetails] = useState({
    multiple: false,
    mode: "default" as "default" | "mask",
    invert: false,
  });

  async function extractObject() {
    dispatch(generationStarted());
    const toastId = toast.loading(`Extracting...`);

    const promptData = prompts
      .map((prompt) => prompt.data)
      .filter((prompt) => prompt.trim() !== "");

    const res = await areaExtractAction({
      activeImageUrl: activeLayer.url!,
      prompts: promptData,
      multiple: details.multiple,
      mode: details.mode,
      invert: details.invert,
      format: activeLayer.format!,
    });

    const newLayerId = crypto.randomUUID();

    if (res?.data?.result) {
      handleToastUpdate(toastId, "Extraction successful", "success");

      dispatch(
        layerAdded({
          id: newLayerId,
          url: res?.data?.result,
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

    if (res?.data?.error) {
      handleToastUpdate(toastId, res.data.error, "error");
    }

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
        className="ml-4 w-full max-w-sm space-y-4"
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
          <div key={`prompt-${index}`} className="flex items-center gap-2">
            <Label htmlFor={`prompt-${index}`} className="text-nowrap">
              Prompt {index + 1}:
            </Label>
            <Input
              id={`prompt-${index}`}
              value={prompt.data}
              onChange={(e) => updatePrompt(index, e.target.value)}
              disabled={isGenerating}
              className="h-8"
              placeholder="Describe what to extract"
            />
            {prompts.length > 1 ? (
              <Button
                size="icon"
                variant="ghost"
                className="h-8"
                onClick={() => removePrompt(prompt.id)}
              >
                <Trash2 size={20} />
              </Button>
            ) : null}
          </div>
        ))}
        <Button onClick={addPrompt} size="sm" className="w-full">
          Add Prompt
        </Button>
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
          <Label htmlFor="multiple">Detect multiple instances</Label>
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
              mode: value as "default" | "mask",
            }))
          }
        >
          <h4>Mode:</h4>
          <div className="flex items-center space-x-2">
            <RadioGroupItem id="mode-default" value="default" />
            <Label htmlFor="mode-default">Default</Label>
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
                  <p>Replace the content of the extracted area with a mask.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
                  If true, in default mode, keep all the content except the
                  extracted area, in mask mode, make the mask cover everything
                  except the extracted area.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button
          disabled={!activeLayer.url || isGenerating}
          onClick={extractObject}
          className="w-full"
        >
          {isGenerating ? "Extracting..." : "Extract"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
