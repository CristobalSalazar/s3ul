import { S3 } from "aws-sdk";
import axios, { Method } from "axios";
import { PassThrough, Readable } from "stream";
import fs from "fs";
import { logger } from "./logger";

let transferProgress = 0;

interface S3StreamProps {
  bucketName: string;
  bucketKey: string;
  contentLength: number;
  s3client: S3;
}

export function getS3PassThrough(props: S3StreamProps) {
  const { bucketName, bucketKey, contentLength, s3client } = props;
  const passThrough = new PassThrough();
  const s3promise = () =>
    s3client
      .putObject({
        Bucket: bucketName,
        Key: bucketKey,
        Body: passThrough,
        ContentLength: contentLength
      })
      .promise();

  return {
    passThrough,
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
  const { passThrough, s3promise } = getS3PassThrough({
    bucketKey,
    s3client: client,
    contentLength,
    bucketName: bucket
  });
  const readStream = fs.createReadStream(fspath);
  startStreams(readStream, passThrough, contentLength);
  await s3promise();
}

function startStreams(
  readStream: Readable,
  passThrough: PassThrough,
  contentLength: number
) {
  readStream.pipe(passThrough);

  readStream.on("data", chunk => {
    transferProgress += chunk.length;
    process.stdout.write(new Array(process.stdout.columns).join(" ") + "\r");
    process.stdout.write(
      `Uploading ${Math.floor((transferProgress / contentLength) * 10000) /
        100}%\r`
    );

    passThrough.write(chunk);
    if (transferProgress === contentLength) {
      passThrough.end();
    }
  });

  readStream.on("end", () => {
    passThrough.end();
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
    method,
    url,
    responseType: "stream"
  });

  const contentLength =
    res.headers["content-length"] || res.headers["Content-Length"];

  if (!contentLength)
    return logger.error(`Cannot determine Content-Length of object`);

  const { passThrough, s3promise } = getS3PassThrough({
    contentLength,
    bucketKey,
    s3client,
    bucketName
  });

  const readStream = res.data as Readable;

  startStreams(readStream, passThrough, contentLength);

  await s3promise();
}
