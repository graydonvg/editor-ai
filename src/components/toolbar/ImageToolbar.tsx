import BgRemove from "./BgRemove";
import BgReplace from "./BgReplace";
import ObjectRemove from "./ObjectRemove";

export default function ImageToolbar() {
  return (
    <>
      <ObjectRemove />
      <BgRemove />
      <BgReplace />
    </>
  );
}
