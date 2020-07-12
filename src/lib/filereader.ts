import fs from "fs";
import path from "path";

export function getS3KeysFromDir(
  fsdirpath: string,
  bucketdir: string,
  recursive: boolean
) {
  const fspaths = getFilesFromDir(fsdirpath, recursive);
  return fspaths.map((fspath) => {
    return {
      fspath,
      s3key: filePathToS3Key(fsdirpath, fspath, bucketdir),
    };
  });
}

export function filePathToS3Key(
  dirpath: string,
  filepath: string,
  bucketdir: string
) {
  return path.join(
    bucketdir,
    filepath.substring(dirpath.length, filepath.length)
  );
}

export function getFilesFromDir(dirpath: string, recursive: boolean = false) {
  const inputStats = fs.statSync(dirpath);
  if (inputStats.isDirectory()) {
    const paths = fs.readdirSync(dirpath);
    return paths.reduce((val, file) => {
      const filepath = path.join(dirpath, file);
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
    return [dirpath];
  } else {
    throw new Error("Not a valid path");
  }
}
