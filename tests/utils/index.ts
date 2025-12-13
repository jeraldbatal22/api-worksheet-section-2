import { expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3001";
const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "cats123";

async function getAuthToken(request: any) {
  const loginRes = await request.post(`${BASE_URL}/api/v1/login`, {
    data: {
      username: DEFAULT_USERNAME,
      password: DEFAULT_PASSWORD,
    },
  });
  expect(loginRes.ok()).toBeTruthy();
  const loginBody = await loginRes.json();
  return loginBody.token;
}

export { getAuthToken };
