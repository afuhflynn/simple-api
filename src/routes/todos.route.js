import { Router } from "express";
import {
  createTodo,
  deleteTodo,
  getAllTodos,
  markComplete,
  updateTodo,
} from "../controllers/todos.js";

const tododsRoute = Router();

tododsRoute.get("/", getAllTodos);

tododsRoute.post("/", createTodo);

tododsRoute.put("/:id", updateTodo);

tododsRoute.put("/:id/markcomplete", markComplete);

tododsRoute.delete("/:id", deleteTodo);

export { tododsRoute };
