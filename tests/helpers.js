import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { loadConfig } from '../src/config/env.js';
import { createApp } from '../src/app.js';
let mongo;
export let app;
export async function startTestApp() {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  const config = loadConfig({ NODE_ENV: 'test', PORT: '4003', MONGODB_URI: mongo.getUri(), JWT_SECRET: 'test_secret_that_is_long_enough_for_tests_123', JWT_EXPIRES_IN: '15m', CORS_ORIGIN: 'http://localhost:3000' });
  app = createApp(config);
}
export async function stopTestApp() { await mongoose.connection.dropDatabase(); await mongoose.disconnect(); await mongo?.stop(); }
export async function clearCollections() { for (const collection of Object.values(mongoose.connection.collections)) await collection.deleteMany({}); }
