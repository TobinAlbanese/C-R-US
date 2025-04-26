import bcrypt from "bcryptjs";
import mongoose from "mongoose";
console.log('User.js loaded');


const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
});



//matching password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
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

  if (!this.password.startsWith("$2a$")) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      console.error("Error hashing password:", error);
      return next(error);
    }
  }

  next();
});


const User = mongoose.model("User", userSchema);
export default User;
