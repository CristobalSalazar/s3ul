import os from "os";
import path from "path";
import fs from "fs";

export const keyreader = {
  getAWSCredentials: () => {
    const homedir = os.homedir();
    const credspath = path.join(homedir, ".aws", "credentials");
    if (!fs.existsSync(credspath)) return null; // file does not exist
    const buffer = fs.readFileSync(credspath);
    const content = buffer.toString();
    const defaultRegex = /(?:\[default\](?:\r\n|\n|\r))(?:aws_access_key_id=)(.*)(?:(?:\r\n|\n|\r)aws_secret_access_key=)(.*)/gm;
    const s3xRegex = /(?:\[s3x\](?:\r\n|\n|\r))(?:aws_access_key_id=)(.*)(?:(?:\r\n|\n|\r)aws_secret_access_key=)(.*)/gm;
    // retruns null if cannot find match regex
    return (
      getKeysFromContent(s3xRegex, content) ||
      getKeysFromContent(defaultRegex, content)
    );
  },
};

function getKeysFromContent(regex: RegExp, content: string) {
  const results = regex.exec(content);
  if (results && results.length >= 3) {
    return { access: results![1], secret: results![2] };
  } else {
    return null;
  }
}
