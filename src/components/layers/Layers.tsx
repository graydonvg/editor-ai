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
import {
  activeLayerSet,
  comparedLayersCleared,
  comparedLayersUpdated,
  layerAdded,
  layerComparisonModeToggled,
  layersReordered,
} from "@/lib/redux/features/layerSlice";
import { useMemo } from "react";
import Image from "next/image";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import Layer from "./Layer";

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

  function handleCreateLayer() {
    const newLayer = generateLayer();

    dispatch(layerAdded(newLayer));

    dispatch(activeLayerSet(newLayer.id));
  }

  function handleCompareLayers(layerId: string) {
    if (!layerComparisonMode) {
      dispatch(comparedLayersUpdated([layerId]));
    } else {
      dispatch(layerComparisonModeToggled());
      dispatch(comparedLayersCleared());
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = layers.findIndex((layer) => layer.id === active.id);
      const newIndex = layers.findIndex((layer) => layer.id === over?.id);

      const updatedLayers = arrayMove(layers, oldIndex, newIndex);

      dispatch(layersReordered(updatedLayers));
    }
  }

  return (
    <Card className="relative flex shrink-0 basis-[360px] flex-col overflow-x-hidden shadow-2xl">
      <CardHeader className={cn("bg-card px-4 py-6 shadow-sm")}>
        {layerComparisonMode ? (
          <div>
            <CardTitle className="pb-2 text-sm">Comparing...</CardTitle>
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
        <div className="flex flex-col gap-1">
          <CardTitle className="text-sm">
            {activeLayer.name ?? "Layer"}
          </CardTitle>
          {activeLayer.width && activeLayer.height ? (
            <CardDescription>
              {activeLayer.width} x {activeLayer.height}
            </CardDescription>
          ) : null}
        </div>
      </CardHeader>
      <CardContent
        className="flex flex-1 flex-col overflow-y-scroll"
        style={{ scrollbarWidth: "thin" }}
      >
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={visibleLayers}
            strategy={verticalListSortingStrategy}
          >
            {visibleLayers.map((layer, index) => (
              <Layer key={layer.id} layer={layer} layerIndex={index} />
            ))}
          </SortableContext>
        </DndContext>
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
          onClick={() => handleCompareLayers(activeLayer.id)}
          variant="outline"
          disabled={
            !activeLayer.url ||
            activeLayer.resourceType === "video" ||
            isGenerating
          }
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
