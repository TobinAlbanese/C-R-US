import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, required: true },
  service: { type: String, required: true },
  comments: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

taskSchema.index({ date: 1, time: 1, service: 1, user: 1}, { unique: true });

const EmployeeTask = mongoose.model('EmployeeTasks', taskSchema, 'EmployeeTasks');
export { EmployeeTask };  // export the model
