import type { Request, Response, NextFunction } from 'express';
import PokemonService from '../services/pokemon.service.ts';

class PokemonController {
  /**
   * Get all pokemons, optionally filterable with query params: type, name, limit, offset
   * Example: GET /pokemon?type=Fire&name=pika&limit=10&offset=0
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
      const type = req.query.type ? String(req.query.type) : undefined;
      const name = req.query.name ? String(req.query.name) : undefined;

      // Defensive checks for limit/offset
      if (isNaN(limit) || limit < 1 || limit > 100) {
        res.status(400).json({ error: 'Invalid pagination parameter: limit' });
        return;
      }
      if (isNaN(offset) || offset < 0) {
        res.status(400).json({ error: 'Invalid pagination parameter: offset' });
        return;
      }

      const result = await PokemonService.getAllPokemons({
        limit,
        offset,
        type,
        name,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new pokemon
   * Post body: { name: string, type: string, level: number, abilities: string[] }
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, type, level, abilities } = req.body;
      const created = await PokemonService.createPokemon({ name, type, level, abilities });
      res.status(201).json({ data: created });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'POKEMON_NAME_REQUIRED') {
          res.status(400).json({ error: 'Name is required' });
          return;
        }
        if (error.message === 'POKEMON_TYPE_REQUIRED') {
          res.status(400).json({ error: 'Type is required' });
          return;
        }
        if (error.message === 'POKEMON_LEVEL_INVALID') {
          res.status(400).json({ error: 'Level is invalid' });
          return;
        }
        if (error.message === 'POKEMON_ABILITIES_INVALID') {
          res.status(400).json({ error: 'Abilities must be a non-empty array of strings' });
          return;
        }
      }
      next(error);
    }
  }
}

export default new PokemonController();