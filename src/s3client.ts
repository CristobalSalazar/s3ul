import { S3 } from "aws-sdk";

export function createS3Client(
  access: string,
  secret: string,
  region: string = "us-east-1"
) {
  return new S3({
    credentials: {
      accessKeyId: access,
      secretAccessKey: secret
    },
    region: region,
    signatureVersion: "v4"
  });

  const s3x = /(?:\[s3x\]\naws_access_key_id=)(.*)(?:\naws_secret_access_key=)(.*)$/g;
}
