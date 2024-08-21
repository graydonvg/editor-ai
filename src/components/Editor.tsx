import ActiveImage from "./ActiveImage";
import Layers from "./layers/Layers";
import { ModeToggle } from "./ui/ModeToggle";
import UploadImage from "./upload/UploadImage";

export default function Editor() {
  return (
    <div className="flex h-full">
      <div className="shrink-0 basis-[240px] px-4 py-6">
        <div className="pb-12 text-center">
          <ModeToggle />
        </div>
      </div>
      <UploadImage />
      <ActiveImage />
      <Layers />
    </div>
  );
}
