import fs from "fs";
import path from "path";

export function getFilesFromDir(input: string, recursive: boolean = false) {
  const inputStats = fs.statSync(input);
  if (inputStats.isDirectory()) {
    const paths = fs.readdirSync(input);
    return paths.reduce((val, file) => {
      const filepath = path.join(input, file);
      const stats = fs.statSync(filepath);
      if (stats.isDirectory()) {
        if (recursive) {
          const recpaths = getFilesFromDir(filepath, true);
          val.push(...recpaths);
        }
      } else {
        val.push(filepath);
      }
      return val;
    }, [] as string[]);
  } else if (inputStats.isFile()) {
    return [input];
  } else {
    throw new Error("Not a valid path");
  }
}
