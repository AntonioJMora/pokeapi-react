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

  const renderPokemonCard = () => {
    const sprite = getSprite(item);
    return (
      <article className="poke-card">
        <button 
          type="button"
          className={`fav-btn ${activeFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label={activeFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          {activeFavorite ? '❤️' : '🤍'}
        </button>
        <Link to={`/${searchType}/${name}`} className="poke-card-link">
          <span className="poke-id">#{id?.toString().padStart(3, '0') || '???'}</span>
          {sprite && <img src={sprite} alt={name} loading="lazy" className="poke-card-img" />}
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
  };

  const renderGenericCard = () => {
    const sprite = getSprite(item);
    
    const categoryLabels = {
      type:     'Tipo',
      ability:  'Habilidad',
      item:     'Objeto',
      region:   'Región',
      location: 'Lugar',
      habitat:  'Hábitat',
      generation: 'Generación'
    };

    const label = categoryLabels[searchType] || searchType;

    return (
      <article className="generic-card">
        <button 
          type="button"
          className={`fav-btn ${activeFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          aria-label="Toggle Favorite"
        >
          {activeFavorite ? '❤️' : '🤍'}
        </button>
        <Link to={`/${searchType}/${name}`} className="generic-card-link" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="generic-card-content">
            {/* Solo mostramos el bloque de imagen si la API nos da una real */}
            {sprite && (
              <div className="generic-sprite-clean">
                <img src={sprite} alt={name} loading="lazy" />
              </div>
            )}
            <div className="generic-text-info">
              <h3>{name}</h3>
              <p className="poke-id">{label}</p>
            </div>
          </div>
        </Link>
      </article>
    );
  };

  return searchType === 'pokemon' ? renderPokemonCard() : renderGenericCard();
});

export default PokemonCard;
