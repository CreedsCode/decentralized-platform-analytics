import type Minio from "minio";

declare global {
  // eslint-disable-next-line no-var
  var minio: Minio.Client | undefined;
}
