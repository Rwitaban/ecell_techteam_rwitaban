/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Database } from "./src/server/db";
import { createApiRouter } from "./src/server/api";
import { initWebSocketServer } from "./src/server/ws";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize unified database persistence layer
  const db = new Database();

  // Basic configuration and middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Print request logs to sandbox container
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Mount Full Stack API Router
  app.use("/api", createApiRouter(db));

  // Connect Vite for high fidelity dev middleware, serving static SPA in production
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting Express + Vite server in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting Express + Vite server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`----------------------------------------------------------------`);
    console.log(`🚀 SECURE FULL-STACK PORTAL RUNNING AT http://localhost:${PORT}`);
    console.log(`✨ Role-Based Access Control, Sandbox Webooks, Live WS & SSE Connected`);
    console.log(`----------------------------------------------------------------`);
  });

  initWebSocketServer(server);
}

startServer().catch((err) => {
  console.error("Critical error starting Express + Vite Server:", err);
  process.exit(1);
});
