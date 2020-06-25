import fs from "fs";
import path from "path";
import { createS3Client } from "./s3client";
import { logger } from "./logger";
import { s3UploadFromFs, s3UploadFromUrl } from "./s3streams";

export async function main(resourcePath: string, bucketKey: string, args: any) {
  const isUrl = /https?:\/\//.test(resourcePath);
  const { accessKey, secretKey, bucket } = args;
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
      const method = args.put ? "put" : args.post ? "post" : "get";
      await s3UploadFromUrl(resourcePath, bucketKey, method, s3client, bucket);
      logger.success("Finished uploading to s3");
    } catch (err) {
      logger.error(err);
    }
  }
}
