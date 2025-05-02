import mongoose from "mongoose";

const LogHoursSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true },
    firstName: { type: String, required: true },
        lastName: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    totalHours: { type: String, required: true },
    comments: { type: String },
});

const LoggedHours = mongoose.model('LoggedHours', LogHoursSchema, 'LoggedHours');
export { LoggedHours };