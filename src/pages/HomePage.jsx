import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import PokemonCard from '../components/PokemonCard';
import { searchPokeAPI } from '../api/pokeApi';

const HomePage = () => {
  const [entityType, setEntityType] = useState('pokemon');
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [entityType, searchTerm]);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchPokeAPI(entityType, searchTerm);
      setResults(data);
    } catch (err) {
      setError('No se pudieron cargar los resultados.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-container">
      <section className="card">
        <h2>Buscador de la API de Pokémon</h2>
        
        <SearchBar
          entityType={entityType}
          setEntityType={setEntityType}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {loading && <p className="search-state">Cargando resultados...</p>}
        {error && <p className="search-state" style={{ color: '#c03028' }}>{error}</p>}
        {!loading && !error && results.length === 0 && (
          <p className="search-state">No se encontraron resultados.</p>
        )}
        
        <output className="results-grid">
          {results.map((item, index) => (
            <PokemonCard key={item.id || item.name || index} item={item} />
          ))}
        </output>
      </section>
    </main>
  );
};

export default HomePage;
