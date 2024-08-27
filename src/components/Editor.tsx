"use client";

import ActiveImage from "./ActiveImage";
import Layers from "./layers/Layers";
import UploadForm from "./upload/UploadForm";
import Toolbar from "./toolbar/Toolbar";

export default function Editor() {
  return (
    <div className="flex h-full">
      <Toolbar />
      <UploadForm />
      <ActiveImage />
      <Layers />
    </div>
  );
}
