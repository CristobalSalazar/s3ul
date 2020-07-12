import axios from "axios";
import fs from "fs";
import { logger } from "./logger";
import {
  S3UploadArgs,
  S3DownloadArgs,
  FsArgs,
  UrlArgs,
} from "./interfaces/S3Args";
import { SingleBar } from "cli-progress";

export async function s3download(args: FsArgs) {
  const stream = fs.createWriteStream(args.filepath);
  await downloadFromS3({
    bucketKey: args.bucketKey,
    bucketName: args.bucketName,
    multiBar: args.multiBar,
    s3Client: args.s3Client,
    writeStream: stream,
  });
}

export async function fileUpload(args: FsArgs) {
  // for individaul file upload
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
    readStream: readStream,
    multiBar: args.multiBar,
    contentLength,
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
    readStream: res.data,
  });
}
async function downloadFromS3(args: S3DownloadArgs) {
  return new Promise((res, rej) => {
    logger.createProgressBar("Downloading...");
    let bar: SingleBar;
    const readStream = args.s3Client
      .getObject(
        { Bucket: args.bucketName, Key: args.bucketKey },
        (err, data) => {
          logger.stopProgressBar();
          if (err) {
            logger.error(err.message);
            rej(err);
          } else {
            logger.success("Finished downloading from s3");
            res(data);
          }
        }
      )
      .on("httpHeaders", (_, headers) => {
        const contentLength =
          headers["content-length"] || headers["Content-Length"];
        try {
          const parsedContentLength = parseInt(contentLength);
          bar = args.multiBar.create(parsedContentLength, 0);
        } catch (err) {
          throw new Error("content length header not present");
        }
      })
      .on("httpDownloadProgress", (progress) => {
        bar.update(progress.loaded);
      })
      .createReadStream();
    readStream.pipe(args.writeStream);
  });
}

async function uploadToS3(args: S3UploadArgs) {
  return new Promise((res, rej) => {
    const bar = args.multiBar.create(args.contentLength, 0, {
      bucketKey: args.bucketKey,
    });

    args.s3Client
      .putObject(
        {
          Key: args.bucketKey,
          Bucket: args.bucketName,
          Body: args.readStream,
          ContentLength: args.contentLength,
        },
        (err, data) => {
          bar.stop();
          if (err) rej(err);
          else {
            res(data);
          }
        }
      )
      .on("httpUploadProgress", (progress) => {
        bar.update(progress.loaded);
      });
  });
}
