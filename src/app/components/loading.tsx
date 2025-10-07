import { LoaderCircle } from "lucide-react";

export default function Loading({
  isFullScreen = false,
}: {
  isFullScreen?: boolean;
}) {
  return isFullScreen ? (
    <div className="fixed z-50 w-full h-full flex justify-center items-center">
      <LoaderCircle className="h-9 w-9 animate-spin" />
    </div>
  ) : (
    <div className="flex justify-center items-center w-full h-full">
      <LoaderCircle className="h-9 w-9 animate-spin" />
    </div>
  );
}
