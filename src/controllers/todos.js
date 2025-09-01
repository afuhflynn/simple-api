import { prisma } from "../lib/prisma.js";

export async function getAllTodos(req, res) {
  try {
    const todos = await prisma.todo.findMany({
      where: {
        userId: req.id,
      },
    });
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
  const { body, complete } = await req.body;

  if (!body || complete === undefined) {
    return res
      .status(400)
      .json({ error: "All fields are required", success: false });
  }

  try {
    // check if item already exists
    const foundTodo = await prisma.todo.findFirst({
      where: {
        body,
      },
    });

    if (foundTodo) {
      return res
        .status(409)
        .json({ error: "Todo body already exists.", success: false });
    }

    const todo = await prisma.todo.create({
      data: {
        body,
        complete,
        userId: req.id,
      },
    });
    if (!todo) {
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
  const { body } = await req.body;
  const { id } = await req.params;

  if (!body) {
    return res
      .status(400)
      .json({ error: "All fields are required", success: false });
  }

  try {
    // check if item already exists
    const todoExists = await prisma.todo.findFirst({
      where: {
        id,
        body,
        userId: req.id,
      },
    });

    if (todoExists && id !== todoExists.id) {
      return res
        .status(409)
        .json({ error: "Todo body already exists.", success: false });
    }

    const todo = await prisma.todo.update({
      where: { id, userId: req.id },
      data: {
        body,
      },
    });

    if (!todo) {
      return res
        .status(500)
        .json({ error: "An unexpected error occurred.", success: false });
    }
    return res.status(200).json({
      todo,
      success: true,
      message: "Todo updated successfully.",
    });
  } catch (error) {
    console.error({ error });
    return res
      .status(500)
      .json({ error: "An unexpected error occurred.", success: false });
  }
}

export async function markComplete(req, res) {
  const { complete } = await req.body;
  const { id } = await req.params;

  if (complete === undefined) {
    return res
      .status(400)
      .json({ error: "All fields are required", success: false });
  }

  try {
    // check if item already exists
    const foundTodo = await prisma.todo.findFirst({
      id,
      userId: req.id,
    });

    if (!foundTodo) {
      return res.status(404).json({ error: "Todo not found.", success: false });
    }

    const todo = await prisma.todo.update({
      where: {
        id,
        userId: req.id,
      },
      data: {
        complete: !foundTodo.complete,
      },
    });
    if (!todo) {
      return res
        .status(500)
        .json({ error: "An unexpected error occurred.", success: false });
    }
    return res.status(200).json({
      todo,
      success: true,
      message: "Todo updated successfully.",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An unexpected error occurred.", success: false });
  }
}

export async function deleteTodo(req, res) {
  const { id } = await req.params;

  try {
    // check if item already exists
    const foundTodo = await prisma.todo.findFirst({
      where: {
        id,
        userId: req.id,
      },
    });

    if (!foundTodo) {
      return res.status(404).json({ error: "Todo not found.", success: false });
    }

    const todo = await prisma.todo.delete({ where: { id, userId: req.id } });
    if (!todo) {
      return res
        .status(500)
        .json({ error: "Todo not deleted.", success: false });
    }
    return res.status(200).json({
      todo,
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
