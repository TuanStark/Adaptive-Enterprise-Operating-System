import { useEffect, Dispatch, SetStateAction, RefObject } from "react";

export function usePanelResize(
  isResizingRef: RefObject<boolean>,
  setWidth: Dispatch<SetStateAction<number>>,
  minWidth = 300
) {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const newWidth = document.body.clientWidth - e.clientX;
      if (newWidth >= minWidth && newWidth <= Math.min(800, document.body.clientWidth - minWidth)) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [setWidth, isResizingRef, minWidth]);
}
