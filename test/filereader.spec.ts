import { getFilesFromDir, getS3KeysFromDir } from "../src/lib/filereader";
import { homedir } from "os";
import path from "path";

describe("filereader", () => {
  it("Should return an array", () => {
    const s3keys = getS3KeysFromDir(
      path.join(homedir(), "/Downloads"),
      "/test",
      true
    );
    console.log(s3keys);
  });

  it("should get files from path", () => {
    const files = getFilesFromDir(homedir());
    expect(files.length).toBeGreaterThan(0);
  });
});
