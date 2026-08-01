import express from "express";
import cors from "cors";
import { initSchema } from "./db.js";
import authRoutes from "./routes/auth.js";
import eventsRoutes from "./routes/events.js";
import registrationsRoutes from "./routes/registrations.js";
import wishlistRoutes from "./routes/wishlist.js";

export function createApp() {
  initSchema();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "eventsphere-api" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/events", eventsRoutes);
  app.use("/api/registrations", registrationsRoutes);
  app.use("/api/wishlist", wishlistRoutes);

  // Centralized error handler -- catches anything thrown/rejected in route
  // handlers that wasn't already handled, so a bug doesn't crash the whole
  // server or leak a raw stack trace to the client.
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}

if (process.env.NODE_ENV !== "test") {
  const app = createApp();
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`EventSphere API listening on port ${port}`);
  });
}
