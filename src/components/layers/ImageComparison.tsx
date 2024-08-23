import { LayerType } from "@/lib/types";
import Image from "next/image";
import {
  ReactCompareSliderImage,
  ReactCompareSlider,
} from "react-compare-slider";

type Props = {
  layers: LayerType[];
};
// background_removal

export default function ImageComparison({ layers }: Props) {
  if (layers.length === 0) {
    return <p>No layers selected for comparison</p>;
  }

  if (layers.length === 1) {
    return (
      <div className="overflow-hidden">
        <ReactCompareSliderImage
          src={layers[0].url!}
          srcSet={layers[0].url}
          alt={layers[0].name || "Single image"}
          className="object-contain"
        />
      </div>
    );
  }

  let sortedLayers = layers;

  if (layers.length === 2) {
    sortedLayers = layers.sort((a, b) => {
      const aHasBgRemoved = a.url?.includes("background_removal") ? -1 : 1;
      const bHasBgRemoved = b.url?.includes("background_removal") ? -1 : 1;
      return aHasBgRemoved - bHasBgRemoved;
    });
  }

  return (
    <ReactCompareSlider
      itemOne={
        <ReactCompareSliderImage
          key={sortedLayers[0].url}
          src={sortedLayers[0].url}
          srcSet={sortedLayers[0].url}
          alt={sortedLayers[0].name || "Image one"}
          className="object-contain"
        />
      }
      itemTwo={
        <ReactCompareSliderImage
          key={sortedLayers[1].url}
          src={sortedLayers[1].url}
          srcSet={sortedLayers[1].url}
          alt={sortedLayers[1].name || "Image two"}
          className="object-contain"
        />
      }
    />
  );
}
