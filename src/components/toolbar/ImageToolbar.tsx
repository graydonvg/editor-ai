import BgRemove from "./BgRemove";
import BgReplace from "./BgReplace";
import GenFill from "./GenFill";
import GenRemove from "./GenRemove";

export default function ImageToolbar() {
  return (
    <>
      <GenFill />
      <GenRemove />
      <BgReplace />
      <BgRemove />
    </>
  );
}
