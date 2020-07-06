import { getFilesFromDir } from "../src/lib/filereader";
import { homedir } from "os";
import path from "path";

describe("filereader", () => {
  it("Should return an array", () => {
    const cwd = homedir();
    const bucketPath = "test/SomeDir";
    const relativePath = "./Downloads";
    const localPath = path.join(cwd, relativePath);
    const files = getFilesFromDir(localPath, true);
    const s3Keys = files.map((f) =>
      path.join(bucketPath, f.substring(localPath.length, f.length))
    );
    console.log(s3Keys);
  });

  it("should get files from path", () => {
    const files = getFilesFromDir(homedir());
    expect(files.length).toBeGreaterThan(0);
  });
});
