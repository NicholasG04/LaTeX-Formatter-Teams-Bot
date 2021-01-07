import "./helpers/env";
import express from "express";

import { json } from "body-parser";
import helmet from "helmet";

import latex from "./routes/latex";

const app = express();
const port = process.env.PORT || 3987;

app.use(json()).use(helmet());
app.use("/img-output", express.static("img-output"));

app.post("/latex", latex);

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
