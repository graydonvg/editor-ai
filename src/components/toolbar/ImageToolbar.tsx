import BgRemove from "./BgRemove";
import GenRemove from "./GenRemove";

type Props = {};

export default function ImageToolbar() {
  return (
    <>
      <GenRemove />
      <BgRemove />
    </>
  );
}
