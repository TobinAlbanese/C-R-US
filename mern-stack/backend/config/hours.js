import mongoose from "mongoose";

const LogHoursSchema = new mongoose.Schema({
  date: { type: String, required: true },
  startTime: { type: String},
  endTime: { type: String},
  totalHours: { type: String},
  comments: { type: String },
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
});

const LoggedHours = mongoose.model('LoggedHours', LogHoursSchema, 'LoggedHours');

export { Timesheet };