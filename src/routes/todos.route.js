import { Router } from "express";
import { getAllTodos } from "../controllers/todos.js";

const tododsRoute = Router();

tododsRoute.get("/", getAllTodos);

export { tododsRoute };
