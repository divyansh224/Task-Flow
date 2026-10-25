import request from 'supertest';
import { beforeAll, afterAll, beforeEach, describe, expect, test } from '@jest/globals';
import { startTestApp, stopTestApp, clearCollections, app } from './helpers.js';

beforeAll(async () => { await startTestApp(); });
afterAll(async () => { await stopTestApp(); });
beforeEach(async () => { await clearCollections(); });
const user = { name: 'Test User', email: 'TEST@example.com', password: 'securePassword123' };

describe('authentication', () => {
  test('registers user and never returns password hash', async () => {
    const response = await request(app).post('/api/v1/auth/register').send(user).expect(201);
    expect(response.body.data.user.email).toBe('test@example.com');
    expect(response.body.data.user.password).toBeUndefined();
    expect(response.body.data.accessToken).toBeTruthy();
  });
  test('rejects duplicate registration', async () => {
    await request(app).post('/api/v1/auth/register').send(user).expect(201);
    await request(app).post('/api/v1/auth/register').send({ ...user, email: 'test@example.com' }).expect(409);
  });
  test('rejects invalid registration data', async () => { await request(app).post('/api/v1/auth/register').send({ ...user, password: '123' }).expect(400); });
  test('logs in and rejects incorrect credentials', async () => {
    await request(app).post('/api/v1/auth/register').send(user).expect(201);
    const login = await request(app).post('/api/v1/auth/login').send({ email: 'test@example.com', password: user.password }).expect(200);
    expect(login.body.data.accessToken).toBeTruthy();
    await request(app).post('/api/v1/auth/login').send({ email: user.email, password: 'wrongpassword' }).expect(401);
  });
  test('protects current user route and returns profile', async () => {
    await request(app).get('/api/v1/auth/me').expect(401);
    const registered = await request(app).post('/api/v1/auth/register').send(user);
    const token = registered.body.data.accessToken;
    const me = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`).expect(200);
    expect(me.body.data.user.name).toBe(user.name);
    await request(app).get('/api/v1/auth/me').set('Authorization', 'Bearer invalid').expect(401);
  });
  test('updates profile', async () => {
    const registered = await request(app).post('/api/v1/auth/register').send(user);
    await request(app).patch('/api/v1/auth/me').set('Authorization', `Bearer ${registered.body.data.accessToken}`).send({ name: 'Updated Name' }).expect(200);
  });
});
