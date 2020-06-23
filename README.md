Usage: s3upload [options] <resource> <bucketKey>

Fetches network resource and uploads it to S3

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
  -h, --headers <headers>       specify headers
  --help                        display help for command
