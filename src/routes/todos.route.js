import { Router } from "express";
import { createTodo, getAllTodos } from "../controllers/todos.js";

const tododsRoute = Router();

tododsRoute.get("/", getAllTodos);

tododsRoute.post("/", createTodo);

export { tododsRoute };
