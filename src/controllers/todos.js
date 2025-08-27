import { randomUUID } from "crypto";
import { readData, writeData } from "../utils/index.js";

export async function getAllTodos(_, res) {
  try {
    const todos = await readData();
    if (!todos) {
      return res.status(404).json({ error: "Todos not found", success: false });
    }
    return res.status(200).json({ todos, success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An unexpected error occurred.", success: false });
  }
}

export async function createTodo(req, res) {
  let todo = await req.body;
  const id = randomUUID();
  todo = { ...todo, id };

  try {
    const todos = await readData();

    if (!todos) {
      return res.status(404).json({ error: "Todos not found", success: false });
    }

    // check if item already exists
    const foundTodo = todos.find(
      (item) => item.body.toLowerCase() === todo.body.toLowerCase()
    );

    if (foundTodo) {
      return res
        .status(409)
        .json({ error: "Todo body already exists.", success: false });
    }

    const result = await writeData([...todos, todo]);
    if (!result) {
      return res
        .status(500)
        .json({ error: "An unexpected error occurred.", success: false });
    }
    return res
      .status(201)
      .json({ todo, success: true, message: "Todo created successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An unexpected error occurred.", success: false });
  }
}

export async function updateTodo(req, res) {
  const todo = await req.body;
  const { id } = await req.params;

  try {
    const todos = await readData();

    if (!todos) {
      return res.status(404).json({ error: "Todos not found", success: false });
    }

    // check if item already exists
    const foundTodo = todos.find((item) => item.id === id);

    if (!foundTodo) {
      return res.status(404).json({ error: "Todo not found.", success: false });
    }

    const updatedTodo = { ...foundTodo, body: todo.body };
    const remainingTodos = todos.filter((item) => item.id !== id);
    const result = await writeData([...remainingTodos, updatedTodo]);
    if (!result) {
      return res
        .status(500)
        .json({ error: "An unexpected error occurred.", success: false });
    }
    return res
      .status(200)
      .json({ todo, success: true, message: "Todo updated successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An unexpected error occurred.", success: false });
  }
}

export async function deleteTodo(req, res) {
  const { id } = await req.params;

  try {
    const todos = await readData();

    if (!todos) {
      return res.status(404).json({ error: "Todos not found", success: false });
    }

    // check if item already exists
    const foundTodo = todos.find((item) => item.id === id);

    if (!foundTodo) {
      return res.status(404).json({ error: "Todo not found.", success: false });
    }
    const remainingTodos = todos.filter((item) => item.id !== id);
    const result = await writeData(remainingTodos);
    if (!result) {
      return res
        .status(500)
        .json({ error: "Todo not deleted.", success: false });
    }
    return res.status(200).json({
      todo: foundTodo,
      success: true,
      message: "Todo deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An unexpected error occurred.", success: false });
  }
}
