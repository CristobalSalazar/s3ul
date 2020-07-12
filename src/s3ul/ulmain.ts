import fs from "fs";
import path from "path";
import { Method } from "axios";
import { S3 } from "aws-sdk";
import { getS3Client } from "../lib/s3client";
import { logger } from "../lib/logger";
import { fileUpload, urlUpload } from "../lib/s3streams";
import { getS3KeysFromDir } from "../lib/filereader";
import { MultiBar, Presets } from "cli-progress";

// resource path can be url filepath or dirpath
export async function main(source: string, bucketKey: string, args: any) {
  let { accessKey, secretKey, bucket, headers, recursive } = args;
  const s3client = getS3Client(accessKey, secretKey);
  const isUrl = /https?:\/\//.test(source);
  if (isUrl) {
    const parsedHeaders = headers ? parseHeaders(headers) : undefined;
    const method = args.put ? "put" : args.post ? "post" : "get";
    urlUploadHandler({
      url: source,
      headers: parsedHeaders,
      method,
      client: s3client,
      bucket,
      bucketKey,
    });
  } else {
    fsUploadHandler({
      fspath: path.join(process.cwd(), source),
      bucket,
      bucketKey,
      client: s3client,
      recursive,
    });
  }
}

function parseHeaders(headers: string) {
  return headers
    .split(",")
    .reduce((headersObject: { [key: string]: string }, str: string) => {
      const [key, val] = str.split(":");
      headersObject[key] = val;
      return headersObject;
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

  if (fs.existsSync(fspath)) {
    // valid filepath
    const s3keys = getS3KeysFromDir(fspath, bucketKey, recursive);
    const multibar = new MultiBar(
      {
        hideCursor: true,
        etaBuffer: 60,
        format:
          "{bucketKey} |{bar}| {percentage}% || ETA: {eta_formatted} || {value}/{total}",
      },
      Presets.shades_grey
    );

    try {
      await Promise.all(
        s3keys.map((k) =>
          fileUpload({
            filepath: k.fspath,
            bucketKey: k.s3key,
            s3Client: client,
            bucketName: bucket,
            multiBar: multibar,
          })
        )
      );
      multibar.stop();
      logger.success("Finished uploading to s3");
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
  headers?: { [key: string]: string };
}
async function urlUploadHandler(opts: UrlUploadOptions) {
  const { url, method, headers, bucketKey, bucket, client } = opts;
  const multibar = new MultiBar(
    {
      hideCursor: true,
      etaBuffer: 60,
      format:
        "{bucketKey} |{bar}| {percentage}% || ETA: {eta_formatted} || {value}/{total}",
    },
    Presets.shades_grey
  );
  try {
    await urlUpload({
      url,
      bucketKey,
      bucketName: bucket,
      headers: headers || undefined,
      method,
      multiBar: multibar,
      s3Client: client,
    });
    multibar.stop();
    logger.success("Finished uploading to s3");
  } catch (err) {
    logger.error(err);
  }
}
