import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { getSprite, typeColor } from '../api/pokeApi';
import { useFavorites } from '../context/FavoritesContext';

const PokemonCard = memo(({ item }) => {
  if (!item) return null;
  const { name, searchType, id, types } = item;
  const { isFavorite, toggleFavorite } = useFavorites();
  const activeFavorite = isFavorite(name, searchType);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(item);
  };

  const sprite = getSprite(item);

  if (searchType === 'pokemon') {
    return (
      <article className="poke-card">
        <button 
          className={`fav-btn-float ${activeFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
        >
          {activeFavorite ? '❤️' : '🤍'}
        </button>
        <Link to={`/${searchType}/${name}`}>
          <span className="poke-id">#{id?.toString().padStart(3, '0') || '???'}</span>
          {sprite && <img src={sprite} alt={name} loading="lazy" />}
          <h3>{name}</h3>
          <div className="poke-types">
            {types?.map((t) => (
              <span key={t.type.name} className="type-badge" style={{ backgroundColor: typeColor(t.type.name) }}>
                {t.type.name}
              </span>
            ))}
          </div>
        </Link>
      </article>
    );
  }

  // Tarjeta para otras categorías (tipo, objeto, etc.) con soporte para imagen
  return (
    <article className="generic-card">
      <button 
        className={`fav-btn-float ${activeFavorite ? 'active' : ''}`}
        onClick={handleFavoriteClick}
      >
        {activeFavorite ? '❤️' : '🤍'}
      </button>
      <Link to={`/${searchType}/${name}`}>
        {sprite && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <img src={sprite} alt={name} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
          </div>
        )}
        <h3>{name}</h3>
        <span className="poke-id" style={{ textTransform: 'capitalize' }}>{searchType}</span>
      </Link>
    </article>
  );
});

export default PokemonCard;
