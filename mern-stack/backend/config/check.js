import mongoose from "mongoose";

const checkSchema = new mongoose.Schema({
  shipInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true }
  },
  payInfo: {
    cardName: { type: String, required: true },
    cardNumber: { type: String, required: true },
    expDate: { type: String, required: true },
    cvv: { type: String, required: true }
  },
  appDate: {
    type: String, 
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: "pending",
  },
});

const Check = mongoose.model("Checkout", checkSchema, "Checkout");

export { Check };