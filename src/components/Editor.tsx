import { useAppSelector } from "@/lib/redux/hooks";
import ActiveImage from "./ActiveImage";
import Layers from "./layers/Layers";
import ImageToolbar from "./toolbar/ImageToolbar";
import { ModeToggle } from "./ui/ModeToggle";
import UploadForm from "./upload/UploadForm";

export default function Editor() {
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);

  return (
    <div className="flex h-full">
      <div className="shrink-0 basis-[240px] px-4 py-6">
        <div className="pb-12 text-center">
          <ModeToggle />
        </div>
        <div className="flex flex-col gap-4">
          {activeLayer.resourceType === "image" ? <ImageToolbar /> : null}
        </div>
      </div>
      <UploadForm />
      <ActiveImage />
      <Layers />
    </div>
  );
}
