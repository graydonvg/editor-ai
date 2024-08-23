import { cn, generateLayer } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { Button } from "../ui/Button";
import { ArrowRight, Images, Layers2 } from "lucide-react";
import LayerImage from "./LayerImage";
import LayerInfo from "./LayerInfo";
import {
  activeLayerSet,
  comparedLayersToggled,
  comparedLayersUpdated,
  layerAdded,
  layerComparisonModeToggled,
} from "@/lib/redux/features/layerSlice";
import { useMemo } from "react";
import Image from "next/image";

export default function Layers() {
  const dispatch = useAppDispatch();
  const isGenerating = useAppSelector((state) => state.image.isGenerating);
  const layers = useAppSelector((state) => state.layer.layers);
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);
  const layerComparisonMode = useAppSelector(
    (state) => state.layer.layerComparisonMode,
  );
  const comparedLayers = useAppSelector((state) => state.layer.comparedLayers);

  const getLayerUrl = useMemo(
    () => (id: string) => {
      const layer = layers.find((layer) => layer.id === id);
      return layer ? layer.url : null;
    },
    [layers],
  );

  const visibleLayers = useMemo(
    () =>
      layerComparisonMode
        ? layers.filter((layer) => layer.url && layer.resourceType === "image")
        : layers,

    [layers, layerComparisonMode],
  );

  function handleSelectLayer(layerId: string) {
    if (isGenerating) return;

    if (layerComparisonMode) {
      dispatch(comparedLayersToggled({ id: layerId }));
    } else {
      dispatch(activeLayerSet(layerId));
    }
  }

  function handleCreateLayer() {
    const newLayer = generateLayer();

    dispatch(layerAdded(newLayer));

    dispatch(activeLayerSet(newLayer.id));
  }

  function handleCompareLayers(layerId: string) {
    if (layerComparisonMode) {
      dispatch(layerComparisonModeToggled());
    } else {
      dispatch(comparedLayersUpdated([layerId]));
    }
  }

  return (
    <Card className="scrollbar-thin scrollbar-track-secondary scrollbar-thumb-primary scrollbar-thumb-rounded-full scrollbar-track-rounded-full relative flex shrink-0 basis-[360px] flex-col overflow-x-hidden overflow-y-scroll shadow-2xl">
      <CardHeader className="sticky top-0 z-50 min-h-28 bg-card px-4 py-6 shadow-sm">
        {layerComparisonMode ? (
          <div>
            <CardTitle className="text-sm">Comparing...</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Image
                src={getLayerUrl(comparedLayers[0] as string) ?? ""}
                alt="compare"
                width={32}
                height={32}
              />
              {comparedLayers.length > 0 && <ArrowRight />}
              {comparedLayers.length > 1 ? (
                <Image
                  src={getLayerUrl(comparedLayers[1] as string) ?? ""}
                  alt="compare"
                  width={32}
                  height={32}
                />
              ) : (
                "Select layer to compare"
              )}
            </CardDescription>
          </div>
        ) : null}

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
        {visibleLayers.map((layer, index) => (
          <div
            key={layer.id}
            onClick={() => handleSelectLayer(layer.id!)}
            className={cn(
              "cursor-pointer border border-transparent ease-in-out hover:bg-secondary",
              {
                "animate-pulse": isGenerating,
                "border-primary": layerComparisonMode
                  ? comparedLayers.includes(layer.id ?? "")
                  : activeLayer.id === layer.id,
              },
            )}
          >
            <div className="relative flex items-center p-4">
              <div className="flex h-8 w-full items-center justify-between">
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
      <div className="sticky bottom-0 flex shrink-0 gap-2 bg-card p-4">
        <Button
          onClick={handleCreateLayer}
          variant="outline"
          className="flex w-full gap-2"
        >
          <span>Create Layer</span>
          <Layers2 size={18} className="text-secondary-foreground" />
        </Button>
        <Button
          onClick={() => handleCompareLayers(activeLayer.id!)}
          variant="outline"
          disabled={!activeLayer.url || activeLayer.resourceType === "video"}
          className="flex w-full gap-2"
        >
          <span>
            {layerComparisonMode ? "Stop Comparing" : "Compare Layers"}
          </span>
          {!layerComparisonMode && (
            <Images size={14} className="text-secondary-foreground" />
          )}
        </Button>
      </div>
    </Card>
  );
}
