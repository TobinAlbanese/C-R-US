import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
});

// Method to match the password
userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    return isMatch;  // Return the result directly
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;  // Return false if an error occurs
  }
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next(); // Skip hashing if the password hasn't been modified
  }

  // Check if the password is already hashed (prevents double hashing)
  if (!this.password.startsWith("$2a$")) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      console.error("Error hashing password:", error);
      return next(error); // Pass error to next middleware if hashing fails
    }
  }

  next(); // Proceed with saving the user
});

const User = mongoose.model("User", userSchema);
export default User;
