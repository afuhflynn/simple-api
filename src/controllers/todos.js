import path from "path";
import { fileURLToPath } from "url";
import { readFile } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readData = async () => {
  const result = await readFile(path.join(__dirname, "..", "db", "data.json"), {
    encoding: "utf-8",
  });
  const data = JSON.parse(result);
  return data;
};

export async function getAllTodos(_, res, next) {
  try {
    const todos = await readData();
    if (todos) {
      return res.status(500).json({ error: "Data not found", success: false });
    }
    return res.status(200).json({ todos, success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An unexpected error occurred.", success: false });
  }
}
