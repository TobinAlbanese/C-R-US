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

<<<<<<< HEAD
const LoggedHours = mongoose.model('LoggedHours', LogHoursSchema, 'LoggedHours');
<<<<<<< HEAD
export { LoggedHours };
=======
<<<<<<< HEAD
=======
>>>>>>> 68f0b83161ae7c5cf56f2234136c2d221496ce6a

const LoggedHours = mongoose.model('LoggedHours', LoggedHoursSchema);
export { LoggedHours };
<<<<<<< HEAD
>>>>>>> 7c3f26f9bc661c08aaba1b019b38cc98038a29f7
>>>>>>> e75eea683fdc3e4f52d3adc5948039cd25134009
=======
>>>>>>> 68f0b83161ae7c5cf56f2234136c2d221496ce6a
