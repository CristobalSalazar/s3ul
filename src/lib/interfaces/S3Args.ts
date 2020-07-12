import { S3 } from "aws-sdk";
import { MultiBar } from "cli-progress";
import { Readable, Writable } from "stream";
import { Method } from "axios";

export interface S3Args {
  bucketName: string;
  bucketKey: string;
  s3Client: S3;
  multiBar: MultiBar;
}

export interface S3UploadArgs extends S3Args {
  contentLength: number;
  readStream: Readable;
}

export interface S3DownloadArgs extends S3Args {
  writeStream: Writable;
}

export interface FsArgs extends S3Args {
  filepath: string;
}

export interface UrlArgs extends S3Args {
  url: string;
  method: Method;
  headers?: { [key: string]: string };
}
