import Layers from "./layers/Layers";
import UploadImage from "./upload/UploadImage";

export default function Editor() {
  return (
    <div>
      <h2>Editor</h2>
      <UploadImage />
      <Layers />
    </div>
  );
}
