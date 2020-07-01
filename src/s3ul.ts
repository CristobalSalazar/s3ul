#!/usr/bin/env node
import { program } from "commander";
import { main } from "./ulmain";

program.version("0.0.1");

program
  .option("-a, --accessKey <access key>", "AWS Access Key")
  .option("-s, --secretKey <secret key>", "AWS Secret Key")
  .option("-r, --region", "AWS region")
  .requiredOption("-b, --bucket <name>", "S3 Bucket Name");

program
  .arguments("<source> <bucketKey>")
  .description("Fetches network resource or local file and uploads it to S3")
  .option("--get", "specify GET request", true)
  .option("--post", "specify POST request")
  .option("--put", "specify PUT request")
  .option(
    "-h, --headers <headers>",
    "specify headers in the following format key:value,key2:value2"
  )
  .action(main);

program.parse(process.argv);
