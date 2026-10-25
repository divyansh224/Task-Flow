import { z } from 'zod';
const statuses = ['pending', 'in_progress', 'completed'];
const priorities = ['low', 'medium', 'high'];
const taskFields = {
  title: z.string().trim().min(1).max(160), description: z.string().trim().max(5000),
  status: z.enum(statuses), priority: z.enum(priorities),
  dueDate: z.string().datetime({ offset: true }).nullable(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20)
};
export const createTaskSchema = z.object({ body: z.object({
  title: taskFields.title, description: taskFields.description.optional(), status: taskFields.status.optional(),
  priority: taskFields.priority.optional(), dueDate: taskFields.dueDate.optional(), tags: taskFields.tags.optional()
}).strict() });
export const updateTaskSchema = z.object({ body: z.object({
  title: taskFields.title.optional(), description: taskFields.description.optional(), status: taskFields.status.optional(),
  priority: taskFields.priority.optional(), dueDate: taskFields.dueDate.optional(), tags: taskFields.tags.optional()
}).strict().refine((body) => Object.keys(body).length > 0, 'At least one field is required') });
export const updateStatusSchema = z.object({ body: z.object({ status: taskFields.status }).strict() });
export const taskIdSchema = z.object({ params: z.object({ id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid task ID') }) });

export const listTasksQuerySchema = z.object({ query: z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(statuses).optional(),
  priority: z.enum(priorities).optional(),
  tag: z.string().trim().min(1).max(40).optional(),
  search: z.string().trim().max(200).optional(),
  sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
}).strict() });
