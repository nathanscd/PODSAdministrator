import { useCallback, useEffect, useRef, useState } from "react";
import { DatatemApiError, datatemApi, friendlyMessage } from "../services/DatatemService";
import type { BootstrapResponse } from "../types/simcard";

interface InventoryState {
  data: BootstrapResponse | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const RETRY_DELAYS = [600, 1200, 2400];

function wait(milliseconds: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Abortada", "AbortError"));
      return;
    }
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, milliseconds);
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException("Abortada", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

export function useSimcardInventory(enabled: boolean) {
  const [state, setState] = useState<InventoryState>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });
  const abortRef = useRef<AbortController | null>(null);
  const generationRef = useRef(0);
  const inFlightRef = useRef(false);

  const load = useCallback(
    async (forceRefresh: boolean) => {
      if (!enabled || inFlightRef.current) return;
      inFlightRef.current = true;
      const generation = ++generationRef.current;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setState((previous) => ({ ...previous, loading: true, error: null }));

      try {
        let lastError: unknown = null;
        for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt += 1) {
          try {
            const data = await datatemApi.bootstrap(controller.signal, forceRefresh);
            if (generation !== generationRef.current) return;
            setState({ data, loading: false, error: null, lastUpdated: new Date() });
            return;
          } catch (error) {
            if (controller.signal.aborted || generation !== generationRef.current) return;
            lastError = error;
            const isRetryable =
              error instanceof DatatemApiError &&
              (error.status >= 500 || error.code === "network_unavailable");
            if (!isRetryable || attempt === RETRY_DELAYS.length) break;
            await wait(RETRY_DELAYS[attempt], controller.signal);
          }
        }
        if (generation !== generationRef.current) return;
        setState((previous) => ({
          ...previous,
          loading: false,
          error: friendlyMessage(lastError),
        }));
      } catch (error) {
        if (controller.signal.aborted || generation !== generationRef.current) return;
        setState((previous) => ({ ...previous, loading: false, error: friendlyMessage(error) }));
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          inFlightRef.current = false;
        }
      }
    },
    [enabled],
  );

  useEffect(() => {
    if (!enabled) {
      generationRef.current += 1;
      abortRef.current?.abort();
      abortRef.current = null;
      inFlightRef.current = false;
      setState((previous) => ({ ...previous, loading: false }));
      return;
    }
    void load(false);
    return () => {
      generationRef.current += 1;
      abortRef.current?.abort();
      abortRef.current = null;
      inFlightRef.current = false;
    };
  }, [enabled, load]);

  const refresh = useCallback(() => void load(true), [load]);
  const retry = useCallback(() => void load(false), [load]);
  const reload = useCallback(() => void load(false), [load]);

  return { ...state, refresh, retry, reload };
}
