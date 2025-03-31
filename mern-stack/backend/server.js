import express from "express";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db.js";  
import User from "./config/user.js"; 
import mongoose from "mongoose";
import { seedUsers } from "./config/seed.js";
import bcrypt from "bcryptjs";
const app = express();
const __dirname = path.resolve();

app.use(express.json());
dotenv.config();
//connectDB();

// MongoDB URI from environment variables
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB Connected');
    seedUsers(); // Optionally, seed your users if needed
  })
  .catch((err) => {
    console.log('Error connecting to MongoDB:', err);
  });

// Serve static files
app.use("/C-R-US/public", express.static(path.join(__dirname, "../../C-R-US/public")));
app.use(express.static(path.join(__dirname, "../frontend/")));

// Serve the index page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

// Login route to authenticate users
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Log before searching for user
    console.log("Checking user login for email:", email);

    // Find user by email
    const user = await User.findOne({ email });
    console.log("User found:", user);  // Debugging: check if user is fetched correctly

    if (!user) {
      return res.json({ success: false, message: "Incorrect email or password." });
    }

    // Debugging: Log before comparing password
    console.log("Stored hash:", user.password);  // Print the hash stored in DB
    console.log("Entered password:", password);  // Print the entered password

    // Compare entered password with stored hash using bcrypt
    console.log("Starting bcrypt comparison...");
    const isMatch = await bcrypt.compare(password, user.password);

    // Debugging: Print bcrypt internal process
    console.log("bcrypt.compare process: ");
    console.log("Password provided:", password);
    console.log("Stored hash:", user.password);
    console.log("Comparison result:", isMatch);  // Whether the passwords match or not

    if (!isMatch) {
      return res.json({ success: false, message: "Incorrect password." });
    }

    // If password matches, return success and user role
    return res.json({ success: true, role: user.role });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Redirect route based on role
app.post("/redirect", (req, res) => {
  const { role } = req.body;

  switch (role) {
    case "employee":
      return res.json({ redirectUrl: "/EmployeeViewPage.html" });
    case "admin":
      return res.json({ redirectUrl: "/Admin.html" });
    case "user":
      return res.json({ redirectUrl: "/index.html" });
    default:
      return res.json({ redirectUrl: "/index.html" });
  }
});

// Example API route
app.get("/products", (req, res) => {
  res.send("This is the products route");
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
