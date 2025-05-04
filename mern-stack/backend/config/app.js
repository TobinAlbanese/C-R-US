import mongoose from "mongoose";

const appSchema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, required: true },
  service: { type: String, required: true },
  comments: { type: String },
  status: { type: String, default: 'pending' },  
  shipInfo: {
    firstName: String,
    lastName: String 
  },
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
});

appSchema.index({ date: 1, time: 1, service: 1 }, { unique: true });  
const Appointment = mongoose.model("Scheduling", appSchema, "Scheduling");

export { Appointment };