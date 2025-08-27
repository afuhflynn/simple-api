import path from "path";
import { fileURLToPath } from "url";
import { readFile, writeFile } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const readData = async () => {
  const result = await readFile(path.join(__dirname, "..", "db", "data.json"), {
    encoding: "utf-8",
  });
  const data = JSON.parse(result);
  return data;
};

export const writeData = async (data) => {
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
