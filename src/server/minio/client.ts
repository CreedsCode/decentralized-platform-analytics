import * as Minio from "minio";
import { env } from "../../env/server.mjs";

declare global {
  // eslint-disable-next-line no-var
  var minio: Minio.Client | undefined;
}

let minio: Minio.Client;
const minioConfig = {
  accessKey: env.MINIO_ACCESSKEY,
  endPoint: env.MINIO_ENDPOINT,
  port: Number(env.MINIO_PORT),
  secretKey: env.MINIO_SECRETKEY,
  useSSL: true,
};

if (env.NODE_ENV === "production") {
  minio = new Minio.Client(minioConfig);
} else {
  if (!global.minio) {
    global.minio = new Minio.Client(minioConfig);
  }
  minio = global.minio;
}

export default minio;
