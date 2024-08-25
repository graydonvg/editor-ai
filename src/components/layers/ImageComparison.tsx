import { useAppSelector } from "@/lib/redux/hooks";
import { LayerType } from "@/lib/types";
import Image from "next/image";
import {
  ReactCompareSliderImage,
  ReactCompareSlider,
} from "react-compare-slider";

export default function ImageComparison() {
  const layers = useAppSelector((state) => state.layer.layers);
  const comparedLayers = useAppSelector((state) => state.layer.comparedLayers);
  const comparisonLayers = comparedLayers
    .map((id) => layers.find((layer) => layer.id === id))
    .filter(Boolean) as LayerType[];

  if (comparisonLayers.length === 0) {
    return <p>No layers selected for comparison</p>;
  }

  if (comparisonLayers.length === 1) {
    return (
      <div className="overflow-hidden">
        <ReactCompareSliderImage
          src={comparisonLayers[0].url!}
          srcSet={comparisonLayers[0].url}
          alt={comparisonLayers[0].name || "Single image"}
          className="object-contain"
        />
      </div>
    );
  }

  const bgRemovalKeywords = ["background_removal", "e_extract"];

  function hasBgRemoved(url?: string) {
    return bgRemovalKeywords.some((keyword) => url?.includes(keyword));
  }

  let layersToCompare = comparisonLayers;

  if (comparisonLayers.some((layer) => hasBgRemoved(layer.url))) {
    layersToCompare = [...comparisonLayers].sort((a, b) => {
      return hasBgRemoved(a.url) ? -1 : hasBgRemoved(b.url) ? 1 : 0;
    });
  }

  return (
    <ReactCompareSlider
      itemOne={
        <ReactCompareSliderImage
          key={layersToCompare[0].url}
          src={layersToCompare[0].url}
          srcSet={layersToCompare[0].url}
          alt={layersToCompare[0].name || "Image one"}
          className="object-contain"
        />
      }
      itemTwo={
        <ReactCompareSliderImage
          key={layersToCompare[1].url}
          src={layersToCompare[1].url}
          srcSet={layersToCompare[1].url}
          alt={layersToCompare[1].name || "Image two"}
          className="object-contain"
        />
      }
    />
  );
}
