import { useState, useEffect, useRef } from "react";
import { sleep } from "../utils";

export default function useLoopAsync<T>(
  callback: () => Promise<T>,
  delay: null | number,
  initState: T
) {
  const savedCallback = useRef<() => Promise<T>>();
  const [result, setResult] = useState<T>(initState);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the Loop async.
  useEffect(() => {
    const tick = async () => {
      const current = savedCallback.current;
      if (current) {
        try {
          setResult(await current());
        } catch (err) {
          console.error("useLoopAsync error>>>", err);
        }
      } else {
        console.warn(">>> useLoopAsync Callback function does not exist");
      }
    };

    let closure = true;

    const start = async () => {
      while (closure) {
        await tick();
        await sleep(delay as number);
      }
    };

    const cleanup = () => {
      closure = false;
    };

    if (delay !== null) {
      start();
    } else {
      cleanup();
    }

    return cleanup;
  }, [delay]);

  return result;
}
