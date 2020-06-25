# s3ul

## CLI utility that fetches from network or file system and uploads it to S3

*When fetching from network s3ul pipes the download directly to s3*

To install locally simply clone this repo then run <code>npm run deploy:local</code>

```bash
Usage: s3ul [options] <source> <bucketKey>

Options:
  -V, --version                 output the version number
  -a, --accessKey <access key>  AWS Access Key
  -s, --secretKey <secret key>  AWS Secret Key
  -b, --bucket <name>           S3 Bucket Name
  -r, --region                  AWS region
  -u, --url                     Upload from url (default: false)
  --get                         specify GET request (default: true)
  --post                        specify POST request (default: false)
  --put                         specify PUT request (default: false)
  -h, --headers <headers>       specify headers in the following format
                                key:value,key2:value2
  --help                        display help for command
```
