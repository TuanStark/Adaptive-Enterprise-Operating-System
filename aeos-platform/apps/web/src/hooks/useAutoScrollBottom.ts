import { useEffect } from "react";

export function useAutoScrollBottom(
  ref: React.RefObject<HTMLElement | null>,
  dependencies: any[]
) {
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  }, dependencies);
}
