import { LayerType } from "@/lib/types";
import Image from "next/image";

type Props = {
  layer: LayerType;
};

export default function LayerImage({ layer }: Props) {
  return (
    <>
      {layer.url && layer.name ? (
        <>
          <div className="flex h-12 w-12 items-center justify-center">
            <Image
              src={
                layer.format === "mp4"
                  ? layer.thumbnailUrl || layer.url
                  : layer.url
              }
              alt={layer.name}
              className="h-full w-full object-contain"
              width={50}
              height={50}
            />
          </div>
          <div>
            <p className="text-xs">{`${layer.name.slice(0, 15)}.${layer.format}`}</p>
          </div>
        </>
      ) : null}
    </>
  );
}
