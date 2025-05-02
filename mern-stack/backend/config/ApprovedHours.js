import mongoose from "mongoose";

const ApprovedHoursSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    timeLogged: { type: String, required: true },
    calculatedPay: { type: String, required: true },
    originalId: { type: mongoose.Schema.Types.ObjectId, ref: 'LoggedHours', required: true } // Reference to the original logged hour
}, { collection: 'ApprovedHours' }); // Explicitly set the collection name

const ApprovedHours = mongoose.model('ApprovedHours', ApprovedHoursSchema);
export { ApprovedHours };