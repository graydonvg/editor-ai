import { useAppSelector } from "@/lib/redux/hooks";
import { ModeToggle } from "../ui/ModeToggle";
import ImageToolbar from "./imageToolbar/ImageToolbar";
import VideoToolbar from "./videoToolbar/VideoToolbar";

export default function Toolbar() {
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);

  return (
    <div className="shrink-0 basis-[240px] px-4 py-6">
      <div className="pb-12 text-center">
        <ModeToggle />
      </div>
      <div className="flex flex-col gap-4">
        {activeLayer.resourceType === "image" ? <ImageToolbar /> : null}
        {activeLayer.resourceType === "video" ? <VideoToolbar /> : null}
      </div>
    </div>
  );
}
