import path from "path";
import { getS3Client } from "../lib/s3client";
import { logger } from "../lib/logger";
import { s3download } from "../lib/s3streams";
import { MultiBar, Presets } from "cli-progress";

export async function main(bucketKey: string, resourcePath: string, args: any) {
  let { accessKey, secretKey, bucket } = args;
  const s3client = getS3Client(accessKey, secretKey);
  const fspath = path.join(process.cwd(), resourcePath);
  const multibar = new MultiBar(
    {
      hideCursor: true
    },
    Presets.shades_grey
  );
  try {
    await s3download({
      filepath: fspath,
      bucketKey,
      bucketName: bucket,
      s3Client: s3client,
      multiBar: multibar
    });
    multibar.stop();
    logger.success("Finished downloading from s3.");
  } catch (err) {
    multibar.stop();
    logger.error(err);
  }
}
