import fs from "fs";
import path from "path";

export function getFilesRecursive(input: string) {
  const inputStats = fs.statSync(input);
  if (inputStats.isDirectory()) {
    const paths = fs.readdirSync(input);
    return paths.reduce((val, file) => {
      const filepath = path.join(input, file);
      const stats = fs.statSync(filepath);
      if (stats.isDirectory()) {
        const recpaths = getFilesRecursive(filepath);
        val.push(...recpaths);
      } else {
        val.push(filepath);
      }
      return val;
    }, [] as string[]);
  } else if (inputStats.isFile()) {
    return [input];
  } else {
    throw new Error("Not a valid file path");
  }
}
