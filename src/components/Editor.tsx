"use client";

import ActiveContentDisplay from "./ActiveContentDisplay";
import Layers from "./layers/Layers";
import UploadForm from "./upload/UploadForm";
import Toolbar from "./toolbar/Toolbar";

export default function Editor() {
  return (
    <div className="flex h-full">
      <Toolbar />
      <UploadForm />
      <ActiveContentDisplay />
      <Layers />
    </div>
  );
}
