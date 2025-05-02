import mongoose from "mongoose";


const LoggedHoursSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  totalHours: { type: Number, required: true },
  comments: { type: String },
}, { collection: 'LoggedHours' }); // Explicitly set the collection name


const LoggedHours = mongoose.model('LoggedHours', LoggedHoursSchema);
export { LoggedHours };