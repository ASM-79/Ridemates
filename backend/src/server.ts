import "./env.js";
import cors from "cors";
import express from "express";
import { healthRouter } from "./routes/health.js";
import { commuteRequestsRouter } from "./routes/commuteRequests.js";
import { matchRouter } from "./routes/match.js";

const app = express();
const port = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());
app.use(healthRouter);
app.use(commuteRequestsRouter);
app.use(matchRouter);

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
