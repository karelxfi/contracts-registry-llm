import { useState, useEffect, useCallback } from "react";

const FAVORITES_KEY = "addybook_favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  const toggleFavorite = useCallback((protocolId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(protocolId)
        ? prev.filter((id) => id !== protocolId)
        : [...prev, protocolId];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isFavorite = useCallback(
    (protocolId: string) => favorites.includes(protocolId),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}
