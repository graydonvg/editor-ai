import {
  activeLayerSet,
  layerToCompareSelected,
} from "@/lib/redux/features/layerSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { LayerType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import LayerImage from "./LayerImage";
import LayerInfo from "./LayerInfo";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

type Props = {
  layer: LayerType;
  layerIndex: number;
};

export default function Layer({ layer, layerIndex }: Props) {
  const dispatch = useAppDispatch();
  const isGenerating = useAppSelector((state) => state.image.isGenerating);
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);
  const comparedLayers = useAppSelector((state) => state.layer.comparedLayers);
  const layerComparisonMode = useAppSelector(
    (state) => state.layer.layerComparisonMode,
  );
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: layer.id,
    });

  function handleSelectLayer(layerId: string) {
    if (isGenerating) return;

    if (layerComparisonMode) {
      dispatch(layerToCompareSelected({ id: layerId }));
    } else {
      dispatch(activeLayerSet(layerId));
    }
  }

  return (
    <div
      ref={setNodeRef}
      onClick={() => handleSelectLayer(layer.id)}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      className={cn(
        "cursor-pointer border border-transparent ease-in-out hover:bg-accent",
        {
          "animate-pulse": isGenerating,
          "border-primary": layerComparisonMode
            ? comparedLayers.includes(layer.id ?? "")
            : activeLayer.id === layer.id,
        },
      )}
    >
      <div className="relative flex items-center p-4">
        <button
          {...attributes}
          {...listeners}
          className="mr-2 cursor-grab"
          aria-label="Draggable handle"
        >
          <GripVertical size={18} />
        </button>
        <div className="flex h-8 w-full items-center justify-between">
          {!layer.url && (
            <p className="ml-2 justify-self-end text-xs font-medium">
              New Layer
            </p>
          )}
          <LayerImage layer={layer} />
          <LayerInfo layer={layer} layerIndex={layerIndex} />
        </div>
      </div>
    </div>
  );
}
