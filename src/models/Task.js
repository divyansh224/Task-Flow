import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 1, maxlength: 160 },
  description: { type: String, trim: true, maxlength: 5000, default: '' },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending', index: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium', index: true },
  dueDate: { type: Date, default: null },
  tags: { type: [String], default: [], validate: { validator: (tags) => tags.length <= 20 && tags.every((tag) => tag.length <= 40), message: 'Tags must be at most 40 characters each and no more than 20 tags.' } },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true, versionKey: false });

taskSchema.index({ owner: 1, createdAt: -1 });
taskSchema.index({ owner: 1, status: 1, priority: 1 });
taskSchema.index({ owner: 1, dueDate: 1 });
taskSchema.index({ title: 'text', description: 'text' });
export default mongoose.model('Task', taskSchema);
