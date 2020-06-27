import { S3 } from "aws-sdk";
import axios, { Method } from "axios";
import { Readable } from "stream";
import fs from "fs";
import { logger } from "./logger";

export async function s3UploadFromFs(
  fspath: string,
  bucket: string,
  bucketKey: string,
  client: S3
) {
  if (!fs.existsSync(fspath))
    return logger.error("Invalid file path, path does not exist");

  const stats = fs.statSync(fspath);
  if (!stats.isFile) {
    return logger.error("Invalid file path, path does not point towards file");
  }
  const contentLength = stats.size;
  const readStream = fs.createReadStream(fspath);
  await uploadToS3(client, bucketKey, bucket, readStream, contentLength);
}

async function uploadToS3(
  s3client: S3,
  bucketKey: string,
  bucketName: string,
  stream: Readable,
  contentLength: number
) {
  return new Promise((res, rej) => {
    logger.startProgressBar(contentLength);
    s3client
      .putObject(
        {
          Key: bucketKey,
          Bucket: bucketName,
          Body: stream,
          ContentLength: contentLength
        },
        (err, data) => {
          logger.stopProgressBar();
          if (err) rej(err);
          else {
            logger.success("Finished uploading to s3");
            res(data);
          }
        }
      )
      .on("httpUploadProgress", logger.updateProgressBar);
  });
}

export async function s3UploadFromUrl(
  url: string,
  bucketKey: string,
  method: Method = "get",
  s3client: S3,
  bucketName: string,
  headers: any = {}
) {
  const res = await axios({
    url,
    method,
    headers,
    responseType: "stream"
  });

  const contentLength =
    res.headers["content-length"] || res.headers["Content-Length"];

  if (!contentLength)
    return logger.error(`Cannot determine Content-Length of object`);

  await uploadToS3(s3client, bucketKey, bucketName, res.data, contentLength);
}
