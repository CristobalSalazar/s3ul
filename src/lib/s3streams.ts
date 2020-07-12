import { S3 } from "aws-sdk";
import axios, { Method } from "axios";
import { Readable, Writable } from "stream";
import fs from "fs";
import { logger } from "./logger";
import { MultiBar } from "cli-progress";

interface S3Args {
  bucketName: string;
  bucketKey: string;
  s3Client: S3;
  multiBar: MultiBar;
}

interface S3UploadArgs extends S3Args {
  contentLength: number;
  stream: Readable;
}

interface FSArgs extends S3Args {
  filepath: string;
}

interface UrlArgs extends S3Args {
  url: string;
  method: Method;
  headers?: { [key: string]: string };
}

export async function s3download(args: FSArgs) {
  const stream = fs.createWriteStream(args.filepath);
  await downloadFromS3(args.s3Client, args.bucketKey, args.bucketName, stream);
}

export async function fileUpload(args: FSArgs) {
  const { filepath: fspath } = args;
  if (!fs.existsSync(fspath))
    throw new Error("Invalid file path, path does not exist");

  const stats = fs.statSync(fspath);
  if (!stats.isFile)
    throw new Error("Invalid file path, path does not point towards file");

  const contentLength = stats.size;
  const readStream = fs.createReadStream(fspath);
  await uploadToS3({
    s3Client: args.s3Client,
    bucketKey: args.bucketKey,
    bucketName: args.bucketName,
    stream: readStream,
    contentLength,
    multiBar: args.multiBar,
  });
}

export async function urlUpload(args: UrlArgs) {
  const res = await axios({
    url: args.url,
    method: args.method,
    headers: args.headers,
    responseType: "stream",
  });

  const contentLength =
    res.headers["content-length"] || res.headers["Content-Length"];

  if (!contentLength)
    return logger.error(`Cannot determine Content-Length of object`);

  await uploadToS3({
    contentLength,
    bucketKey: args.bucketKey,
    bucketName: args.bucketName,
    multiBar: args.multiBar,
    s3Client: args.s3Client,
    stream: res.data,
  });
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

async function uploadToS3(args: S3UploadArgs) {
  return new Promise((res, rej) => {
    const bar = args.multiBar.create(args.contentLength, 0);
    args.s3Client
      .putObject(
        {
          Key: args.bucketKey,
          Bucket: args.bucketName,
          Body: args.stream,
          ContentLength: args.contentLength,
        },
        (err, data) => {
          bar.stop();
          if (err) rej(err);
          else {
            logger.success("Finished uploading to s3");
            res(data);
          }
        }
      )
      .on("httpUploadProgress", (progress) => {
        bar.update(progress.loaded);
      });
  });
}
