import { test, expect, request as pwRequest } from '@playwright/test';
import { getAuthToken } from '../utils';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

test.describe('Todo API E2E', () => {

  // test.beforeEach(async ({}) => {
  //   // Assuming the app provides a way to reset todos, e.g. a special test endpoint
  //   await pwRequest.newContext().then(async (context) => {
  //     await context.post(`${BASE_URL}/api/v1/todos/reset`);
  //     await context.close();
  //   });
  // });

  test('gets all todos (unauthenticated)', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/todos`);
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toHaveProperty('error');
    expect(body).toHaveProperty('message');
  });

  test('gets all todos (authenticated)', async ({ request }) => {
    const token = await getAuthToken(request);
    const response = await request.get(`${BASE_URL}/api/v1/todos`, {
      headers: {
        authorization: `Bearer ${token}`,
      }
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('gets single todo and fails on missing id (authenticated)', async ({ request }) => {
    const token = await getAuthToken(request);
    // Add a new todo first so you know its id
    const addRes = await request.post(`${BASE_URL}/api/v1/todos`, {
      data: { title: "Get One", description: "GetOne", completed: false },
      headers: { authorization: `Bearer ${token}` }
    });
    expect(addRes.status()).toBe(201);
    const added = await addRes.json();
    const id = added.data?.id ?? "1";

    const res = await request.get(`${BASE_URL}/api/v1/todos/${id}`, {
      headers: { authorization: `Bearer ${token}` }
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('id', id);

    // Now request a non-existent id
    const missingRes = await request.get(`${BASE_URL}/api/v1/todos/99999`, {
      headers: { authorization: `Bearer ${token}` }
    });
    expect(missingRes.status()).not.toBe(201);
    const missingBody = await missingRes.json();
    expect(missingBody).toHaveProperty('error');
  });

  test('adds todos and increases array length (authenticated)', async ({ request }) => {
    const token = await getAuthToken(request);
    // Get initial todos
    const initialRes = await request.get(`${BASE_URL}/api/v1/todos`, {
      headers: { authorization: `Bearer ${token}` }
    });
    const initialBody = await initialRes.json();
    const initialLength = (initialBody.data || []).length;

    const reqs = [
      { title: "New 1", description: "Desc1", completed: false },
      { title: "New 2", description: "Desc2", completed: true },
    ];

    for(const body of reqs) {
      const res = await request.post(`${BASE_URL}/api/v1/todos`, { 
        data: body,
        headers: { authorization: `Bearer ${token}` }
      });
      expect(res.status()).toBe(201);
      const data = await res.json();
      expect(data).toMatchObject({
        success: true,
        message: "Successfully Added Todo"
      });
    }

    const finalRes = await request.get(`${BASE_URL}/api/v1/todos`, {
      headers: { authorization: `Bearer ${token}` }
    });
    const finalBody = await finalRes.json();
    expect((finalBody.data || []).length).toBe(initialLength + reqs.length);
  });

  test('updates todo and fails when id not found (authenticated)', async ({ request }) => {
    const token = await getAuthToken(request);
    // Create a new todo to update
    const addRes = await request.post(`${BASE_URL}/api/v1/todos`, { 
      data: { title: "Edit Me", description: "desc", completed: false },
      headers: { authorization: `Bearer ${token}` }
    });
    expect(addRes.status()).toBe(201);
    const added = await addRes.json();
    const todoId = added.data?.id || "1";

    const updateRes = await request.put(`${BASE_URL}/api/v1/todos/${todoId}`, {
      data: { title: "Updated", description: "Updated", completed: true },
      headers: { authorization: `Bearer ${token}` }
    });
    expect(updateRes.status()).toBe(201);
    const updateBody = await updateRes.json();
    expect(updateBody).toMatchObject({
      message: "Successfully Updated Todo"
    });

    // Update non-existent
    const missingRes = await request.put(`${BASE_URL}/api/v1/todos/99999`, {
      data: { title: "Updated", description: "Updated", completed: true },
      headers: { authorization: `Bearer ${token}` }
    });
    expect(missingRes.status()).not.toBe(201);
    const missingBody = await missingRes.json();
    expect(missingBody).toHaveProperty('error');
  });

  test('deletes todo and fails on missing id (authenticated)', async ({ request }) => {
    const token = await getAuthToken(request);
    // First add a todo to delete
    const addRes = await request.post(`${BASE_URL}/api/v1/todos`, { 
      data: { title: "Delete Me", description: "del", completed: false },
      headers: { authorization: `Bearer ${token}` }
    });
    expect(addRes.status()).toBe(201);
    const added = await addRes.json();
    const todoId = added.data?.id || "1";

    const delRes = await request.delete(`${BASE_URL}/api/v1/todos/${todoId}`, {
      headers: { authorization: `Bearer ${token}` }
    });
    expect(delRes.status()).toBe(201);
    const delBody = await delRes.json();
    expect(delBody).toMatchObject({
      message: "Successfully Deleted Todo"
    });

    // Try to delete a missing one
    const missingRes = await request.delete(`${BASE_URL}/api/v1/todos/99999`, {
      headers: { authorization: `Bearer ${token}` }
    });
    expect(missingRes.status()).not.toBe(201);
    const missingBody = await missingRes.json();
    expect(missingBody).toHaveProperty('error');
  });
});

