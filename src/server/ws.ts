import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

let wss: WebSocketServer | null = null;
const connectedClients = new Set<WebSocket>();

/**
 * Initializes the WebSocket server and binds it to the provided HTTP/S server instance.
 */
export function initWebSocketServer(server: Server) {
  wss = new WebSocketServer({ server, path: "/api/ws" });

  wss.on("connection", (ws, req) => {
    connectedClients.add(ws);

    let isAlive = true;
    ws.on("pong", () => {
      isAlive = true;
    });

    // Run active ping interval every 30 seconds to maintain and evaluate healthy socket bridges
    const pingInterval = setInterval(() => {
      if (!isAlive) {
        ws.terminate();
        return;
      }
      isAlive = false;
      ws.ping();
    }, 30000);

    ws.on("close", () => {
      clearInterval(pingInterval);
      connectedClients.delete(ws);
    });

    ws.on("error", (err) => {
      console.warn("WebSocket client connection error observed:", err);
      clearInterval(pingInterval);
      connectedClients.delete(ws);
    });

    // Provide immediate acknowledgment and confirmation of SECURE WSS binding protocol support
    try {
      ws.send(
        JSON.stringify({
          event: "welcome",
          payload: {
            secured: true,
            message: "APEX Concurrency Terminal Live Socket Connection Succeeded",
          },
        })
      );
    } catch {
      // Ignored
    }
  });

  console.log("WebSocket secure-ready server mounted at route path: /api/ws");
}

/**
 * Broadcasts a custom named event and associated payload to all active websocket terminals.
 */
export function broadcastWS(event: string, payload: any) {
  const message = JSON.stringify({ event, payload });
  connectedClients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(message);
      } catch (err) {
        console.error("Failed to transmit WebSocket event:", err);
      }
    }
  });
}
