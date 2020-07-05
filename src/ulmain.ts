import path from "path";
import { createS3Client } from "./lib/s3client";
import { logger } from "./lib/logger";
import { s3UploadFromFs, s3UploadFromUrl } from "./s3streams";
import { keyreader } from "./lib/keyreader";

function parseHeaders(headers: string) {
  return headers.split(",").reduce((obj: any, str: string) => {
    const [key, val] = str.split(":");
    obj[key] = val;
    return obj;
  }, {});
}

export async function main(resourcePath: string, bucketKey: string, args: any) {
  const isUrl = /https?:\/\//.test(resourcePath);
  let { accessKey, secretKey, bucket, headers } = args;
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

  if (!isUrl) {
    const fspath = path.join(process.cwd(), resourcePath);
    if (fs.existsSync(fspath)) {
      try {
        await s3UploadFromFs({ fspath, bucket, bucketKey, client: s3client });
      } catch (err) {
        logger.error(err);
      }
    } else {
      logger.error(`File "${resourcePath}" not found.`);
    }
  } else {
    try {
      const parsedHeaders = headers ? parseHeaders(headers) : null;
      const method = args.put ? "put" : args.post ? "post" : "get";

      await s3UploadFromUrl(
        resourcePath,
        bucketKey,
        method,
        s3client,
        bucket,
        parsedHeaders
      );
    } catch (err) {
      logger.error(err);
    }
  }
}
