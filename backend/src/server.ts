import "./env.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { healthRouter } from "./routes/health.js";
import { commuteRequestsRouter } from "./routes/commuteRequests.js";
import { matchRouter } from "./routes/match.js";
import { resultsRouter } from "./routes/results.js";
import { ridersRouter } from "./routes/riders.js";
import { driversRouter } from "./routes/drivers.js";
import { authRouter } from "./routes/auth.js";
import { rideSelectionsRouter } from "./routes/rideSelections.js";
import { attachSession } from "./middleware/auth.js";

const app = express();
const port = process.env.PORT ?? 4000;
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(attachSession);
app.use(healthRouter);
app.use(commuteRequestsRouter);
app.use(matchRouter);
app.use(resultsRouter);
app.use(ridersRouter);
app.use(driversRouter);
app.use(authRouter);
app.use(rideSelectionsRouter);

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
