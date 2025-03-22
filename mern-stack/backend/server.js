import express from 'express';
import dotenv from "dotenv";
import { connectDB } from "./config/db.js"; 

const app = express();

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

// Root route
app.get("/", (req, res) => {
  res.send("Server is ready!");
});

// Products route
app.get("/products", (req, res) => {
  res.send("This is the products route");
});

// Start the server
app.listen(5001, () => {
  console.log('Server started at http://localhost:5001');
});
