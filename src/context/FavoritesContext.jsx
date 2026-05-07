import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getSprite } from '../api/pokeApi';

const FavoritesContext = createContext(null);
const STORAGE_KEY = 'poke_app_favs_v2'; // Nueva clave para limpiar datos corruptos anteriores

export const FavoritesProvider = ({ children }) => {
  // 1. Inicialización ultra-segura
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  });

  // 2. Persistencia con manejo de errores para evitar crashes de la app
  useEffect(() => {
    try {
      if (Array.isArray(favorites)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Persistence Error:', error);
      // Si falla por cuota (QuotaExceeded), al menos no rompemos el renderizado
    }
  }, [favorites]);

  const toggleFavorite = useCallback((item) => {
    if (!item?.name || !item?.searchType) return;

    setFavorites((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      const isAlreadyFav = current.some(
        (f) => f.name === item.name && f.searchType === item.searchType
      );

      if (isAlreadyFav) {
        return current.filter(
          (f) => !(f.name === item.name && f.searchType === item.searchType)
        );
      }
      
      // 3. Normalización Senior: Guardamos solo lo mínimo necesario
      // Esto evita problemas de tamaño y estructuras circulares
      const favoriteItem = {
        name: item.name,
        searchType: item.searchType,
        id: item.id || null,
        // Guardamos solo la URL del sprite, no el objeto sprites completo
        sprites: { 
          other: { 
            'official-artwork': { 
              front_default: getSprite(item.sprites) 
            } 
          } 
        },
        types: item.types || []
      };
      
      return [...current, favoriteItem];
    });
  }, []);

  const isFavorite = useCallback((name, searchType) => {
    if (!Array.isArray(favorites)) return false;
    return favorites.some((f) => f.name === name && f.searchType === searchType);
  }, [favorites]);

  const clearFavorites = useCallback(() => {
    try {
      setFavorites([]);
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("[Favorites] Error al borrar todo:", err);
    }
  }, []);

  const value = useMemo(() => ({
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites
  }), [favorites, toggleFavorite, isFavorite, clearFavorites]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
