import { useAppSelector } from "@/lib/redux/hooks";
import { useState } from "react";
import UploadImage from "./UploadImage";

export default function UploadForm() {
  const [selectedType, setSelectedType] = useState("image");
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);

  return (
    <>
      {!activeLayer.url ? (
        <div className="flex h-full w-full flex-col justify-center p-24">
          {selectedType === "image" ? <UploadImage /> : null}
        </div>
      ) : null}
    </>
  );
}
