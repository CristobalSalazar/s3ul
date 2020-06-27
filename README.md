# s3ul

## CLI utility that fetches from network or file system and uploads it to S3

*When fetching from network s3ul pipes the download directly to s3*

To install locally clone this repo then run <code>npm run deploy:local</code>

## Example Usage

Local File
```bash
s3ul -b BUCKET_NAME -a ACCESS_KEY -s SECRET_KEY ./myfile.jpg path/in/bucket/myfile.jpg
```

From network
```bash
s3ul -b BUCKET_NAME -a ACCESS_KEY -s SECRET_KEY https://somesite.com/myfile.jpg path/in/bucket/myfile.jpg
```

Network requests supports headers as well as put and post methods
headers must be formatted as such key:value,key2:value2
```bash
s3ul -b BUCKET_NAME -a ACCESS_KEY -s SECRET_KEY --post --h token:mytoken https://somesite.com/myfile.jpg path/in/bucket/myfile.jpg
```

You may omit the access key and secret key parameters if you already have your credentials stored in <code>HOME/.aws/credentials</code>
s3ul will look for a profile with the name s3x if it doesn't find it it will use the profile named default.

<code>
[s3x]
aws_access_key_id=YOUR_ACCESS_KEY
aws_secret_access_key=YOUR_SECRET_KEY
</code>

Or

<code>
[s3x]
aws_access_key_id=YOUR_ACCESS_KEY
aws_secret_access_key=YOUR_SECRET_KEY
</code>

```bash
Usage: s3ul [options] <source> <bucketKey>

Options:
  -V, --version                 output the version number
  -a, --accessKey <access key>  AWS Access Key
  -s, --secretKey <secret key>  AWS Secret Key
  -b, --bucket <name>           S3 Bucket Name
  -r, --region                  AWS region
  --get                         specify GET request (default: true)
  --post                        specify POST request (default: false)
  --put                         specify PUT request (default: false)
  -h, --headers <headers>       specify headers in the following format
                                key:value,key2:value2
  --help                        display help for command
```
