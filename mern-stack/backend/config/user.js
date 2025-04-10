import bcrypt from "bcryptjs";
import mongoose from "mongoose";
console.log('User.js loaded');


const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
});


//matching password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    console.log("Entered password:", enteredPassword);
    console.log("Stored hash:", this.password);
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log("bcrypt comparison result:", isMatch);
    return isMatch;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
};


//skips hashing if password has no changes
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  console.log("Before hashing, password:", this.password); // Log the password before hashing
  if (!this.password.startsWith("$2a$")) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      console.log("Hashed password:", this.password); // Log the hashed password
    } catch (error) {
      console.error("Error hashing password:", error);
      return next(error);
    }
  }

  next();
});


const User = mongoose.model("User", userSchema);
export default User;
