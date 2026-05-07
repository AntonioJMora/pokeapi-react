/* ============================================================
   pokeApi.js — Lógica de comunicación con la PokéAPI
   ============================================================ */

const BASE_URL = 'https://pokeapi.co/api/v2';
const LIMIT = 24;

export const TYPE_COLORS = {
    fire:     '#f08030',
    water:    '#6890f0',
    grass:    '#78c850',
    electric: '#f8d030',
    ice:      '#98d8d8',
    fighting: '#c03028',
    poison:   '#a040a0',
    ground:   '#e0c068',
    flying:   '#a890f0',
    psychic:  '#f85888',
    bug:      '#a8b820',
    rock:     '#b8a038',
    ghost:    '#705898',
    dragon:   '#7038f8',
    dark:     '#705848',
    steel:    '#b8b8d0',
    fairy:    '#ee99ac',
    normal:   '#a8a878'
};

/* --- CACHÉ helpers --- */
function cacheGet(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function cacheSet(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Ignorar
    }
}

const _namesMemory = {};

/**
 * Devuelve objetos { name, id } para permitir búsqueda por ambos campos.
 */
export async function getAllNames(type) {
    if (_namesMemory[type]?.length) return _namesMemory[type];
    const cacheKey = `poke_allnames_v18_${type}`;
    const fromLS = cacheGet(cacheKey);
    if (fromLS !== null && fromLS.length > 0) {
        _namesMemory[type] = fromLS;
        return fromLS;
    }
    const res = await fetch(`${BASE_URL}/${type}?limit=10000`);
    if (!res.ok) throw new Error(`Error al cargar los nombres de ${type}`);
    const json = await res.json();
    
    // Extraemos nombre e ID de la URL
    const results = (json.results || []).map(item => {
        const parts = item.url.split('/');
        const id = parts[parts.length - 2];
        return { name: item.name, id: id };
    });

    _namesMemory[type] = results;
    cacheSet(cacheKey, results);
    return results;
}

export async function searchPokeAPI(type, term) {
    const normalized = term.toLowerCase().trim();
    const cacheKey = `poke_v18_${type}_${normalized}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    let targetNames = [];
    if (normalized !== '') {
        const allItems = await getAllNames(type);
        // Filtramos por nombre O por ID
        targetNames = allItems
            .filter(item => item.name.includes(normalized) || item.id.toString().includes(normalized))
            .slice(0, LIMIT)
            .map(item => item.name);
    } else {
        const res = await fetch(`${BASE_URL}/${type}?limit=${LIMIT}`);
        if (!res.ok) throw new Error(`Error al cargar ${type}`);
        const json = await res.json();
        targetNames = (json.results || []).map(p => p.name);
    }

    const needsDetail = ['pokemon', 'item', 'type'].includes(type);

    let results = [];
    if (needsDetail) {
        const settled = await Promise.allSettled(
            targetNames.map(name => fetch(`${BASE_URL}/${type}/${name}`).then(r => r.json()))
        );
        results = settled
            .filter(d => d.status === 'fulfilled')
            .map(d => ({ ...d.value, searchType: type }));
    } else {
        results = targetNames.map(name => ({ name, searchType: type }));
    }

    cacheSet(cacheKey, results);
    return results;
}

export async function fetchEntityDetail(type, nameOrId) {
    const cacheKey = `poke_detail_v18_${type}_${nameOrId}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;
    const res = await fetch(`${BASE_URL}/${type}/${nameOrId}`);
    if (!res.ok) throw new Error(`${type} no encontrado: ${nameOrId}`);
    const detail = await res.json();
    let extra = null;
    if (type === 'pokemon' && detail.species) {
        try {
            const speciesRes = await fetch(detail.species.url);
            if (speciesRes.ok) extra = await speciesRes.json();
        } catch { }
    }
    const result = { main: detail, extra, type };
    cacheSet(cacheKey, result);
    return result;
}

export function getSprite(item) {
    if (!item) return '';
    if (item.sprites && typeof item.sprites.default === 'string') return item.sprites.default;
    
    const s = item.sprites || item; 
    const isImageUrl = (url) => {
        if (typeof url !== 'string') return false;
        return url.match(/\.(jpeg|jpg|gif|png|svg)$/) !== null || url.includes('/sprites/');
    };
    const official = s.other?.['official-artwork']?.front_default || s.other?.home?.front_default;
    if (official && isImageUrl(official)) return official;
    const standard = s.front_default || s.default;
    if (standard && isImageUrl(standard)) return standard;
    if (typeof s === 'object') {
        const findUrl = (obj) => {
            for (const key in obj) {
                const val = obj[key];
                if (isImageUrl(val)) return val;
                if (val && typeof val === 'object' && key !== 'language' && key !== 'generation') {
                    const res = findUrl(val);
                    if (res) return res;
                }
            }
            return '';
        };
        return findUrl(s);
    }
    return '';
}

export function typeColor(typeName) {
    return TYPE_COLORS[typeName] || '#666';
}

export function statColor(val) {
    if (val >= 100) return '#78c850';
    if (val >= 70)  return '#f8d030';
    if (val >= 45)  return '#f08030';
    return '#c03028';
}
