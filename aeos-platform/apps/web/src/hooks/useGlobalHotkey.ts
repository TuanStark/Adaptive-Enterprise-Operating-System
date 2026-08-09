import { useEffect } from "react";

export function useGlobalHotkey(
  key: string,
  callback: (e: KeyboardEvent) => void,
  options?: { metaKey?: boolean; ctrlKey?: boolean }
) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === key) {
        if (options?.metaKey && !e.metaKey) return;
        if (options?.ctrlKey && !e.ctrlKey) return;
        
        callback(e);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [key, callback, options?.metaKey, options?.ctrlKey]);
}
