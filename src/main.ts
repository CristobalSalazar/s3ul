import fs from "fs";
import path from "path";
import { createS3Client } from "./s3client";
import { logger } from "./logger";
import { s3UploadFromFs, s3UploadFromUrl } from "./s3streams";

function parseHeaders(headers: string) {
  return headers.split(",").reduce((obj: any, str: string) => {
    const [key, val] = str.split(":");
    obj[key] = val;
    return obj;
  }, {}); // array of strings
}

export async function main(resourcePath: string, bucketKey: string, args: any) {
  const isUrl = /https?:\/\//.test(resourcePath);
  const { accessKey, secretKey, bucket, headers } = args;
  const s3client = createS3Client(accessKey, secretKey);

  if (!isUrl) {
    const fspath = path.join(process.cwd(), resourcePath);
    if (fs.existsSync(fspath)) {
      try {
        await s3UploadFromFs(fspath, bucket, bucketKey, s3client);
        logger.success("Finished uploading to s3");
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
      logger.success("Finished uploading to s3");
    } catch (err) {
      logger.error(err);
    }
  }
}
