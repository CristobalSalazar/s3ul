import fs from "fs";
import path from "path";
import { Method } from "axios";
import { S3 } from "aws-sdk";
import { createS3Client } from "../lib/s3client";
import { logger } from "../lib/logger";
import { s3UploadFromFs, s3UploadFromUrl } from "../lib/s3streams";
import { keyreader } from "../lib/keyreader";
import { getS3KeysFromDir } from "../lib/filereader";

export async function main(resourcePath: string, bucketKey: string, args: any) {
  let { accessKey, secretKey, bucket, headers, recursive } = args;
  const client = getS3Client(accessKey, secretKey);
  const isUrl = /https?:\/\//.test(resourcePath);
  if (isUrl) {
    const parsedHeaders = headers ? parseHeaders(headers) : null;
    const method = args.put ? "put" : args.post ? "post" : "get";
    urlUploadHandler({
      url: resourcePath,
      headers: parsedHeaders,
      method,
      client,
      bucket,
      bucketKey
    });
  } else {
    fsUploadHandler({
      fspath: path.join(process.cwd(), resourcePath),
      bucket,
      bucketKey,
      client,
      recursive
    });
  }
}

function parseHeaders(headers: string) {
  return headers.split(",").reduce((obj: any, str: string) => {
    const [key, val] = str.split(":");
    obj[key] = val;
    return obj;
  }, {});
}

interface FsUploadOptions {
  fspath: string;
  bucket: string;
  bucketKey: string;
  recursive: boolean;
  client: S3;
}
async function fsUploadHandler(opts: FsUploadOptions) {
  const { fspath, bucket, bucketKey, recursive, client } = opts;
  if (fs.existsSync(opts.fspath)) {
    const keys = getS3KeysFromDir(fspath, bucketKey, recursive);
    try {
      await Promise.all(
        keys.map(k =>
          s3UploadFromFs({
            fspath: k.fspath,
            bucketKey: k.s3key,
            client,
            bucket
          })
        )
      );
    } catch (err) {
      logger.error(err);
    }
  } else {
    logger.error(`File "${fspath}" not found.`);
  }
}

interface UrlUploadOptions {
  url: string;
  method: Method;
  bucketKey: string;
  bucket: string;
  client: S3;
  headers: { [key: string]: string } | null;
}
async function urlUploadHandler(opts: UrlUploadOptions) {
  const { url, method, headers, bucketKey, bucket, client } = opts;
  try {
    await s3UploadFromUrl(url, bucketKey, method, client, bucket, headers);
  } catch (err) {
    logger.error(err);
  }
}

function getS3Client(accessKey: string, secretKey: string) {
  if ((!secretKey && accessKey) || (!accessKey && secretKey)) {
    throw new Error("Must provide both keys as arguments or none");
  } else if (!secretKey && !accessKey) {
    const keys = keyreader.getAWSCredentials();
    if (!keys) {
      throw new Error(
        "Must provide AWS credentials either as arguments or in HOME/.aws/credentials"
      );
    }
    accessKey = keys.access;
    secretKey = keys.secret;
  }
  return createS3Client(accessKey, secretKey);
}
