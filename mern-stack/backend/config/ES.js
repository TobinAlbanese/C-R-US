import mongoose from 'mongoose';

const schedulingSchema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, required: true },
  service: { type: String, required: true },
  comments: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

schedulingSchema.index({ date: 1, time: 1, service: 1, user: 1}, { unique: true });

const EmpScheduling = mongoose.model('EmployeeScheduling', schedulingSchema);
export { EmpScheduling };  // export the model
