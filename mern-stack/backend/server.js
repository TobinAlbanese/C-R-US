//Core
import path from "path"; 
import dotenv from "dotenv";
//thirdParty
import express from "express"; 
import mongoose from "mongoose"; 
import bcrypt from "bcryptjs"; 
import session from "express-session"; 
import connectMongo from 'connect-mongo'; 
import nodemailer from "nodemailer"; 
import cors from "cors"; 
// Custom modules
import { connectDB } from "./config/db.js"; 
import User from "./config/user.js"; 
import { seedUsers } from "./config/seed.js"; 
import { Check } from "./config/check.js"; 
import { Appointment } from "./config/app.js"; 
//Express
const app = express();
//Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cors()); 
//path for directory solution
const __dirname = path.resolve();
//loads .env file
dotenv.config();
console.log(User); 

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Mongo API
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
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
  
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Public Route API
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
app.use(
  "/C-R-US/public",
  express.static(path.join(__dirname, "../../C-R-US/public"))
);

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Direction Path API
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
app.use(express.static(path.join(__dirname, "../frontend/")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Create Account API
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
app.post("/userCreateAccount", async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName } = req.body;

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
      email, password, role: "user", firstName, lastName, 
    });

    await newUser.save();
    res.json({ success: true, message: "User created successfully." });

  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ success: false, message: "An error occurred." });
  }
});

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Login API
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
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

    req.session.userId = {
      id: user._id,
      email: user.email,
      role: user.role,
    };
    return res.json({ success: true, role: user.role });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Logout API
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
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


/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Appointment API
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
app.post('/api/appointment', async (req, res) => {
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
      comments: comment || '',
      user: userId,
      status: 'pending',
    });

    const savedApp = await newApp.save();
    console.log("Appointment saved:", savedApp);
    res.status(200).json({ success: true, appointment: savedApp });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: 'Failed to save appointment' });
  }
});

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Checkout API
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
app.post('/api/checkout', async (req, res) => {
  console.log("Full request body:", req.body);

  try {
    const { checkoutData} = req.body; 
    const { shipInfo, payInfo, appDate, service, price, appointmentId } = checkoutData;

    console.log("Extracted data:", { shipInfo, payInfo, appDate, checkoutData });

    const newCheck = new Check({
      shipInfo,
      payInfo,
      appDate,
      service,
      price,
      appointmentId,
      status: "confirmed"
    });

    await newCheck.validate(); 

    const savedCheck = await newCheck.save();
    console.log("Saved document:", savedCheck);

    const userId = req.session.userId; 
    if (!userId || !userId.id) {
      return res.status(401).json({ error: "User not logged in" });
    }
    
    const user = await User.findById(userId.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: shipInfo.email,
      subject: 'Appointment Confirmation',
      html: `
        <h1>Thank you for your appointment!</h1>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Time:</strong> ${appDate}</p>
        <p><strong>Price:</strong> $${price}</p>
        <p>We look forward to seeing you!</p>
      `
    };

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail(mailOptions);
    console.log("Confirmation email sent successfully.");

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

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Resend Confirmation Email API
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
app.post('/api/resend-confirmation', async (req, res) => {
  const { shipInfo, appointmentData } = req.body;

  if (!shipInfo || !appointmentData) {
    return res.status(400).json({ success: false, message: "Missing required data." });
  }

  const { email } = shipInfo;
  const { service, date, time, price } = appointmentData;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Appointment Confirmation - Resent',
    html: `
      <h1>Your Appointment Confirmation</h1>
      <p><strong>Service:</strong> ${service}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p><strong>Price:</strong> $${price}</p>
      <p>This is a copy of your original confirmation email.</p>
    `
  };

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    await transporter.sendMail(mailOptions);
    console.log("Resent confirmation email to", email);
    res.status(200).json({ success: true, message: "Confirmation email resent." });
  } catch (err) {
    console.error("Failed to resend confirmation:", err);
    res.status(500).json({ success: false, message: "Email sending failed." });
  }
});

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Booked-Times API for our Appointment Page
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
app.get('/api/booked-times', async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ success: false, message: "Date is required." });
  }

  try {
    const bookings = await Appointment.find({ date }); 
    const bookedTimes = bookings.map(booking => booking.time); 
    res.json({ bookedTimes });
  } catch (error) {
    console.error("Error fetching booked times:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Assign-Tasks API for fetching data from Scheduling/Users into our admin page
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
app.get("/api/assign-tasks", async (req, res) => {
  try {
    const tasks = await Appointment.find();  
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

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Redirection API for URL
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
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

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Products API For Mongo
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
app.get("/products", (req, res) => {
  res.send("This is the products route");
});

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Server Run API
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});