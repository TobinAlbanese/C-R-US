import express from "express";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db.js";
import User from "./config/user.js";
console.log(User);
import mongoose from "mongoose";
import { seedUsers } from "./config/seed.js";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectMongo from 'connect-mongo';
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
async function startServer() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB Connected");

    await mongoose.connection.collection("sessions").deleteMany({});

    await seedUsers();

  } catch (err) {
    console.error("Error connecting to MongoDB or starting server:", err);
  }
}

startServer();


  const MongoStore = connectMongo.create({
    mongoUrl: mongoURI, 
    collectionName: "sessions" 
  });




  app.use(
    session({
      secret: process.env.SESSION_SECRET || "yourSecretKey",
      resave: false,
      saveUninitialized: true,
      store: MongoStore,
      cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 60000000,
      },
    })
  );
  





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

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "Incorrect email or password.",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Incorrect password." });
    }

    req.session.userId = user._id;
    return res.json({ success: true, role: user.role });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});





app.post('/logout', (req, res) => {
  req.session.userId = null;
  req.session.role = null;

  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ success: false, message: 'Logout failed.' });
    }
    res.clearCookie('connect.sid', {path: '/' });
    res.json({ success: true });
  });
});




app.get('/getBookedTimes', async (req, res) => {
  const appointments = await Appointment.find({
    status: { $in: ["pending", "confirmed"] }, 
    date: req.query.date 
  });
  res.json({ bookedTimes: appointments.map(a => a.time) });
});





//User create account route 
app.post("/userCreateAccount", async (req, res) => {
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
      email, password, role: "user", firstName: user.firstName, lastName: user.lastName, // Default role for new users 
    });

    await newUser.save();
    res.json({ success: true, message: "User created successfully." });

  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ success: false, message: "An error occurred." });
  }
});



import { Appointment } from "./config/app.js"; 
app.post('/appointment', async (req, res) => {
  const { date, time, service, comment } = req.body;

  if (!date || !time || !service) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "User not logged in" });
    }

    const existingApp = await Appointment.findOne({
      date,
      time,
      service,
      comments: comment,
      status: { $ne: "completed" },
      user: userId,
    });

    if (existingApp) {
      return res.status(400).json({ error: 'You already booked this appointment.' });
    }

    const newApp = new Appointment({
      date,
      time,
      service,
      comments: comment,
      user: userId,
      status: 'pending',
    });

    const savedApp = await newApp.save();
    res.status(200).json({ success: true, appointment: savedApp });

  } catch (err) {
    console.error("Failed to save appointment:", err);
    return res.status(500).json({ error: 'Failed to save appointment' });
  }
});




import { Check } from "./config/check.js";
app.post('/api/checkout', async (req, res) => {
  console.log("Full request body:", req.body);
  
  try {
    const { shipInfo, payInfo, appDate } = req.body;
    console.log("Extracted data:", { shipInfo, payInfo, appDate });

    const newCheck = new Check({
      shipInfo,
      payInfo,
      appDate,
    });

    // Validate before saving
    await newCheck.validate(); 
    
    const savedCheck = await newCheck.save();
    console.log("Saved document:", savedCheck);

    res.status(200).json({ 
      success: true, 
      message: "Checkout saved successfully.",
      data: savedCheck 
    });
  } catch (error) {
    console.error("Full error:", error);
    
    if (error.name === 'ValidationError') {
      console.error("Validation errors:", error.errors);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || "Server error while saving checkout.",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});



app.post('/api/confirm-appointment', async (req, res) => {
  try {
    const { appointmentId } = req.body;
    await Appointment.updateOne(
      { _id: appointmentId },
      { $set: { status: "confirmed" } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Confirmation failed" });
  }
});






const Scheduling = mongoose.model("Scheduling");
app.get("/api/assign-tasks", async (req, res) => {
  try {
    const tasks = await Scheduling.find();  
    const users = await User.find();  
    
    const tasksWithUsers = tasks.map(task => {
      return {
        type: task.service,
        assignTo: task.user ? task.user.toString() : null,
        assignedBy: task.assignedBy ? task.assignedBy.toString() : null, 
        schedule:{
          date: task.date,
          time: task.time,
        }
      };
    });

    res.json({ success: true, tasks: tasksWithUsers, users: users });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.json({ success: false, message: "Error fetching tasks" });
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










// Example API route
app.get("/products", (req, res) => {
  res.send("This is the products route");
});









// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
