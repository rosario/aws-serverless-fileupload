import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import parseMultipart from "parse-multipart";
import { v4 } from "uuid";

const Bucket = "example-bucket-file-upload";

export async function upload(event) {
  const s3Client = new S3Client({ region: "us-east-1" });
  const boundary = parseMultipart.getBoundary(
    event.headers["Content-Type"] || event.headers["content-type"]
  );
  const parts = parseMultipart.Parse(
    Buffer.from(event.body, "base64"),
    boundary
  );
  const [{ filename, data }] = parts;
  const id = v4();

  const filetype = filename.match(/\.([^.]*)$/);
  let imageType = filetype[1].toLowerCase();

  try {
    const Key = `${id}.${imageType}`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket,
        Key,
        Body: data,
      })
    );
    return {
      statusCode: 200,
      body: JSON.stringify({ id: Key }),
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify(err),
    };
  }
}
