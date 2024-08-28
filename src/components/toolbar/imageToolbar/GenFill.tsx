import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Crop } from "lucide-react";
import { activeLayerSet, layerAdded } from "@/lib/redux/features/layerSlice";
import {
  generationStarted,
  generationStopped,
} from "@/lib/redux/features/imageSlice";
import { toast } from "react-toastify";
import { handleToastUpdate } from "@/components/ui/Toast";
import { useMemo, useState } from "react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { genFillAction } from "@/actions/gen-fill-action";

const DEFAULT_DIMENSIONS = { width: 0, height: 0 };
const PREVIEW_SIZE = 300;
const EXPANSION_THRESHOLD = 1;
const BUTTON_DISABLED_KEYWORDS = ["e_extract", "background_removal"];

export default function GenFill() {
  const dispatch = useAppDispatch();
  const isGenerating = useAppSelector((state) => state.image.isGenerating);
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newDimensions, setNewDimensions] = useState(DEFAULT_DIMENSIONS);

  function computePreviewStyle() {
    if (!activeLayer.width || !activeLayer.height || !activeLayer.url)
      return {};

    const newWidth = activeLayer.width + newDimensions.width;
    const newHeight = activeLayer.height + newDimensions.height;
    const scale = Math.min(PREVIEW_SIZE / newWidth, PREVIEW_SIZE / newHeight);

    return {
      width: `${newWidth * scale}px`,
      height: `${newHeight * scale}px`,
      backgroundImage: `url(${activeLayer.url})`,
      backgroundSize: `${activeLayer.width * scale}px ${activeLayer.height * scale}px`,
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      position: "relative" as const,
    };
  }

  function computePreviewOverlayStyle() {
    if (!activeLayer.width || !activeLayer.height || !activeLayer.url)
      return {};

    const scale = Math.min(
      PREVIEW_SIZE / (activeLayer.width + newDimensions.width),
      PREVIEW_SIZE / (activeLayer.height + newDimensions.height),
    );

    const leftWidth =
      newDimensions.width > 0 ? `${(newDimensions.width / 2) * scale}px` : "0";
    const rightWidth =
      newDimensions.width > 0 ? `${(newDimensions.width / 2) * scale}px` : "0";
    const topHeight =
      newDimensions.height > 0
        ? `${(newDimensions.height / 2) * scale}px`
        : "0";
    const bottomHeight =
      newDimensions.height > 0
        ? `${(newDimensions.height / 2) * scale}px`
        : "0";

    return {
      position: "absolute" as const,
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      boxShadow: `inset ${leftWidth} ${topHeight} 0 rgba(48, 119, 255, 1),
  		inset -${rightWidth} ${topHeight} 0 rgba(48, 119, 255, 1),
  		inset ${leftWidth} -${bottomHeight} 0 rgba(48, 119, 255, 1),
  		inset ${leftWidth} -${bottomHeight} 0 rgba(48, 119, 255, 1)`,
    };
  }

  function ExpansionIndicator({
    value,
    axis,
  }: {
    value: number;
    axis: "x" | "y";
  }) {
    const isVisible = Math.abs(value) >= EXPANSION_THRESHOLD;

    if (!isVisible) return;

    const position =
      axis === "x"
        ? {
            top: "50%",
            [value > 0 ? "right" : "left"]: 0,
            transform: "translateY(-50%)",
          }
        : {
            left: "50%",
            [value > 0 ? "top" : "bottom"]: 0,
            transform: "translateX(-50%)",
          };

    return (
      <div
        className="absolute rounded-md bg-primary px-2 py-1 text-xs font-bold text-primary-foreground"
        style={position}
      >
        {value > 0 ? "+" : "-"}
        {Math.abs(value)}px
      </div>
    );
  }

  async function generate() {
    setIsProcessing(true);
    dispatch(generationStarted());
    const toastId = toast.loading("Processing...");

    const result = await genFillAction({
      activeImageUrl: activeLayer.url!,
      aspectRatio: "1:1",
      width: newDimensions.width + activeLayer.width,
      height: newDimensions.height + activeLayer.height,
    });

    if (result?.data?.result) {
      const newLayerId = crypto.randomUUID();

      handleToastUpdate(toastId, "Processing completed", "success");

      dispatch(
        layerAdded({
          id: newLayerId,
          url: result.data.result,
          name: "gen-filled-" + activeLayer.name,
          format: activeLayer.format,
          height: activeLayer.height + newDimensions.height,
          width: activeLayer.width + newDimensions.width,
          publicId: activeLayer.publicId,
          resourceType: activeLayer.resourceType,
        }),
      );

      dispatch(activeLayerSet(newLayerId));
    }

    if (result?.data?.error) {
      handleToastUpdate(toastId, result.data.error, "error");
    }

    setIsProcessing(false);
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
            Generative Fill <Crop size={20} aria-hidden="true" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="ml-4 w-full max-w-sm space-y-6"
        side="right"
        align="start"
      >
        <h3 className="text-lg font-medium leading-none">Generative Fill</h3>
        <p className="text-sm text-muted-foreground">
          Use AI to seamlessly expand or crop your images, integrating new
          content that matches the original.
        </p>
        {activeLayer.width && activeLayer.height ? (
          <div className="flex items-center justify-evenly">
            <div className="flex flex-col items-center">
              <span className="text-xs">Current dimensions:</span>
              <p className="text-sm font-bold text-primary">
                {activeLayer.width} x {activeLayer.height}
              </p>
            </div>
            <ArrowRight size={28} />
            <div className="flex flex-col items-center">
              <span className="text-xs">New dimensions:</span>
              <p className="text-sm font-bold text-primary">
                {activeLayer.width + newDimensions.width} x{" "}
                {activeLayer.height + newDimensions.height}
              </p>
            </div>
          </div>
        ) : null}
        <div className="flex flex-col items-center justify-center gap-2">
          <Label htmlFor="adjust-width" className="text-nowrap">
            Adjust Width:
          </Label>
          <Input
            id="adjust-width"
            type="range"
            min={-activeLayer.width + 100}
            max={activeLayer.width}
            value={newDimensions.width}
            onChange={(e) =>
              setNewDimensions((prev) => ({
                ...prev,
                width: parseInt(e.target.value),
              }))
            }
            className="h-8"
          />
          <Label htmlFor="adjust-height" className="text-nowrap">
            Adjust Height:
          </Label>
          <Input
            id="adjust-height"
            type="range"
            min={-activeLayer.height + 100}
            max={activeLayer.height}
            value={newDimensions.height}
            onChange={(e) =>
              setNewDimensions((prev) => ({
                ...prev,
                height: parseInt(e.target.value),
              }))
            }
            className="h-8"
          />
        </div>
        <div
          style={{
            width: `${PREVIEW_SIZE}px`,
            height: `${PREVIEW_SIZE}px`,
          }}
          className="preview-container m-auto flex flex-grow items-center justify-center overflow-hidden"
        >
          <div style={computePreviewStyle()}>
            <div
              style={computePreviewOverlayStyle()}
              className="animate-pulse"
            ></div>
            <ExpansionIndicator value={newDimensions.width} axis="x" />
            <ExpansionIndicator value={newDimensions.height} axis="y" />
          </div>
        </div>
        <Button
          disabled={
            !activeLayer.url ||
            isGenerating ||
            isProcessing ||
            BUTTON_DISABLED_KEYWORDS.some((keyword) =>
              activeLayer.url?.includes(keyword),
            )
          }
          onClick={generate}
          className="w-full"
        >
          {isProcessing ? "Generating..." : "Generate"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
