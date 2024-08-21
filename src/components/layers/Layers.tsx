import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { Button } from "../ui/Button";
import { Layers2 } from "lucide-react";
import LayerImage from "./LayerImage";
import LayerInfo from "./LayerInfo";
import { MouseEvent } from "react";
import { activeLayerSet, layerAdded } from "@/lib/redux/features/layerSlice";

export default function Layers() {
  const dispatch = useAppDispatch();
  const isGeneratingImage = useAppSelector((state) => state.image.isGenerating);
  const layers = useAppSelector((state) => state.layer.layers);
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);

  function handleSelectLayer(layerId: string) {
    if (isGeneratingImage) return;

    dispatch(activeLayerSet(layerId));
  }

  function handleCreateLayer() {
    dispatch(
      layerAdded({
        id: crypto.randomUUID(),
        url: "",
        height: 0,
        width: 0,
        publicId: "",
      }),
    );
  }

  return (
    <Card className="scrollbar-thin scrollbar-track-secondary scrollbar-thumb-primary scrollbar-thumb-rounded-full scrollbar-track-rounded-full relative flex shrink-0 basis-[320px] flex-col overflow-x-hidden overflow-y-scroll shadow-2xl">
      <CardHeader className="">
        <div>
          <CardTitle className="text-sm">
            {activeLayer.name ?? "Layers"}
          </CardTitle>
          {activeLayer.width && activeLayer.height ? (
            <CardDescription>
              {activeLayer.width}x{activeLayer.height}
            </CardDescription>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {layers.map((layer, index) => (
          <div
            key={layer.id}
            onClick={() => handleSelectLayer(layer.id!)}
            className={cn(
              "cursor-pointer border border-transparent ease-in-out hover:bg-secondary",
              {
                "animate-pulse": isGeneratingImage,
                "border-primary": layer.id === activeLayer.id,
              },
            )}
          >
            <div className="relative flex items-center p-4">
              <div className="flex h-8 w-full items-center justify-between gap-2">
                {!layer.url && (
                  <p className="justify-self-end text-xs font-medium">
                    New Layer
                  </p>
                )}
                <LayerImage layer={layer} />
                <LayerInfo layer={layer} layerIndex={index} />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
      <div className="sticky bottom-0 flex shrink-0 gap-2 bg-card">
        <Button
          onClick={handleCreateLayer}
          variant="outline"
          className="flex w-full gap-2"
        >
          <span>Create Layer</span>
          <Layers2 size={18} className="text-secondary-foreground" />
        </Button>
      </div>
    </Card>
  );
}
