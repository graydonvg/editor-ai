import { transcribeVideoAction } from "@/actions/transcribe-video-action";
import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { handleToastUpdate } from "@/components/ui/Toast";
import {
  generationStarted,
  generationStopped,
} from "@/lib/redux/features/imageSlice";
import { activeLayerSet, layerAdded } from "@/lib/redux/features/layerSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { Captions } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Transcription() {
  const dispatch = useAppDispatch();
  const isGenerating = useAppSelector((state) => state.image.isGenerating);
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);
  const [isTranscribing, setIsTranscribing] = useState(false);

  async function transcribe() {
    setIsTranscribing(true);
    dispatch(generationStarted());
    const toastId = toast.loading("Processing...");

    const result = await transcribeVideoAction({
      publicId: activeLayer.publicId!,
    });

    if (result?.data?.result) {
      const newLayerId = crypto.randomUUID();

      handleToastUpdate(toastId, "Processing completed", "success");

      dispatch(
        layerAdded({
          id: newLayerId,
          url: result.data.result,
          name: "transcribed-" + activeLayer.name,
          format: activeLayer.format,
          height: activeLayer.height,
          width: activeLayer.width,
          publicId: activeLayer.publicId,
          resourceType: activeLayer.resourceType,
          posterUrl: activeLayer.posterUrl,
        }),
      );

      dispatch(activeLayerSet(newLayerId));
    }

    if (result?.data?.error) {
      handleToastUpdate(toastId, result.data.error, "error");
    }

    setIsTranscribing(false);
    dispatch(generationStopped());
  }

  return (
    <Popover>
      <PopoverTrigger asChild disabled={!activeLayer.publicId}>
        <Button variant="outline" className="p-8">
          <span className="flex flex-col items-center justify-center gap-1 text-xs font-medium">
            Video Transcription <Captions size={20} aria-hidden="true" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="ml-4 w-full max-w-sm space-y-6"
        side="right"
        align="start"
      >
        <h3 className="font-medium leading-none">Video Transcription</h3>
        <p className="text-pretty text-sm text-muted-foreground">
          Automatically generate subtitles from spoken audio. Convert speech
          into text and seamlessly integrate it as subtitles directly onto your
          video.
        </p>
        <Button
          disabled={isGenerating || isTranscribing || !activeLayer.publicId}
          onClick={transcribe}
          className="w-full"
        >
          {isTranscribing ? "Transcribing..." : "Transcribe"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
