import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { toast } from "react-toastify";
import {
  generationStarted,
  generationStopped,
} from "@/lib/redux/features/imageSlice";
import { downloadAssetAction } from "@/actions/download-asset-action";
import { handleToastUpdate } from "../ui/Toast";

export default function Export() {
  const dispatch = useAppDispatch();
  const isGenerating = useAppSelector((state) => state.image.isGenerating);
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);
  const [quality, setQuality] = useState("original");
  const [format, setFormat] = useState(activeLayer.format!);
  const [isExporting, setIsExporting] = useState(false);

  async function download() {
    if (
      !activeLayer.publicId ||
      !activeLayer.resourceType ||
      !activeLayer.url
    ) {
      return toast.error("An error occured");
    }

    setIsExporting(true);
    dispatch(generationStarted());
    const toastId = toast.loading("Processing...");

    const downloadAssetResponse = await downloadAssetAction({
      assetUrl: activeLayer.url!,
      format: format,
      publicId: activeLayer.publicId,
      quality,
      resourceType: activeLayer.resourceType!,
    });

    if (downloadAssetResponse?.data?.result) {
      try {
        const assetResponse = await fetch(
          downloadAssetResponse.data.result.url,
        );

        if (!assetResponse.ok) {
          throw new Error(`Failed to fetch ${activeLayer.resourceType}`);
        }

        const blob = await assetResponse.blob();
        const downloadUrl = URL.createObjectURL(blob);

        handleToastUpdate(
          toastId,
          "Processing completed. Your download should begin soon!",
          "success",
        );

        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = downloadAssetResponse.data.result.filename;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        if (error instanceof Error) {
          handleToastUpdate(toastId, error.message, "error");
        }

        handleToastUpdate(
          toastId,
          "An unexpected error occurred. Please try again later.",
          "error",
        );
      }
    }

    if (downloadAssetResponse?.data?.error) {
      handleToastUpdate(toastId, downloadAssetResponse.data.error, "error");
    }

    setIsExporting(false);
    dispatch(generationStopped());
  }

  return (
    <Dialog>
      <DialogTrigger
        disabled={
          !activeLayer.publicId ||
          !activeLayer.resourceType ||
          !activeLayer.url ||
          !activeLayer.format
        }
        asChild
      >
        <Button variant="outline" className="py-8">
          <span className="flex flex-col items-center justify-center gap-1 text-xs font-medium">
            Export
            <Download size={18} />
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="sr-only">
          <DialogTitle>Export Options</DialogTitle>
        </div>
        <h3
          className="text-center text-2xl font-medium leading-none tracking-tight"
          aria-hidden="true"
        >
          Export
        </h3>
        <DialogDescription className="text-center text-base">
          {`Choose export quality  ${activeLayer.resourceType === "image" ? "and format" : ""}  for the selected ${activeLayer.resourceType}.`}
        </DialogDescription>
        <div className="space-y-4">
          <Button
            onClick={() => setQuality("original")}
            variant="outline"
            className={cn("flex h-fit w-full flex-col items-start p-4", {
              "border-primary": quality === "original",
            })}
          >
            <span className="text-base">Original</span>
            <span className="text-sm text-muted-foreground">
              {activeLayer.width} x {activeLayer.height}
            </span>
          </Button>
          <Button
            onClick={() => setQuality("large")}
            variant="outline"
            className={cn("flex h-fit w-full flex-col items-start p-4", {
              "border-primary": quality === "large",
            })}
          >
            <span className="text-base">Large</span>
            <span className="text-sm text-muted-foreground">
              {(activeLayer.width! * 0.8).toFixed(0)} x{" "}
              {(activeLayer.height! * 0.8).toFixed(0)}
            </span>
          </Button>
          <Button
            onClick={() => setQuality("medium")}
            variant="outline"
            className={cn("flex h-fit w-full flex-col items-start p-4", {
              "border-primary": quality === "medium",
            })}
          >
            <span className="text-base">Medium</span>
            <span className="text-sm text-muted-foreground">
              {(activeLayer.width! * 0.5).toFixed(0)} x{" "}
              {(activeLayer.height! * 0.5).toFixed(0)}
            </span>
          </Button>
          <Button
            onClick={() => setQuality("small")}
            variant="outline"
            className={cn("flex h-fit w-full flex-col items-start p-4", {
              "border-primary": quality === "small",
            })}
          >
            <span className="text-base">Small</span>
            <span className="text-sm text-muted-foreground">
              {(activeLayer.width! * 0.3).toFixed(0)} x{" "}
              {(activeLayer.height! * 0.3).toFixed(0)}
            </span>
          </Button>
          {activeLayer.resourceType === "image" ? (
            <Select onValueChange={setFormat}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jpg">.jpg</SelectItem>
                <SelectItem value="jpeg">.jpeg</SelectItem>
                <SelectItem value="png">.png</SelectItem>
                <SelectItem value="webp">.webp</SelectItem>
              </SelectContent>
            </Select>
          ) : null}
        </div>
        <Button
          onClick={download}
          disabled={
            isGenerating ||
            isExporting ||
            !activeLayer.publicId ||
            !activeLayer.resourceType ||
            !activeLayer.url ||
            !activeLayer.format
          }
          className="mt-2"
        >
          {isExporting ? "Downloading" : "Download"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
