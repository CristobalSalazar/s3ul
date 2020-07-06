import fs from "fs";
import path from "path";
import { createS3Client } from "../lib/s3client";
import { logger } from "../lib/logger";
import { s3UploadFromFs, s3UploadFromUrl } from "../lib/s3streams";
import { keyreader } from "../lib/keyreader";
import { getFilesFromDir } from "../lib/filereader";

function parseHeaders(headers: string) {
  return headers.split(",").reduce((obj: any, str: string) => {
    const [key, val] = str.split(":");
    obj[key] = val;
    return obj;
  }, {});
}

export async function main(resourcePath: string, bucketKey: string, args: any) {
  // get keys and create client
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

  const isUrl = /https?:\/\//.test(resourcePath);
  if (!isUrl) {
    const fspath = path.join(process.cwd(), resourcePath);
    if (fs.existsSync(fspath)) {
      const paths = getFilesFromDir(fspath);
      try {
        // bucket key will have to change
        await Promise.all(
          paths.map((p) =>
            s3UploadFromFs({ fspath: p, bucketKey, client: s3client, bucket })
          )
        );
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
