import type { Pokemon, CreatePokemonDTO } from '../model/pokemon.model.ts';
import PokemonModel from '../model/pokemon.model.ts';

export interface PokemonListOptions {
  type?: string;
  name?: string;
  limit?: number;
  offset?: number;
}

// For pagination, you can expand as needed
export interface PaginatedPokemons {
  pokemons: Pokemon[];
  pagination: {
    limit: number;
    offset: number;
    count: number;
    hasMore: boolean;
  };
}

class PokemonService {
  // Get all pokemons (with type/name search & pagination)
  async getAllPokemons(options: PokemonListOptions = {}): Promise<PaginatedPokemons> {
    const {
      type,
      name,
      limit = 10,
      offset = 0
    } = options;

    // Basic validation for pagination
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safeOffset = Math.max(offset, 0);

    const pokemons = await PokemonModel.getAllPokemons({
      type,
      name,
      limit: safeLimit,
      offset: safeOffset,
    });

    // For pagination info, we need a count
    // We'll simply count with the same filters - this is best as a separate method in a real app,
    // but for now, simulate as count= pokemons.length if not real "total"
    const count = pokemons.length;
    const hasMore = count === safeLimit; // crude - could refine with real total

    return {
      pokemons,
      pagination: {
        limit: safeLimit,
        offset: safeOffset,
        count,
        hasMore,
      },
    };
  }

  // Create a new Pokemon
  async createPokemon(data: CreatePokemonDTO): Promise<Pokemon> {
    if (
      !data.name ||
      typeof data.name !== 'string' ||
      data.name.trim().length === 0
    ) {
      throw new Error('POKEMON_NAME_REQUIRED');
    }
    if (
      !data.type ||
      typeof data.type !== 'string' ||
      data.type.trim().length === 0
    ) {
      throw new Error('POKEMON_TYPE_REQUIRED');
    }
    if (
      typeof data.level !== 'number' ||
      isNaN(data.level) ||
      data.level < 1
    ) {
      throw new Error('POKEMON_LEVEL_INVALID');
    }
    if (
      !Array.isArray(data.abilities) ||
      data.abilities.length === 0 ||
      !data.abilities.every(a => typeof a === 'string' && a.length > 0)
    ) {
      throw new Error('POKEMON_ABILITIES_INVALID');
    }

    // Trim fields
    const trimmedData: CreatePokemonDTO = {
      name: data.name.trim(),
      type: data.type.trim(),
      level: data.level,
      abilities: data.abilities.map(a => a.trim()),
    };

    return await PokemonModel.createPokemon(trimmedData);
  }
}

export default new PokemonService();