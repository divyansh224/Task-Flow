import { Router } from 'express';
import * as controller from '../controllers/taskController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createTaskSchema, updateTaskSchema, updateStatusSchema, taskIdSchema, listTasksQuerySchema } from '../validators/taskValidator.js';

const router = Router();
router.use(authenticate);
router.get('/stats', controller.stats);
router.post('/', validate(createTaskSchema), controller.create);
router.get('/', validate(listTasksQuerySchema), controller.list);
router.get('/:id', validate(taskIdSchema), controller.getById);
router.patch('/:id/status', validate(taskIdSchema), validate(updateStatusSchema), controller.updateStatus);
router.patch('/:id', validate(taskIdSchema), validate(updateTaskSchema), controller.update);
router.delete('/:id', validate(taskIdSchema), controller.remove);
export default router;
