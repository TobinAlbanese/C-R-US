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
<<<<<<< HEAD
export { LoggedHours };
=======
<<<<<<< HEAD

export { Timesheet };
=======
export { LoggedHours };
>>>>>>> 7c3f26f9bc661c08aaba1b019b38cc98038a29f7
>>>>>>> e75eea683fdc3e4f52d3adc5948039cd25134009
