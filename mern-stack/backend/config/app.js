import mongoose from "mongoose";

const appSchema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, required: true },
  service: { type: String, required: true },
  comments: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to the User who created the appointment
});

appSchema.index({ date: 1, time: 1, service: 1 }, { unique: true });  // Enforce unique date, time, and service combination
const Appointment = mongoose.model("Scheduling", appSchema, "Scheduling");

export { Appointment };