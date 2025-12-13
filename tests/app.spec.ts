import { test, expect } from '@playwright/test';
import { clearSession, createSession } from '../app.ts';
import { PORT } from '../config/env.ts';

const BASE_URL = `http://localhost:${PORT}`;
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'cats123';

test.describe('auth middleware', () => {
  test.beforeEach(async () => {
    // Clear session before each test
    clearSession();
  });

  test('blocks when not authenticated', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/protected`);
    
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({
      error: expect.any(String),
    });
  });

  test('blocks when token invalid', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/protected`, {
      headers: {
        authorization: 'Bearer invalid',
      },
    });
    
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({
      error: expect.any(Boolean),
    });
    expect(body.message).toMatch(/Invalid|token/i);
  });

  test('allows request when authenticated and authorized', async ({ request }) => {
    // First, login to get a valid token
    const loginResponse = await request.post(`${BASE_URL}/api/v1/login`, {
      data: {
        username: DEFAULT_USERNAME,
        password: DEFAULT_PASSWORD,
      },
    });
    
    expect(loginResponse.ok()).toBeTruthy();
    const loginBody = await loginResponse.json();
    const token = loginBody.token;
    
    // Then, use the token to access protected route
    const protectedResponse = await request.get(`${BASE_URL}/api/v1/protected`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    
    expect(protectedResponse.ok()).toBeTruthy();
    const protectedBody = await protectedResponse.text();
    expect(protectedBody).toBe('Hello to protected routes');
  });
});

test.describe('isSessionValid', () => {
  test.beforeEach(() => {
    clearSession();
  });

  test('returns false when no session', async ({ request }) => {
    // Test by trying to access protected route with a random token
    const response = await request.get(`${BASE_URL}/api/v1/protected`, {
      headers: {
        authorization: 'Bearer some-random-token-that-does-not-exist',
      },
    });
    
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({
      error: expect.any(Boolean),
    });
  });

  test('returns false when token mismatched', async ({ request }) => {
    // Create a session
    const session = createSession();
    
    // Try to access protected route with a different token
    const response = await request.get(`${BASE_URL}/api/v1/protected`, {
      headers: {
        authorization: 'Bearer different-token-than-created',
      },
    });
    
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({
      error: expect.any(Boolean),
    });
  });

  test('returns true for valid session', async ({ request }) => {
    // Create a session
    const session = createSession();
    
    // Use the created session token to access protected route
    const response = await request.get(`${BASE_URL}/api/v1/protected`, {
      headers: {
        authorization: `Bearer ${session.token}`,
      },
    });
    
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    expect(body).toBe('Hello to protected routes');
  });
});
