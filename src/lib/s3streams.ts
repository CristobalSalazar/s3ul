import { S3 } from "aws-sdk";
import axios, { Method } from "axios";
import { Readable, Writable } from "stream";
import fs from "fs";
import { logger } from "./logger";

interface s3FsRequirements {
  fspath: string;
  bucket: string;
  bucketKey: string;
  recursive?: boolean;
  client: S3;
}
export async function s3DownloadToFs(reqs: s3FsRequirements) {
  const stream = fs.createWriteStream(reqs.fspath);
  await downloadFromS3(reqs.client, reqs.bucketKey, reqs.bucket, stream);
}

export async function s3UploadFromFs(reqs: s3FsRequirements) {
  if (!fs.existsSync(reqs.fspath))
    return logger.error("Invalid file path, path does not exist");

  const stats = fs.statSync(reqs.fspath);
  if (!stats.isFile) {
    return logger.error("Invalid file path, path does not point towards file");
  }
  const contentLength = stats.size;
  const readStream = fs.createReadStream(reqs.fspath);

  await uploadToS3(
    reqs.client,
    reqs.bucketKey,
    reqs.bucket,
    readStream,
    contentLength
  );
}

async function downloadFromS3(
  s3client: S3,
  bucketKey: string,
  bucketName: string,
  stream: Writable
) {
  return new Promise((res, rej) => {
    logger.createProgressBar("Downloading...");
    const readStream = s3client
      .getObject({ Bucket: bucketName, Key: bucketKey }, (err, data) => {
        logger.stopProgressBar();
        if (err) {
          logger.error(err.message);
          rej(err);
        } else {
          logger.success("Finished downloading from s3");
          res(data);
        }
      })
      .on("httpHeaders", (_, headers) => {
        const contentLength =
          headers["content-length"] || headers["Content-Length"];
        logger.startProgressBar(parseInt(contentLength));
      })
      .on("httpDownloadProgress", (progress) => {
        console.log(progress.loaded);
        logger.updateProgressBar(progress);
      })
      .createReadStream();

    readStream.pipe(stream);
  });
}

async function uploadToS3(
  s3client: S3,
  bucketKey: string,
  bucketName: string,
  stream: Readable,
  contentLength: number
) {
  return new Promise((res, rej) => {
    logger.createProgressBar("Uploading...");
    logger.startProgressBar(contentLength);

    s3client
      .putObject(
        {
          Key: bucketKey,
          Bucket: bucketName,
          Body: stream,
          ContentLength: contentLength,
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
    responseType: "stream",
  });

  const contentLength =
    res.headers["content-length"] || res.headers["Content-Length"];

  if (!contentLength)
    return logger.error(`Cannot determine Content-Length of object`);

  await uploadToS3(s3client, bucketKey, bucketName, res.data, contentLength);
}
