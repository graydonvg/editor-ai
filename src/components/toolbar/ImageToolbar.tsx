import BgRemove from "./BgRemove";
import BgReplace from "./BgReplace";
import GenRemove from "./GenRemove";

export default function ImageToolbar() {
  return (
    <>
      <GenRemove />
      <BgRemove />
      <BgReplace />
    </>
  );
}
