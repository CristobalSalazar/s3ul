#!/usr/bin/env node
import { program } from "commander";
import { main } from "./main";

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
  .action(main);

program.parse(process.argv);