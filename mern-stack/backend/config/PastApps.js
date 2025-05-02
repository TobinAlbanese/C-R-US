import mongoose from "mongoose";

const PastAppsSchema = new mongoose.Schema({
    date: String,
    time: String,
    service: String,
    comments: String,
    status: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    movedAt: {
      type: Date,
      default: Date.now,
    },
  });
  
  const PastApps = mongoose.model("PastApps", PastAppsSchema, "PastApps");

  export { PastApps };