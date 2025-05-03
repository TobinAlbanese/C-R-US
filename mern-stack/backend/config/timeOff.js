import mongoose from "mongoose";
console.log('timeOff.js loaded');


const timeOffSchema = new mongoose.Schema({
  Employee: { type: String, required: true},
  timeOffType: { type: String, required: true},
  timeOffComments: { type: String},
  timeOffDate: { type: Date, required: true},
  timeOffStartTime: { type: String, required: true},
  timeOffEndTime: { type: String, required: true},
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
});


const timeOffEmployee = mongoose.model("TimeOffEmployee", timeOffSchema, "TimeOffEmployee");
export { timeOffEmployee };