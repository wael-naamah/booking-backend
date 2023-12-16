import * as fs from "fs";

export interface Env {
  env: "production" | "development";
  mongoUri: string;
  mongoUsername: string;
  mongoPassword: string;
  database: string;
  jwt_secret_key: string;
  jwt_refresh_secret_key: string;
}

let env: Env;

export const getEnv = () => {
  if (env) {
    return env;
  }

  const envFilePath = process.env.ENV_PATH || "../../env/env.json";
  const contents = fs.readFileSync(envFilePath);
  env = JSON.parse(contents.toString());

  return env;
};
