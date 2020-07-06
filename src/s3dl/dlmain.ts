import path from "path";
import { createS3Client } from "../lib/s3client";
import { logger } from "../lib/logger";
import { s3DownloadToFs } from "../lib/s3streams";
import { keyreader } from "../lib/keyreader";

export async function main(bucketKey: string, resourcePath: string, args: any) {
  let { accessKey, secretKey, bucket } = args;
  // check for keys
  if ((!secretKey && accessKey) || (!accessKey && secretKey)) {
    return logger.error("Must provide both keys as arguments or none");
  } else if (!secretKey && !accessKey) {
    const keys = keyreader.getAWSCredentials();

    if (!keys) {
      return logger.error(
        "Must provide AWS credentials either as arguments or in HOME/.aws/credentials"
      );
    }
    accessKey = keys.access;
    secretKey = keys.secret;
  }

  const s3client = createS3Client(accessKey, secretKey);
  const fspath = path.join(process.cwd(), resourcePath);
  try {
    await s3DownloadToFs({ fspath, bucket, bucketKey, client: s3client });
  } catch (err) {
    logger.error(err);
  }
}
