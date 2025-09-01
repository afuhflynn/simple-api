import path from "path";
import { fileURLToPath } from "url";
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const readData = async (db) => {
  const filePath = path.join(__dirname, "..", "db", `${db}.json`);
  if (!existsSync(filePath)) {
    return ull;
  }
  try {
    const result = await readFile(filePath, {
      encoding: "utf-8",
    });
    const data = JSON.parse(result);
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const writeData = async (data, db) => {
  try {
    await writeFile(
      path.join(__dirname, "..", "db", `${db}.json`),
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
