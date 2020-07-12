import { S3 } from "aws-sdk";
import { keyreader } from "./keyreader";

function createS3Client(
  access: string,
  secret: string,
  region: string = "us-east-1"
) {
  return new S3({
    credentials: {
      accessKeyId: access,
      secretAccessKey: secret,
    },
    region: region,
    signatureVersion: "v4",
  });
}

export function getS3Client(accessKey: string, secretKey: string) {
  if ((!secretKey && accessKey) || (!accessKey && secretKey)) {
    throw new Error("Must provide both keys as arguments or none");
  } else if (!secretKey && !accessKey) {
    // no keys provided as arguments, read from aws credentials file
    const keys = keyreader.getAWSCredentials();
    if (keys === null) {
      throw new Error("unable to find keys in HOME/.aws/credentials");
    }
    accessKey = keys.access;
    secretKey = keys.secret;
  }
  return createS3Client(accessKey, secretKey);
}
