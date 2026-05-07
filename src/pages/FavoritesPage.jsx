import React from 'react';
import { useFavorites } from '../context/FavoritesContext';
import PokemonCard from '../components/PokemonCard';

const FavoritesPage = () => {
  const { favorites, clearFavorites } = useFavorites();
  const [isConfirming, setIsConfirming] = React.useState(false);

  // Efecto para resetear el botón de confirmación tras 3 segundos
  React.useEffect(() => {
    let timeout;
    if (isConfirming) {
      timeout = setTimeout(() => setIsConfirming(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isConfirming]);

  const handleClearClick = () => {
    if (!isConfirming) {
      setIsConfirming(true);
    } else {
      clearFavorites();
      setIsConfirming(false);
    }
  };

  return (
    <main className="app-container">
      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '2px solid var(--borde)', paddingBottom: '15px', marginBottom: '15px' }}>
          <div>
            <h2>Mis Favoritos</h2>
            <p className="search-state">
              {favorites.length === 0 
                ? "Aún no tienes elementos guardados." 
                : `Tienes ${favorites.length} elemento(s) guardado(s).`}
            </p>
          </div>
          {favorites.length > 0 && (
            <button 
              type="button" 
              className="btn-back" 
              style={{ 
                backgroundColor: isConfirming ? '#f08030' : '#c03028', 
                color: 'white'
              }} 
              onClick={handleClearClick}
            >
              {isConfirming ? '¿Estás seguro?' : 'Borrar todo'}
            </button>
          )}
        </div>

        <output className="results-grid">
          {favorites.map((item, index) => (
            <PokemonCard key={`${item.searchType}-${item.name}-${index}`} item={item} />
          ))}
        </output>
      </section>
    </main>
  );
};

export default FavoritesPage;
