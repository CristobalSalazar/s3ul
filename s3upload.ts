import { S3 } from "aws-sdk";
import { program } from "commander";
import stream from "stream";
import path from "path";
import fs from "fs";
import axios from "axios";
import chalk from "chalk";

program.version("0.0.1");

program
  .requiredOption("-a, --accessKey <access key>", "AWS Access Key")
  .requiredOption("-s, --secretKey <secret key>", "AWS Secret Key")
  .requiredOption("-b, --bucket <name>", "S3 Bucket Name")
  .option("-r, --region", "AWS region")
  .option("-u, --url", "Upload from url", false);

program
  .arguments("<resource> <bucketKey>")
  .description("Fetches network resource and uploads it to S3")
  .option("--get", "specify GET request", true)
  .option("--post", "specify POST request", false)
  .option("--put", "specify PUT request", false)
  .option("-h, --headers <headers>", "specify headers")
  .action((url, bucketKey, args) => {
    const isUrl = /https?:\/\//.test(url);
    const { accessKey, secretKey } = args;
    if (!isUrl) {
      if (fs.existsSync(path.join(__dirname, url))) {
        s3UploadFromFs(url, bucketKey, accessKey, secretKey)
          .then(() => console.log("Finshed Uploading to s3"))
          .catch(console.log);
      } else {
        console.log(chalk.red("File not found"));
      }
    } else {
      s3UploadFromUrl(url, bucketKey, accessKey, secretKey)
        .then(() => console.log("Finished uploading to s3"))
        .catch(console.log);
    }
  });

program.parse(process.argv);

function getUploadStream(
  key: string,
  access: string,
  secret: string,
  contentLength: number
) {
  const s3 = new S3({
    credentials: {
      accessKeyId: access,
      secretAccessKey: secret
    },
    region: program.region || "us-east-1",
    signatureVersion: "v4"
  });

  const writeStream = new stream.PassThrough();

  const promise = s3
    .putObject({
      Bucket: program.bucket,
      Key: key,
      Body: writeStream,
      ContentLength: contentLength
    })
    .promise();

  return {
    writeStream,
    promise
  };
}

async function s3UploadFromFs(
  fspath: string,
  bucketKey: string,
  accessKey: string,
  secretKey: string
) {
  const abspath = path.join(__dirname, fspath);
  const size = fs.statSync(abspath).size;

  const { writeStream, promise } = getUploadStream(
    bucketKey,
    accessKey,
    secretKey,
    size
  );

  fs.createReadStream(abspath).pipe(writeStream);

  await promise;
}

async function s3UploadFromUrl(
  url: string,
  bucketKey: string,
  accessKey: string,
  secretKey: string
) {
  const method = program.put ? "put" : program.post ? "post" : "get";

  const res = await axios({
    method,
    url,
    responseType: "stream"
  });

  const contentLength = res.headers["content-length"];

  const { writeStream, promise } = getUploadStream(
    bucketKey,
    accessKey,
    secretKey,
    contentLength
  );
  res.data.pipe(writeStream);
  await promise;
}
