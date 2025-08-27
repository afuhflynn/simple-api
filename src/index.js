import express from "express";
import { config } from "dotenv"; // This package must be installed and an env file created in the root dir
import morgan from "morgan";
// import data from "./db/data.json";
import path from "path";
import { fileURLToPath } from "url";
import { tododsRoute } from "./routes/todos.route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config(); // Initialize env variables

const PORT = process.env.PORT || 3000;
const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));

// Root route
app.get("/", (req, res) => {
  res.status(201).json({
    message: "Hello, world Simple api project",
  });
});

app.use("/todos", tododsRoute);

// Respond to 404 requests (Page not found)
app.use((req, res) => {
  res.status(404).json({ message: "Oops, Page not found!", success: false });
});

// Run the server
// app.listen(portNumber, callback() =>{//Block of code to run when server starts})
app.listen(PORT, () => {
  console.log("Server started on port: ", PORT);
});
