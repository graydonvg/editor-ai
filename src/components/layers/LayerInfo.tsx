import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { LayerType } from "@/lib/types";
import { Dialog, DialogContent, DialogTrigger } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Ellipsis, Trash2 } from "lucide-react";
import { MouseEvent } from "react";
import { activeLayerSet, layerRemoved } from "@/lib/redux/features/layerSlice";

type Props = {
  layer: LayerType;
  layerIndex: number;
};

export default function LayerInfo({ layer, layerIndex }: Props) {
  const dispatch = useAppDispatch();
  const layers = useAppSelector((state) => state.layer.layers);

  function handleDeleteLayer(
    e: MouseEvent<HTMLButtonElement>,
    layerId: string,
  ) {
    e.stopPropagation();

    let activeLayerId = layerIndex === 0 ? layers[1].id : layers[0].id;

    dispatch(activeLayerSet(activeLayerId));
    dispatch(layerRemoved(layerId));
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Ellipsis size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <h3>Layer {layer.id}</h3>
        <div className="space-y-0.5 py-4">
          <p>
            <span className="font-bold">Filename:</span> {layer.name}
          </p>
          <p>
            <span className="font-bold">Format:</span> {layer.format}
          </p>
          <p>
            <span className="font-bold">Size:</span> {layer.width}x
            {layer.height}
          </p>
        </div>
        <Button
          onClick={(e) => handleDeleteLayer(e, layer.id!)}
          className="flex items-center gap-2"
        >
          <span>Delete Layer</span>
          <Trash2 size={14} />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
