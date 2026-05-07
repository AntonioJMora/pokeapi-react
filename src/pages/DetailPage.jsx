import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchEntityDetail, typeColor, statColor, getSprite } from '../api/pokeApi';
import { useFavorites } from '../context/FavoritesContext';

const DetailPage = () => {
  const { type, name } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSprite, setActiveSprite] = useState('');
  
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const detail = await fetchEntityDetail(type || 'pokemon', name);
        setData(detail);
        
        const spriteUrl = getSprite(detail.main);
        setActiveSprite(spriteUrl);
      } catch (err) {
        setError(`${type || 'Elemento'} no encontrado: ${name}`);
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [type, name]);

  if (loading) return <p className="detail-loading">Cargando datos...</p>;
  if (error || !data) return (
    <p className="detail-error">
        No se pudo cargar "{name}".<br/>
        <Link to="/" style={{ color: 'var(--amarillo)' }}>← Volver al buscador</Link>
    </p>
  );

  const { main, extra } = data;
  const isPokemon = type === 'pokemon';
  const activeFav = isFavorite(main.name, type);

  // Helper de descripción
  const getDescription = (species) => {
    if (!species?.flavor_text_entries?.length) {
        // Para items/otros el campo suele ser effect_entries o flavor_text_entries directo
        const entries = main.effect_entries || main.flavor_text_entries || [];
        const entry = entries.find(e => (e.language?.name || e.language) === 'es') || entries.find(e => (e.language?.name || e.language) === 'en');
        return entry?.effect || entry?.short_effect || entry?.flavor_text || 'Sin descripción disponible.';
    }
    const es = species.flavor_text_entries.find(e => e.language.name === 'es');
    if (es) return es.flavor_text.replace(/\f/g, ' ');
    const en = species.flavor_text_entries.find(e => e.language.name === 'en');
    return en ? en.flavor_text.replace(/\f/g, ' ') : 'Sin descripción disponible.';
  };

  // Helper Recursivo para traer TODAS las imágenes sin límite
  const getAllSprites = (obj) => {
    if (!obj) return [];
    let results = new Map();
    const isImageUrl = (url) => {
        if (typeof url !== 'string') return false;
        return url.match(/\.(jpeg|jpg|gif|png|svg)$/) !== null || url.includes('/sprites/');
    };
    const iterate = (current, prefix = '') => {
      for (const key in current) {
        const value = current[key];
        if (isImageUrl(value)) {
          results.set(value, prefix || 'Imagen');
        } else if (value && typeof value === 'object') {
          iterate(value, key.replace(/_/g, ' '));
        }
      }
    };
    iterate(obj);
    return Array.from(results).map(([url, label]) => ({ label, url }));
  };

  const allSprites = getAllSprites(main.sprites || main);

  // Decidimos si usamos el layout de dos columnas (si hay imagen) o centrado
  const hasImage = allSprites.length > 0;

  const renderContent = () => {
    const generation = (extra?.generation?.name || main.generation?.name)?.replace('generation-', 'Gen ').toUpperCase() || '—';

    if (hasImage) {
      return (
        <div className="detail-layout">
          {/* Panel Izquierdo: Imagen principal */}
          <section className="detail-panel-left">
            {main.id && <span className="detail-id">#{String(main.id).padStart(3, '0')}</span>}
            <img id="mainSprite" src={activeSprite} alt={main.name} />
            <h2 className="detail-name">{main.name}</h2>
            {isPokemon && (
              <p className="poke-types">
                {main.types?.map(t => (
                  <span key={t.type.name} className="type-badge" style={{ background: typeColor(t.type.name) }}>
                    {t.type.name}
                  </span>
                ))}
              </p>
            )}
            {!isPokemon && <p className="poke-id" style={{ textTransform: 'capitalize' }}>{type}</p>}
          </section>

          {/* Panel Derecho: Datos */}
          <div className="detail-panel-right">
            <section className="detail-section">
              <h3>Descripción</h3>
              <p style={{ fontSize: '.95rem', lineHeight: '1.6' }}>{getDescription(extra)}</p>
            </section>

            {isPokemon && (
              <section className="detail-section">
                <h3>Datos básicos</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Altura</span>
                    <span className="value">{(main.height / 10).toFixed(1)} m</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Peso</span>
                    <span className="value">{(main.weight / 10).toFixed(1)} kg</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Exp. base</span>
                    <span className="value">{main.base_experience ?? '—'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Generación</span>
                    <span className="value">{generation}</span>
                  </div>
                  <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="label">Habilidades</span>
                    <div className="moves-grid">
                      {main.abilities?.map(a => (
                        <span key={a.ability.name} className="move-badge">
                          {a.ability.name}
                          {a.is_hidden && <small style={{ color: 'var(--muted)' }}> (oculta)</small>}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {!isPokemon && (
              <section className="detail-section">
                <h3>Información</h3>
                <div className="info-grid">
                  {main.id && <div className="info-item"><span className="label">ID</span><span className="value">{main.id}</span></div>}
                  {generation !== '—' && <div className="info-item"><span className="label">Generación</span><span className="value">{generation}</span></div>}
                  {main.cost != null && <div className="info-item"><span className="label">Coste</span><span className="value">{main.cost} ₽</span></div>}
                  {main.category?.name && <div className="info-item"><span className="label">Categoría</span><span className="value">{main.category.name}</span></div>}
                </div>
              </section>
            )}

            {isPokemon && (
              <section className="detail-section">
                <h3>Estadísticas base</h3>
                <div className="stats-list">
                  {main.stats?.map(s => {
                    const name = s.stat.name.replace('special-attack', 'sp. atk').replace('special-defense', 'sp. def').replace('hp', 'HP');
                    const val = s.base_stat;
                    const pct = Math.min((val / 255) * 100, 100).toFixed(1);
                    return (
                      <div key={s.stat.name} className="stat-row">
                        <span className="stat-name">{name}</span>
                        <span className="stat-val">{val}</span>
                        <div className="stat-bar-bg">
                          <div className="stat-bar" style={{ width: `${pct}%`, background: statColor(val) }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {isPokemon && (
              <section className="detail-section">
                <h3>Movimientos (primeros 20)</h3>
                <div className="moves-grid">
                  {main.moves?.slice(0, 20).map(m => (
                    <span key={m.move.name} className="move-badge">{m.move.name}</span>
                  ))}
                </div>
              </section>
            )}

            {(main.pokemon || []).length > 0 && (
              <section className="detail-section">
                <h3>Pokémon relacionados</h3>
                <div className="moves-grid">
                  {main.pokemon.slice(0, 30).map(p => {
                    const pname = p.pokemon?.name || p.name || '—';
                    return <Link key={pname} to={`/pokemon/${pname}`} className="move-badge">{pname}</Link>;
                  })}
                </div>
              </section>
            )}

            {/* Galería al final del todo */}
            <section className="detail-section">
              <h3>Galería / Variantes</h3>
              <div className="sprite-row">
                {allSprites.map((s, idx) => (
                  <img
                    key={idx}
                    src={s.url}
                    alt={s.label}
                    className={`sprite-mini ${activeSprite === s.url ? 'active' : ''}`}
                    onClick={() => setActiveSprite(s.url)}
                    title={s.label}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      );
    }

    // Layout centrado para cosas sin imagen (como habilidades)
    return (
      <article className="card">
        <h2>{main.name}</h2>
        <section className="detail-section">
          <h3>Descripción</h3>
          <p style={{ fontSize: '.95rem', lineHeight: '1.6' }}>{getDescription(extra)}</p>
        </section>
        <section className="detail-section">
          <h3>Información</h3>
          <div className="info-grid">
            {main.id && <div className="info-item"><span className="label">ID</span><span className="value">{main.id}</span></div>}
            {generation !== '—' && <div className="info-item"><span className="label">Generación</span><span className="value">{generation}</span></div>}
          </div>
        </section>
        {(main.pokemon || []).length > 0 && (
          <section className="detail-section">
            <h3>Pokémon relacionados</h3>
            <div className="moves-grid">
              {main.pokemon.slice(0, 30).map(p => {
                const pname = p.pokemon?.name || p.name || '—';
                return <Link key={pname} to={`/pokemon/${pname}`} className="move-badge">{pname}</Link>;
              })}
            </div>
          </section>
        )}
      </article>
    );
  };

  return (
    <main className="app-container">
      <div className="detail-controls">
        <Link to="/" className="btn-back">← Volver al buscador</Link>
        <button 
          className={`fav-btn-large ${activeFav ? 'active' : ''}`} 
          onClick={() => toggleFavorite({ ...main, searchType: type })}
          title={activeFav ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
          {activeFav ? '❤️' : '🤍'}
        </button>
      </div>

      <div id="detailContainer">
        {renderContent()}
      </div>
    </main>
  );
};

export default DetailPage;
