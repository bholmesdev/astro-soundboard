import { useEffect, useRef, useCallback } from "react";

// thank you @theMapleLeaf for this hook 🍁
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  period: number
) {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // if you want to run the callback even after an unmount, remove this and the check
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return useCallback((...args: Args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!mountedRef.current) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, period);
  }, []);
}
