import express from "express";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db.js";
import User from "./config/user.js";
import mongoose from "mongoose";
import { seedUsers } from "./config/seed.js";
import bcrypt from "bcryptjs";
const app = express();
app.use(express.json());
const __dirname = path.resolve();
dotenv.config();
app.use(express.urlencoded({ extended: true }));
import cors from "cors";
app.use(cors()); 

// MongoDB URI from environment variables
const mongoURI = process.env.MONGO_URI;
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB Connected");
    seedUsers();
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB:", err);
  });


// Serve static files
app.use(
  "/C-R-US/public",
  express.static(path.join(__dirname, "../../C-R-US/public"))
);
app.use(express.static(path.join(__dirname, "../frontend/")));


// Serve the index page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});


// Login route to authenticate users
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Log before searching for user
    console.log("Checking user login for email:", email);

    // Find user by email
    const user = await User.findOne({ email });
    console.log("User found:", user); 

    if (!user) {
      return res.json({
        success: false,
        message: "Incorrect email or password.",
      });
    }

    // Debugging: Log before comparing password
    console.log("Stored hash:", user.password); // Print the hash stored in DB
    console.log("Entered password:", password); // Print the entered password

    // Compare entered password with stored hash using bcrypt
    console.log("Starting bcrypt comparison...");
    const isMatch = await bcrypt.compare(password, user.password);

    // Debugging: Print bcrypt internal process
    console.log("bcrypt.compare process: ");
    console.log("Password provided:", password);
    console.log("Stored hash:", user.password);
    console.log("Comparison result:", isMatch);

    if (!isMatch) {
      return res.json({ success: false, message: "Incorrect password." });
    }

    // If password matches, return success and user role
    return res.json({ success: true, role: user.role });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


//User create account route 
app.post("/userCreateAccount", async (req, res) => {
  console.log("Received data:", req.body);
  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: "Passwords do not match." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists." });
    }

    const newUser = new User({
      email, password, role: "user" // Default role for new users 
    });

    await newUser.save();
    res.json({ success: true, message: "User created successfully." });

  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ success: false, message: "An error occurred." });
  }
});



// Redirect route based on role
app.post("/redirect", (req, res) => {
  const { role } = req.body;

  switch (role) {
    case "employee":
      return res.json({ redirectUrl: "/EmployeeViewPage.html" });
    case "admin":
      return res.json({ redirectUrl: "/adminViewPage.html" });
    case "user":
      return res.json({ redirectUrl: "/userHP.html" });
    default:
      return res.json({ redirectUrl: "/index.html" });
  }
});

// START OF: SCHEDULING DB

// MongoDB Schema and Model for Scheduling
const schedulingSchema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, required: true },
  service: { type: String, required: true },
  comments: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Scheduling = mongoose.model("Scheduling", schedulingSchema);

// API endpoint to fetch events
app.get("/api/Scheduling", async (req, res) => {
  try {
    const events = await Scheduling.find({});
    console.log("Fetched events from MongoDB:", events); // Log the fetched data
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// END OF: SCHEDULING DB


// Example API route
app.get("/products", (req, res) => {
  res.send("This is the products route");
});


// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
