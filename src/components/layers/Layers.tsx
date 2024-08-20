import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/Card";
import { useAppSelector } from "@/lib/redux/hooks";

export default function Layers() {
  const isGeneratingImage = useAppSelector((state) => state.image.isGenerating);
  const layers = useAppSelector((state) => state.layer.layers);
  const activeLayer = useAppSelector((state) => state.layer.activeLayer);

  return (
    <Card className="scrollbar-thin scrollbar-track-secondary scrollbar-thumb-primary scrollbar-thumb-rounded-full scrollbar-track-rounded-full relative flex shrink-0 basis-[320px] flex-col overflow-x-hidden overflow-y-scroll shadow-2xl">
      <CardHeader className="">
        <div>
          <CardTitle className="text-sm">
            {activeLayer.name ?? "Layers"}
          </CardTitle>
          {activeLayer.width && activeLayer.height ? (
            <CardDescription>
              {activeLayer.width}x{activeLayer.height}
            </CardDescription>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className={cn(
              "cursor-pointer border border-transparent ease-in-out hover:bg-secondary",
              { "animate-pulse": isGeneratingImage },
            )}
          >
            <div>
              <div>
                {!layer.url ? (
                  <p className="justify-self-end text-xs font-medium">
                    New Layer
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
