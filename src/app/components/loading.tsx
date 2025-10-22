import { LoaderCircle } from "lucide-react";

export default function Loading({
  isFullScreen = false,
}: {
  isFullScreen?: boolean;
}) {
  return isFullScreen ? (
    <div className="fixed inset-0 z-50 w-full h-full bg-black flex justify-center items-center">
      <LoaderCircle className="h-9 w-9 animate-spin" />
    </div>
  ) : (
    <div className="flex inset-0 justify-center items-center w-full h-full">
      <LoaderCircle className="h-9 w-9 animate-spin" />
    </div>
  );
}
