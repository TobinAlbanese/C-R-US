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
import { EmployeeTask } from "./config/employeeTasks.js";
import { PastApps } from "./config/PastApps.js";
import { LoggedHours } from "./config/hours.js";
import { ApprovedHours } from "./config/ApprovedHours.js";
import { timeOffEmployee } from "./config/timeOff.js"; 

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

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// TimeOffEmployee API for handling new Employee time off requests
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
//timeOffEmployee handles time off requests made by employees, by taking data frome timeOffEmployee.js and putting into the db
//uses timeOffEmployee import
import { error, log } from "console";
app.post("/timeOffEmployee", async (req, res) => {

  const { Employee, timeOffType, timeOffComments, timeOffDate, timeOffStartTime, timeOffEndTime } = req.body;

  //Validate that necessary fields were submitted
  if (!timeOffType || !timeOffDate || !timeOffStartTime || !timeOffEndTime) {
    return res.status(400).json({ success: false, message: "All fields except comments are required"});
  }


  //Get userId from req.session and put the id value in for Employee
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: "User not logged in" });
  }

  //Insert the data gotten from the time off submition and save to database
  try {
    const newTimeOffEmployee = await timeOffEmployee.insertOne({
      Employee: userId.id,
      timeOffType,
      timeOffComments,
      timeOffDate,
      timeOffStartTime,
      timeOffEndTime,
    });
    
    console.log(Employee);
    await newTimeOffEmployee.save();

    res.json({ success: true, message: "User created successfully." });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ success: false, message: "An error occurred." });
  }
});

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Assign-Time-OFF API for fetching data from TimeOffEmployee into our admin page
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

app.get("/api/assign-time-off", async (req, res) => {
  try {
    const timeOffs = await timeOffEmployee.find();   

    const tasksWithUsersTime = timeOffs.map(timeOff => {
      return {
        Employee: timeOff._id.toString(),
        timeOffType: timeOff.timeOffType,
        timeOffComments: timeOff.timeOffComments ? timeOff.timeOffComments.toString() : null,
        timeOffDate: timeOff.timeOffDate, 
        timeOffStartTime: timeOff.timeOffStartTime, 
        timeOffEndTime: timeOff.timeOffEndTime,
        _id: timeOff._id
      };
    });
    console.log(tasksWithUsersTime);
    res.json({ success: true, timeOffs: tasksWithUsersTime});
  } catch (err) {
    console.error("Error fetching timeOffs:", err);
    res.json({ success: false, message: "Error fetching timeOffs" });
  }
});

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Delete-Time-OFF API for deleting time offs from our admin page Manage Time Offs
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

app.post("/api/delete-timeOff", async (req, res) => {
  try {
    const { TimeOffs } = req.body;
    console.log("Received time Off ID to delete:", TimeOffs);
    if (!TimeOffs) {
      return res.status(400).json({ success: false, message: "Time Off ID is required." });
    }
    const deletedTimeOff = await timeOffEmployee.deleteMany({_id: { $in: TimeOffs}});
    if (!deletedTimeOff) {
      return res.status(404).json({ success: false, message: "TimeOff not found." });
    }
    console.log("Approved TimeOff:", deletedTimeOff);
    res.status(200).json({ success: true, message: "TimeOff approved successfully." }); 
  } catch (error) {
    console.error("Error approving TimeOff:", error);
    res.status(500).json({ success: false, message: "Failed to approve TimeOff." });
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
      id: user._id, // This should set the user ID
      email: user.email,
      role: user.role,
    };

    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
        return res.status(500).json({ success: false, message: "Failed to save session." });
      }
      return res.json({ success: true, role: user.role });
    });
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


/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// multi-function API for assigning and deleting tasks
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
app.post('/api/assignTasks', async (req, res) => {
  const tasksToSubmit = req.body;

  try {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User is not logged in." });
    }

    for (const task of tasksToSubmit) {
      console.log("Processing task:", task);
      const { type, assignTo, assignedBy, createdOn } = task;
      const taskDate = createdOn.split(" ")[0];
      const taskTime = createdOn.split(" ").slice(1).join(" ");

      // Check if a task with the same date, time, service, and user already exists
      const existingTask = await EmployeeTask.findOne({
        date: taskDate,
        time: taskTime,
        service: type,
        user: assignTo,
        admin: assignedBy,
      });

      if (existingTask) {
        console.warn(`Duplicate task found for: ${type} on ${taskDate} at ${taskTime}`);
        continue; // Skip this task and move to the next one
      }

      const assignedUser = await User.findById(assignTo).select("email firstName lastName");
      if (!assignedUser) {
        throw new Error(`User not found for ID: ${assignTo}`);
      }

      const newEmployeeTask = new EmployeeTask({
        date: taskDate,
        time: taskTime,
        service: type,
        commments: '',
        assignedBy: assignedBy,
        user: assignTo,
        email: assignedUser.email,
        firstName: assignedUser.firstName,
        lastName: assignedUser.lastName,
        admin: admin,
      });
      await newEmployeeTask.save();

      const existingApp = await Appointment.findOne({
        date: taskDate,
        time: taskTime,
        service: type,
      });
      if (existingApp) {
        const pastApps = new PastApps({
          date: existingApp.date,
          time: existingApp.time,
          service: existingApp.service,
          comments: existingApp.comments || '',
          status: existingApp.status,
          movedAt: new Date(),
          email: assignedUser.email,
          firstName: assignedUser.firstName,
          lastName: assignedUser.lastName,
        });
        await pastApps.save();
        await Appointment.deleteOne({ _id: existingApp._id });
      } else {
        console.warn(`No matching appointment found for: ${type} on ${taskDate} at ${taskTime}`);
      }
    }

    res.status(200).json({ success: true, message: "Tasks assigned successfully." });
  } catch (error) {
    console.error("Error assigning tasks:", error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Duplicate task assignment." });
    }
    res.status(500).json({ success: false, message: "An error occurred while assigning tasks." });
  }
});


/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Assign-Tasks API for fetching data from Scheduling/Users into our admin page
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Assign-Tasks API for fetching data from Scheduling/Users into our admin page
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
app.get("/api/assign-tasks", async (req, res) => {
  try {
    const tasks = await Appointment.find();  
    const users = await User.find();  
    const checkouts = await Check.find();

    console.log("Checkouts:", checkouts);

    
    const tasksWithUsers = tasks.map(task => {
      const fullDateTime = new Date(`${task.date} ${task.time}`);
      console.log("Full DateTime:", fullDateTime); 
      const relatedUser = checkouts.find(check => {
          const checkDateTime = new Date(check.appDate);
          return checkDateTime.getTime() === fullDateTime.getTime();
      });
      return {
          _id: task._id.toString(),
          type: task.service,
          assignTo: task.user ? task.user.toString() : null,
          assignedBy: task.assignedBy ? task.assignedBy.toString() : null,
          schedule: {
              date: task.date,
              time: task.time,
          },
          shipInfo: relatedUser && relatedUser.shipInfo ? {
              firstName: relatedUser.shipInfo.firstName,
              lastName: relatedUser.shipInfo.lastName,
              email: relatedUser.shipInfo.email,
          } : null,
      };
  });


    res.json({ success: true, tasks: tasksWithUsers, users: users });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.json({ success: false, message: "Error fetching tasks" });
  }
});

app.post("/api/assign-tasks", async (req, res) => {
  try {

    console.log("Received request body:", req.body);


    const { user, admin, service, date, time, comments, shipInfo } = req.body;
    console.log("Parsed data:", { user, admin, service, date, time, comments, shipInfo });
    const newTask = new Appointment({
      user,
      admin,
      service,
      date,
      time,
      comments,
      shipInfo
    });
    await newTask.save();
    res.status(200).json({ success: true, message: "Task assigned successfully." });
  } catch (error) {
    console.error("Error assigning task:", error);
    res.status(500).json({ success: false, message: "Failed to assign task." });
  }
});

app.post("/api/delete-task", async (req, res) => {
  try {
    const { taskIds } = req.body;
    console.log("Received task ID to delete:", taskIds);
    if (!taskIds) {
      return res.status(400).json({ success: false, message: "Task ID is required." });
    }
    const deletedTask = await Appointment.deleteMany({_id: { $in: taskIds}});
    if (!deletedTask) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }
    console.log("Deleted task:", deletedTask);
    res.status(200).json({ success: true, message: "Task deleted successfully." }); 
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ success: false, message: "Failed to delete task." });
  }
});

app.get("/api/manage-appointments", async (req, res) => {
  try {
    const tasks = await EmployeeTask.find();
    const users = await User.find();  
    const checkouts = await Check.find();

    console.log("Checkouts:", checkouts);

    const tasksWithUsers = tasks.map(task => {
      const relatedUser = checkouts.find(check => {
        const taskDateTime = new Date(`${task.date} ${task.time}`);
        const checkDateTime = new Date(check.appDate);
        return taskDateTime.getTime() === checkDateTime.getTime();
      });
    
      const assignedUser = users.find(u => u._id.toString() === (task.user?.toString()));
      const assignedByUser = users.find(u => u._id.toString() === (task.assignedBy?.toString()));  
      
      return {
        _id: task._id.toString(),
        type: task.service,
        assignTo: task.user ? task.user.toString() : null,
        assignedUserName: assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : null,
        assignedBy: assignedByUser ? `${assignedByUser.firstName} ${assignedByUser.lastName}` : null,  
        schedule: {
          date: task.date,
          time: task.time,
        },
        shipInfo: relatedUser?.shipInfo ? {
          firstName: relatedUser.shipInfo.firstName,
          lastName: relatedUser.shipInfo.lastName,
          email: relatedUser.shipInfo.email,
        } : null,
      };
    });

    res.json({ success: true, tasks: tasksWithUsers, users: users });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.json({ success: false, message: "Error fetching tasks" });
  }
});

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Fetch previous apps and upcoming apps API
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
app.get('/api/appsPast', async (req, res) => {
  try {
    const now = new Date();
    const pastAppointments = await PastApps.find({ date: { $lt: now } }).sort({ date: -1 });
    console.log('Past appointments:', pastAppointments);  
    res.json({ past: pastAppointments });
  } catch (error) {
      console.error('Error fetching past appointments:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/appsUpcoming', async (req, res) => {
  try {
    const upcomingAppointments = await PastApps.find({ date: { $gte: new Date() } });
    console.log('Upcoming appointments:', upcomingAppointments);  
    res.json({ upcoming: upcomingAppointments });
  } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});




app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const deleted = await PastApps.findByIdAndDelete(appointmentId);

    if (!deleted) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ success: true, message: 'Appointment canceled' });
  } catch (error) {
    console.error('Error canceling appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
 // Fetch Employee Tasks API
 /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
 app.get("/api/EmployeeTask", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Fetch tasks from the 'EmployeeTasks' collection
    // const tasks = await EmployeeTask.find();
    const tasks = await EmployeeTask.find({ user: req.session.userId.id });

    // Return the tasks as JSON
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching employee tasks:", error);
    res.status(500).json({ success: false, message: "Failed to fetch employee tasks." });
  }
});





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































/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Log Hours
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
app.post('/api/log-hours', async (req, res) => {
  const logs = req.body;
  console.log("Received log data:", logs); // Debugging log

  if (!Array.isArray(logs) || logs.length === 0) {
    return res.status(400).json({ error: 'No log entries received.' });
  }

  const userId = req.session.userId?.id;
  console.log("Session userId:", userId); // Debugging log

  if (!userId) {
    return res.status(401).json({ success: false, message: "User not logged in." });
  }

  try {
    const user = await User.findById(userId).select("firstName lastName email");
    console.log("Fetched user:", user); // Debugging log

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const savedLogs = await Promise.all(
      logs.map(async ({ date, startTime, endTime, totalHours, comments }) => {
        if (!date || !startTime || !endTime || !totalHours) {
          throw new Error('Missing required fields.');
        }

        const newLog = new LoggedHours({
          user: userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          date,
          startTime,
          endTime,
          totalHours,
          comments,
        });

        return await newLog.save();
      })
    );

    console.log("Hours saved:", savedLogs.length);
    res.status(200).json({ success: true, message: "Hours successfully logged." });
  } catch (error) {
    console.error("Error logging hours:", error); // Log the error
    res.status(500).json({ success: false, message: "Failed to log hours." });
  }
});

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Fetch Logged Hours API
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
app.get("/api/log-hours", async (req, res) => {
  try {
    
    // Fetch hours from the 'LoggedHours' collection
    const hours = await LoggedHours.find();

    // Return the tasks as JSON
    res.status(200).json(hours);
  } catch (error) {
    console.error("Error fetching logged hours:", error);
    res.status(500).json({ success: false, message: "Failed to fetch logged hours." });
  }
});


/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Post Approved Hours API 
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

app.post('/api/approve-hours', async (req, res) => {
  const approvedHours = req.body;

  try {
    // Save approved hours to the ApprovedHours collection
    const savedApprovedHours = await Promise.all(
      approvedHours.map(async (hour) => {
        // Fetch the corresponding LoggedHours entry to get the email
        const loggedHour = await LoggedHours.findById(hour.id).select("email");
        if (!loggedHour) {
          throw new Error(`LoggedHours entry not found for ID: ${hour.id}`);
        }

        const newApprovedHour = new ApprovedHours({
          firstName: hour.firstName,
          lastName: hour.lastName,
          email: loggedHour.email, // Include the email field
          timeLogged: hour.timeLogged,
          calculatedPay: hour.calculatedPay,
          originalId: hour.id, // Save the original ID for reference
        });

        return await newApprovedHour.save();
      })
    );

    // Delete the approved hours from the LoggedHours collection
    const idsToDelete = approvedHours.map((hour) => hour.id); // Collect IDs of approved hours
    await LoggedHours.deleteMany({ _id: { $in: idsToDelete } });

    res.status(200).json({
      success: true,
      message: "Hours approved and removed from LoggedHours.",
      data: savedApprovedHours,
    });
  } catch (error) {
    console.error("Error approving hours:", error);
    res.status(500).json({ success: false, message: "Failed to approve hours." });
  }
});

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// Get Approved Hours API 
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

app.get('/api/approvedHours', async (req, res) => {
  try {
    // Get the logged-in user's email from the session
    const userEmail = req.session.userId?.email;
    console.log("Fetching approved hours for email:", userEmail); // Debugging log

    if (!userEmail) {
      return res.status(401).json({ success: false, message: "User not logged in." });
    }

    // Fetch approved hours for the logged-in user's email
    const approvedHours = await ApprovedHours.find({ email: userEmail });
    res.status(200).json(approvedHours); // Send the filtered data as JSON
  } catch (error) {
    console.error('Error fetching approved hours:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch approved hours.' });
  }
});