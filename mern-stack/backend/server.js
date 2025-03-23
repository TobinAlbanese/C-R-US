import express from 'express';
import dotenv from "dotenv";
import { connectDB } from "./config/db.js"; 

const app = express(); {
app.get("/products", (req, res) => {
  res.send("This is the products route");
});
}

// Load environment variables
dotenv.config();
console.log(process.env.MONGO_URI);


// Connect to the database
connectDB();

// Root route
app.get("/", (req, res) => {
  res.send("Server is ready!");
});

// Start the server
app.listen(5001, () => {
  console.log('Server started at http://localhost:5001');
});
