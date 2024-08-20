import { LayerType } from "@/lib/types";
import Image from "next/image";

type Props = {
  layer: LayerType;
};

export default function Layer({ layer }: Props) {
  if (layer.url && layer.name) {
    return (
      <div className="flex h-12 w-12 items-center justify-center">
        <Image
          src={
            layer.format === "mp4" ? layer.posterUrl || layer.url : layer.url
          }
          alt={layer.name}
          className="h-full w-full rounded-sm object-contain"
          width={50}
          height={50}
        />
        <div>
          <p className="text-xs">{`${layer.name.slice(0, 15)}.${layer.format}`}</p>
        </div>
      </div>
    );
  }
}
