import mongoose from "mongoose";

const PastAppsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },  
  date: String,
    time: String,
    service: String,
    comments: String,
    status: String,
    movedAt: {
      type: Date,
      default: Date.now,
    },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
  });
  
  const PastApps = mongoose.model("PastApps", PastAppsSchema, "PastApps");

  export { PastApps };