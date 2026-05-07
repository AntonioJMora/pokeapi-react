import React from 'react';

const SearchBar = ({ entityType, setEntityType, searchTerm, setSearchTerm }) => {
  const options = [
    { value: 'pokemon', label: 'Pokémon' },
    { value: 'type', label: 'Tipo' },
    { value: 'ability', label: 'Habilidades' },
    { value: 'move', label: 'Movimientos' },
    { value: 'item', label: 'Objetos' },
    { value: 'location', label: 'Localizaciones' },
    { value: 'region', label: 'Regiones' },
    { value: 'generation', label: 'Generaciones' },
    { value: 'egg-group', label: 'Grupos de Huevo' },
  ];

  return (
    <form className="search-controls" onSubmit={(e) => e.preventDefault()}>
      <select
        id="entityTypes"
        className="form-select"
        aria-label="Selección de categoría"
        value={entityType}
        onChange={(e) => setEntityType(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        id="searchInput"
        className="search-input"
        placeholder="Escribe para buscar"
        aria-label="Campo de búsqueda"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </form>
  );
};

export default SearchBar;
