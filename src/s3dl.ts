#!/usr/bin/env node
import { program } from "commander";
import { main } from "./dlmain";

program
  .option("-a, --accessKey <access key>", "AWS Access Key")
  .option("-s, --secretKey <secret key>", "AWS Secret Key")
  .option("-r, --region", "AWS region")
  .requiredOption("-b, --bucket <name>", "S3 Bucket Name");

program
  .arguments("<bucketkey> <filepath>")
  .description("Downloads a resource from s3")
  .action(main);

program.parse(process.argv);
