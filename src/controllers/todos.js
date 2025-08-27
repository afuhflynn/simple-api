import path from "path";
import { fileURLToPath } from "url";
import { readFile, writeFile } from "fs/promises";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readData = async () => {
  const result = await readFile(path.join(__dirname, "..", "db", "data.json"), {
    encoding: "utf-8",
  });
  const data = JSON.parse(result);
  return data;
};

const writeData = async (data) => {
  try {
    await writeFile(
      path.join(__dirname, "..", "db", "data.json"),
      JSON.stringify(data),
      {
        encoding: "utf-8",
      }
    );
    return true;
  } catch (error) {
    return false;
  }
};

export async function getAllTodos(_, res, next) {
  try {
    const todos = await readData();
    if (!todos) {
      return res.status(500).json({ error: "Todos not found", success: false });
    }
    return res.status(200).json({ todos, success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An unexpected error occurred.", success: false });
  }
}

export async function createTodo(req, res, next) {
  let todo = await req.body;
  const id = randomUUID();
  todo = { ...todo, id };

  try {
    const todos = await readData();

    if (!todos) {
      return res.status(500).json({ error: "Todos not found", success: false });
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
      .status(200)
      .json({ todo, success: true, message: "Todo created successfully." });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An unexpected error occurred.", success: false });
  }
}
