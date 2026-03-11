import { useState } from "react";
import type { Bin } from "../../../types/request-bin";

export const BINS_STORAGE_PREFIX = "basket_";
const BINS_ORDER_KEY = "basket_order";
type BinRoute = Bin["bin_route"];

const getStoredOrder = (): BinRoute[] => {
  const stored = localStorage.getItem(BINS_ORDER_KEY);
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to parse bin order from storage.", error);
    return [];
  }
};

const buildFallbackOrder = (): BinRoute[] =>
  Object.keys(localStorage)
    .filter((key) => key.startsWith(BINS_STORAGE_PREFIX))
    .map((key) => key.replace(BINS_STORAGE_PREFIX, ""));

export const useBinOrder = () => {
  const [binOrder, setBinOrder] = useState<BinRoute[]>(() => {
    const stored = getStoredOrder();
    return stored.length > 0 ? stored : buildFallbackOrder();
  });

  const persistOrder = (order: BinRoute[]) => {
    localStorage.setItem(BINS_ORDER_KEY, JSON.stringify(order));
  };

  const orderedBins = binOrder.filter((id) =>
    localStorage.getItem(`${BINS_STORAGE_PREFIX}${id}`),
  );

  const addBin = (binId: BinRoute) => {
    setBinOrder((order) => {
      const next = [...order, binId];
      persistOrder(next);
      return next;
    });
  };

  const removeBin = (binId: BinRoute) => {
    setBinOrder((order) => {
      const next = order.filter((id) => id !== binId);
      persistOrder(next);
      return next;
    });
  };

  return { orderedBins, addBin, removeBin };
};
