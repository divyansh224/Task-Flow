import mongoose from 'mongoose';
import Task from '../models/Task.js';
import ApiError from '../utils/ApiError.js';

const allowedSorts = { createdAt: 'createdAt', dueDate: 'dueDate', priority: 'priority', updatedAt: 'updatedAt' };
export async function createTask(ownerId, input) { return Task.create({ ...input, owner: ownerId }); }
export async function listTasks(ownerId, query) {
  const page = Math.max(1, Number.parseInt(query.page ?? '1', 10));
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit ?? '10', 10)));
  const filter = { owner: ownerId };
  if (query.status && ['pending', 'in_progress', 'completed'].includes(query.status)) filter.status = query.status;
  if (query.priority && ['low', 'medium', 'high'].includes(query.priority)) filter.priority = query.priority;
  if (query.tag) filter.tags = query.tag;
  if (query.search) {
    const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const expression = new RegExp(escaped, 'i');
    filter.$or = [{ title: expression }, { description: expression }];
  }
  const sortKey = allowedSorts[query.sortBy] || 'createdAt';
  const direction = query.sortOrder === 'asc' ? 1 : -1;
  const [tasks, total] = await Promise.all([
    Task.find(filter).sort({ [sortKey]: direction, _id: 1 }).skip((page - 1) * limit).limit(limit),
    Task.countDocuments(filter)
  ]);
  return { tasks, meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPreviousPage: page > 1 } };
}
export async function getTask(ownerId, id) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, 'Task not found');
  const task = await Task.findOne({ _id: id, owner: ownerId });
  if (!task) throw new ApiError(404, 'Task not found');
  return task;
}
export async function updateTask(ownerId, id, input) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, 'Task not found');
  const task = await Task.findOneAndUpdate({ _id: id, owner: ownerId }, { $set: input }, { new: true, runValidators: true });
  if (!task) throw new ApiError(404, 'Task not found');
  return task;
}
export async function deleteTask(ownerId, id) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, 'Task not found');
  const task = await Task.findOneAndDelete({ _id: id, owner: ownerId });
  if (!task) throw new ApiError(404, 'Task not found');
}
export async function getTaskStats(ownerId) {
  const now = new Date();
  const [total, pending, inProgress, completed, overdue] = await Promise.all([
    Task.countDocuments({ owner: ownerId }), Task.countDocuments({ owner: ownerId, status: 'pending' }),
    Task.countDocuments({ owner: ownerId, status: 'in_progress' }), Task.countDocuments({ owner: ownerId, status: 'completed' }),
    Task.countDocuments({ owner: ownerId, status: { $ne: 'completed' }, dueDate: { $lt: now, $ne: null } })
  ]);
  return { total, pending, inProgress, completed, overdue };
}
