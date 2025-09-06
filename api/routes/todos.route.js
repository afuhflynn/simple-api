import { Router } from "express";
import {
  clearComplete,
  createTodo,
  deleteTodo,
  getAllTodos,
  markComplete,
  updateTodo,
} from "../controllers/todos.js";
import { verifyToken } from "../middleware/verify-token.js";

const tododsRoute = Router();

tododsRoute.get("/", verifyToken, getAllTodos);

tododsRoute.post("/", verifyToken, createTodo);

tododsRoute.put("/:id", verifyToken, updateTodo);

tododsRoute.put("/:id/markcomplete", verifyToken, markComplete);
tododsRoute.delete("/clearcomplete", verifyToken, clearComplete);

tododsRoute.delete("/:id", verifyToken, deleteTodo);

export { tododsRoute };
