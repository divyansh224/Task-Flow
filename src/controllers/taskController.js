import * as taskService from '../services/taskService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const create = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.user.id, req.body);
  res.status(201).json({ success: true, message: 'Task created successfully', data: { task } });
});
export const list = asyncHandler(async (req, res) => {
  const result = await taskService.listTasks(req.user.id, req.validatedQuery);
  res.json({ success: true, message: 'Tasks retrieved successfully', data: result.tasks, meta: result.meta });
});
export const getById = asyncHandler(async (req, res) => {
  const task = await taskService.getTask(req.user.id, req.params.id);
  res.json({ success: true, message: 'Task retrieved successfully', data: { task } });
});
export const update = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.user.id, req.params.id, req.body);
  res.json({ success: true, message: 'Task updated successfully', data: { task } });
});
export const updateStatus = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.user.id, req.params.id, req.body);
  res.json({ success: true, message: 'Task status updated successfully', data: { task } });
});
export const remove = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.user.id, req.params.id);
  res.status(204).send();
});
export const stats = asyncHandler(async (req, res) => {
  const data = await taskService.getTaskStats(req.user.id);
  res.json({ success: true, message: 'Task statistics retrieved successfully', data });
});
