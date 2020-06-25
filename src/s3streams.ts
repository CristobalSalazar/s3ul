import { S3 } from "aws-sdk";
import axios, { Method } from "axios";
import { PassThrough } from "stream";
import fs from "fs";
import { logger } from "./logger";

interface S3StreamProps {
  bucketName: string;
  bucketKey: string;
  contentLength: number;
  s3client: S3;
}

export function getS3WriteStream(props: S3StreamProps) {
  const { bucketName, bucketKey, contentLength, s3client } = props;
  const writeStream = new PassThrough();
  const s3promise = s3client
    .putObject({
      Bucket: bucketName,
      Key: bucketKey,
      Body: writeStream,
      ContentLength: contentLength
    })
    .promise();

  return {
    writeStream,
    s3promise
  };
}

export async function s3UploadFromFs(
  fspath: string,
  bucket: string,
  bucketKey: string,
  client: S3
) {
  const contentLength = fs.statSync(fspath).size;
  const { writeStream } = getS3WriteStream({
    bucketKey,
    s3client: client,
    contentLength,
    bucketName: bucket
  });
  const readStream = fs.createReadStream(fspath);
  readStream.pipe(writeStream);
  writeStream.on("end", () => {
    readStream.unpipe();
    writeStream.end();
  });
}

let transferProgress = 0;
export async function s3UploadFromUrl(
  url: string,
  bucketKey: string,
  method: Method = "get",
  s3client: S3,
  bucketName: string
) {
  const res = await axios({
    method,
    url,
    responseType: "stream"
  });

  const contentLength =
    res.headers["content-length"] || res.headers["Content-Length"];

  if (!contentLength)
    return logger.error(`Cannot determine Content-Length of object`);

  const { writeStream } = getS3WriteStream({
    contentLength,
    bucketKey,
    s3client,
    bucketName
  });

  const readStream = res.data;
  const pipeline = readStream.pipe(writeStream);

  pipeline.on("data", (chunk: Buffer) => {
    transferProgress += chunk.length;
    process.stdout.write(
      `Downloading ${Math.floor((transferProgress / contentLength) * 10000) /
        100}%\r`
    );
  });

  pipeline.on("end", () => console.log("closing pipeline"));
}
