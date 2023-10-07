import * as fs from "fs";

export interface Env {
  env: "production" | "development";
  mongo: {
    username: string;
    password: string;
    database: string;
    uri: string;
  };
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
