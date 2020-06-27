# s3ul

### s3 utility that uploads files from the network or filesystem

To install locally clone this repo then run <code>npm run deploy:local</code>

### Example Usage

Upload a local File
```bash
s3ul -b BUCKET_NAME -a ACCESS_KEY -s SECRET_KEY ./myfile.jpg path/in/bucket/myfile.jpg
```

Upload a file from the network

*When fetching from network s3ul pipes the download directly to s3 it is not cached or stored in RAM*
```bash
s3ul -b BUCKET_NAME -a ACCESS_KEY -s SECRET_KEY https://somesite.com/myfile.jpg path/in/bucket/myfile.jpg
```

Network requests support put and post methods as well as headers

If specified, headers must in the following format
`key:value,key2:value2`
```bash
s3ul -b BUCKET_NAME -a ACCESS_KEY -s SECRET_KEY --post -h token:mytoken https://somesite.com/myfile.jpg path/in/bucket/myfile.jpg
```

### Profiles
You may omit the access key and secret key parameters if you already have your credentials stored in `HOME/.aws/credentials`

s3ul will look for a profile with the name s3x. If it doesn't find it it will use the profile named default.

```bash
[s3x]
aws_access_key_id=YOUR_ACCESS_KEY
aws_secret_access_key=YOUR_SECRET_KEY
```

Or

```bash
[default]
aws_access_key_id=YOUR_ACCESS_KEY
aws_secret_access_key=YOUR_SECRET_KEY
```

### Help display
```
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
