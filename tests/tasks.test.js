import request from 'supertest';
import { beforeAll, afterAll, beforeEach, describe, expect, test } from '@jest/globals';
import { startTestApp, stopTestApp, clearCollections, app } from './helpers.js';

beforeAll(async () => { await startTestApp(); });
afterAll(async () => { await stopTestApp(); });
beforeEach(async () => { await clearCollections(); });
async function createUser(email = 'owner@example.com') {
  const response = await request(app).post('/api/v1/auth/register').send({ name: 'Task Owner', email, password: 'securePassword123' });
  return { token: response.body.data.accessToken, id: response.body.data.user._id };
}
const auth = (token) => ({ Authorization: `Bearer ${token}` });

describe('tasks', () => {
  test('creates task and ignores untrusted owner field', async () => {
    const owner = await createUser();
    const response = await request(app).post('/api/v1/tasks').set(auth(owner.token)).send({ title: 'Build API', tags: ['node'], owner: '000000000000000000000000' }).expect(400);
    expect(response.body.success).toBe(false);
    await request(app).post('/api/v1/tasks').set(auth(owner.token)).send({ title: 'Build API', tags: ['node'] }).expect(201);
  });
  test('lists paginated tasks with filter and search', async () => {
    const owner = await createUser();
    await request(app).post('/api/v1/tasks').set(auth(owner.token)).send({ title: 'Write Node docs', priority: 'high', tags: ['docs'] }).expect(201);
    await request(app).post('/api/v1/tasks').set(auth(owner.token)).send({ title: 'Clean room', priority: 'low' }).expect(201);
    const response = await request(app).get('/api/v1/tasks?page=1&limit=1&priority=high&search=Node').set(auth(owner.token)).expect(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.meta.total).toBe(1);
  });
  test('updates and deletes own task', async () => {
    const owner = await createUser();
    const created = await request(app).post('/api/v1/tasks').set(auth(owner.token)).send({ title: 'Initial' }).expect(201);
    const id = created.body.data.task._id;
    await request(app).patch(`/api/v1/tasks/${id}`).set(auth(owner.token)).send({ title: 'Changed' }).expect(200);
    await request(app).patch(`/api/v1/tasks/${id}/status`).set(auth(owner.token)).send({ status: 'completed' }).expect(200);
    await request(app).delete(`/api/v1/tasks/${id}`).set(auth(owner.token)).expect(204);
  });
  test('does not expose another user tasks for read, update, or delete', async () => {
    const owner = await createUser(); const other = await createUser('other@example.com');
    const created = await request(app).post('/api/v1/tasks').set(auth(owner.token)).send({ title: 'Private' }).expect(201);
    const id = created.body.data.task._id;
    await request(app).get(`/api/v1/tasks/${id}`).set(auth(other.token)).expect(404);
    await request(app).patch(`/api/v1/tasks/${id}`).set(auth(other.token)).send({ title: 'Hijack' }).expect(404);
    await request(app).delete(`/api/v1/tasks/${id}`).set(auth(other.token)).expect(404);
  });
  test('rejects invalid IDs and returns statistics', async () => {
    const owner = await createUser();
    await request(app).get('/api/v1/tasks/not-an-id').set(auth(owner.token)).expect(400);
    await request(app).post('/api/v1/tasks').set(auth(owner.token)).send({ title: 'Overdue', dueDate: '2020-01-01T00:00:00.000Z' }).expect(201);
    const stats = await request(app).get('/api/v1/tasks/stats').set(auth(owner.token)).expect(200);
    expect(stats.body.data.total).toBe(1); expect(stats.body.data.overdue).toBe(1);
  });
});
