import os from "os";
import path from "path";
import fs from "fs";

export const keyreader = {
  getAWSCredentials: () => {
    const credspath = path.join(os.homedir(), ".aws/credentials");
    if (!fs.existsSync(credspath)) {
      return null;
    }
    const buffer = fs.readFileSync(credspath);
    const content = buffer.toString();
    const def = /(?:\[default\]\n)(?:aws_access_key_id=)(.*)(?:\naws_secret_access_key=)(.*)/gm;
    const s3x = /(?:\[s3x\]\n)(?:aws_access_key_id=)(.*)(?:\naws_secret_access_key=)(.*)/gm;
    return getKeysFromContent(s3x, content) || getKeysFromContent(def, content);
  }
};

function getKeysFromContent(regex: RegExp, content: string) {
  const results = regex.exec(content);
  if (results && results.length >= 3) {
    return { access: results![1], secret: results![2] };
  } else {
    return null;
  }
}
