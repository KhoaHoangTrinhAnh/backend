declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    REDIS_HOST: string;
    REDIS_PORT: string;
    MONGO_URI: string;
    AWS_REGION: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_BUCKET_NAME: string;
  }
}
