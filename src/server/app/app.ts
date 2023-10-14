import express from "express";

import { json, urlencoded } from "body-parser";
import { rateLimiterUsingThirdParty } from "./middlewares/rateLimiter";

import { configure as authApi } from "./user/resource";
import { configure as serviceApi } from "./category/resource";

import helmet from "helmet";

import errorHandler from "./middlewares/errorHandler";
import { getEnv } from "../env";
import swaggerUi from "swagger-ui-express";
import swaggerFile from "../swagger/swagger_output.json";

const cookieParser = require("cookie-parser")();
const cors = require("cors")({ origin: true });

export const app = express();

app.use(
  helmet({
    frameguard: { action: "deny" },
  })
);

app.use(cors);
app.use(cookieParser);
app.disable("x-powered-by");

app.use(json());
app.use(urlencoded({ extended: true }));

app.set("port", process.env.PORT || 11700);

app.use(rateLimiterUsingThirdParty);
if (getEnv().env === "development") {
  app.use("/app/docs-yuop!", swaggerUi.serve, swaggerUi.setup(swaggerFile));
}
app.get("/", (req, res) => {
  res.json({ status: `up` });
});

const appScoped = express.Router();

authApi(appScoped);
serviceApi(appScoped);

app.use(`/`, appScoped);

app.use(errorHandler);
//
