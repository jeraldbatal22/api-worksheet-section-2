import type { QueryResult } from 'pg';
import { pgDatabase } from '../database/ps.ts';

// Pokemon type/interface (based on controller context)
export interface Pokemon {
  id: number;
  name: string;
  type: string;
  level: number;
  abilities: string[];
  createdAt: string;
}

export interface CreatePokemonDTO {
  name: string;
  type: string;
  level: number;
  abilities: string[];
}

// Pokemon Model
class PokemonModel {
  private tableName = 'pokemons';

  // Get all pokemons, with optional type filter and name search
  async getAllPokemons(
    options: { 
      type?: string; 
      name?: string; 
      limit?: number; 
      offset?: number; 
    } = {}
  ): Promise<Pokemon[]> {
    const {
      type,
      name,
      limit = 10,
      offset = 0
    } = options;

    let query = `SELECT * FROM ${this.tableName}`;
    const conditions: string[] = [];
    const values: any[] = [];

    if (type) {
      conditions.push(`type = $${values.length + 1}`);
      values.push(type);
    }

    if (name) {
      conditions.push(`name ILIKE $${values.length + 1}`);
      values.push(`%${name}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const result: QueryResult<Pokemon> = await pgDatabase.query(query, values);
    return result.rows;
  }

  // Create a new pokemon
  async createPokemon(pokemonData: CreatePokemonDTO): Promise<Pokemon> {
    const query = `
      INSERT INTO ${this.tableName} (name, type, level, abilities, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;
    // Assuming abilities is stored as a string[] mapped to a DB array type
    const values = [
      pokemonData.name,
      pokemonData.type,
      pokemonData.level,
      pokemonData.abilities,
    ];
    const result: QueryResult<Pokemon> = await pgDatabase.query(query, values);
    return result.rows[0];
  }
}

export default new PokemonModel();