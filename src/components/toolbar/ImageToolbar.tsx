import BgRemove from "./BgRemove";
import BgReplace from "./BgReplace";
import GenFill from "./GenFill";
import GenRemove from "./GenRemove";
import AreaExtract from "./AreaExtract";

export default function ImageToolbar() {
  return (
    <>
      <GenFill />
      <GenRemove />
      <BgReplace />
      <BgRemove />
      <AreaExtract />
    </>
  );
}
