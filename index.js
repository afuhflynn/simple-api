import express from "express";
import { config } from "dotenv"; // This package must be installed and an env file created in the root dir

config(); // Initialize env variables

const PORT = process.env.PORT || 3000;
const app = express();

// Root route
app.get("/", (req, res) => {
  res.status(201).json({ message: "Hello, world Nodejs-Expressjs" });
});

// About us route
app.get("/about", (req, res) => {
  res.status(201).json({ message: "About us page" });
});

// Respond to 404 requests (Page not found)
app.get("*", (req, res) => {
  res.status(404).json({ message: "Oops, Page not found!" });
});

// Run the server
// app.listen(portNumber, callback() =>{//Block of code to run when server starts})
app.listen(PORT, () => {
  console.log("Server started on port: ", PORT);
});
