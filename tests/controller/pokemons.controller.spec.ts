import { test, expect } from '@playwright/test';
import { BASE_URL } from '../../config/env';

test.describe('GET /pokemons', () => {
  test('should return all pokemons if no query params', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/pokemons`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toMatch(/Successfully fetched Pokemons/i);
    expect(Array.isArray(body.data)).toBe(true);
    // Optionally, check for some known data structure or length
    expect(body.data.length).toBeGreaterThan(0);
  });

  test('should filter pokemons by type', async ({ request }) => {
    const type = 'Water';
    const response = await request.get(`${BASE_URL}/api/v1/pokemons?type=${type}`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    for (const p of body.data) {
      expect((p.type || '').toLowerCase()).toContain(type.toLowerCase());
    }
  });

  test('should filter pokemons by name', async ({ request }) => {
    const name = 'chu';
    const response = await request.get(`${BASE_URL}/api/v1/pokemons?name=${name}`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    for (const p of body.data) {
      expect((p.name || '').toLowerCase()).toContain(name);
    }
  });

  test('should filter pokemons by both name and type', async ({ request }) => {
    const name = 'duck';
    const type = 'water';
    const response = await request.get(`${BASE_URL}/api/v1/pokemons?name=${name}&type=${type}`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    for (const p of body.data) {
      expect((p.name || '').toLowerCase()).toContain(name);
      expect((p.type || '').toLowerCase()).toContain(type);
    }
  });
});
