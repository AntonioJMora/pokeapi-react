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
    <main>
      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h2 style={{ textDecoration: 'underline' }}>Mis Favoritos</h2>
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
                backgroundColor: isConfirming ? '#ff9800' : '#ff4d4d', 
                color: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                cursor: 'pointer',
                minWidth: '120px',
                transition: 'all 0.3s ease'
              }} 
              onClick={handleClearClick}
            >
              {isConfirming ? '¿Estás seguro?' : 'Borrar todo'}
            </button>
          )}
        </div>
      </section>

      <section>
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
