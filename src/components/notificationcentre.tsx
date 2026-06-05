
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useRef } from "react";
import { BroadcastNotification } from "../types";
import { api, getSessionToken } from "../lib/api";
import { Bell, Terminal, Pin, Volume2, X, AlertTriangle, ShieldCheck } from "lucide-react";

interface Toast {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
}

export default function NotificationCenter({
  onRefreshEvents,
  onRefreshFinance,
  onRefreshUser,
}: {
  onRefreshEvents?: () => void;
  onRefreshFinance?: () => void;
  onRefreshUser?: () => void;
}) {
  const [notifications, setNotifications] = useState<BroadcastNotification[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial notifications
  const loadNotifications = async () => {
    try {
      const list = await api.getNotifications();
      setNotifications(list);
    } catch (err) {
      console.error("Failed to fetch initial notifications:", err);
    }
  };

  useEffect(() => {
    loadNotifications();

    let isDisposed = false;

    // Setup secure WebSockets with automatic reconnection
    const connectWebSocket = () => {
      if (isDisposed) return;

      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch (_) {}
      }

      // Determine correct connection protocol (ws:// or secure wss://)
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/api/ws`;

      console.log(`[ws-client] Opening connection to: ${wsUrl}`);
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("[ws-client] WebSocket connection established successfully.");
      };

      socket.onmessage = (eventMsg) => {
        try {
          const parsed = JSON.parse(eventMsg.data);
          const { event: eventName, payload } = parsed;

          if (eventName === "welcome") {
            console.log(`[ws-client] Connection greetings received: ${payload.message}`);
            return;
          }

          // Hear regular notifications
          if (eventName === "notification") {
            setNotifications((prev) => [payload, ...prev]);
            setUnreadCount((c) => c + 1);
            addToast(payload.title, payload.message, "info");
          }

          // Hear payment status changes
          else if (eventName === "payment-processed") {
            const currentToken = getSessionToken();
            
            // Triggers visual refresh of timelines or stores if current user completed payment
            if (onRefreshEvents) onRefreshEvents();
            if (onRefreshFinance) onRefreshFinance();
            if (currentToken === payload.userId && onRefreshUser) {
              onRefreshUser();
            }

            const isSuccess = payload.transaction.status === "success";
            const toastType = isSuccess ? "success" : "warning";
            const title = isSuccess ? "Payment Completed Successfully" : "Payment Cancelled / Failed";
            const message = `${payload.transaction.itemName} - Amount: $${payload.transaction.amount}.`;
            
            addToast(title, message, toastType);
          }

          // Hear events updates (CRUD from admin or registrations increase)
          else if (eventName === "events-updated") {
            if (onRefreshEvents) onRefreshEvents();
            if (onRefreshFinance) onRefreshFinance();
          }

          // Hear merchandise updates
          else if (eventName === "merchandise-updated") {
            if (onRefreshEvents) onRefreshEvents(); // refreshes any item status
            if (onRefreshFinance) onRefreshFinance();
          }

          // Hear role promotion assignment
          else if (eventName === "role-update") {
            const currentToken = getSessionToken();
            if (currentToken === payload.userId) {
              // Self role update requires profile details reload to reflect dashboard panel options immediately!
              if (onRefreshUser) onRefreshUser();
              addToast("Your Security Role Updated!", `New assignment level: ${payload.role.toUpperCase()}`, "success");
            }
          }
        } catch (err) {
          console.error("[ws-client] SSE / WebSocket parsing error", err);
        }
      };

      socket.onerror = (err) => {
        console.error("[ws-client] WebSocket connection error observed:", err);
      };

      socket.onclose = (event) => {
        if (isDisposed) return;
        console.warn(`[ws-client] Connection interrupted (Code ${event.code}). Initiating automatic reconnect backoff...`);
        
        // Clean up socket ref and schedule reconnect after 5 seconds
        socketRef.current = null;
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
      };
    };

    connectWebSocket();

    return () => {
      isDisposed = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch (_) {}
      }
    };
  }, []);

  const addToast = (title: string, message: string, type: "info" | "success" | "warning") => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    
    // Automatically dismiss after 6 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenCenter = () => {
    setIsOpen(!isOpen);
    setUnreadCount(0);
  };

  return (
    <div className="relative" id="notification-center-root">
      {/* Absolute Trigger Button with glowing dot */}
      <button
        onClick={handleOpenCenter}
        className="relative p-2.5 rounded-lg border border-cyber-border bg-cyber-card/60 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all duration-300 pointer-events-auto"
        title="Event Announcements Feed"
        id="btn-notif-trigger"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 text-[10px] font-bold text-cyber-black items-center justify-center">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Float Toasts Container (Fixed stack at top right index) */}
      <div className="fixed top-24 right-6 z-50 flex flex-col gap-3 w-96 max-w-full pointer-events-none" id="toasts-portal">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex gap-3 p-4 rounded-xl border bg-cyber-black/95 backdrop-blur-xl shadow-2xl animate-fade-in transition-all duration-300 ${
              toast.type === "success"
                ? "border-emerald-500/30 shadow-emerald-950/20"
                : toast.type === "warning"
                ? "border-amber-500/30 shadow-amber-950/20"
                : "border-cyan-500/30 shadow-cyan-950/20"
            }`}
            id={`toast-${toast.id}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === "success" ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
              ) : toast.type === "warning" ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" />
              ) : (
                <Volume2 className="w-5 h-5 text-cyan-400 animate-pulse" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-semibold tracking-wider font-display text-slate-200">
                {toast.title}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 font-mono leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Dropdown Announcements panel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div
            className="absolute right-0 mt-3 w-[450px] max-w-[calc(100vw-32px)] border border-cyber-border bg-cyber-black/95 backdrop-blur-2xl rounded-2xl shadow-2xl p-4 z-40 animate-fade-in-down max-h-[500px] overflow-y-auto"
            id="notifications-dropdown"
          >
            <div className="flex items-center justify-between pb-3 border-b border-cyber-border">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold tracking-wider font-display text-slate-200">
                  APEX SYSTEM BROADCAST LOGS
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-cyber-border px-2 py-0.5 rounded text-cyan-400 border border-cyan-500/10">
                Live Stream Connected
              </span>
            </div>

            <div className="flex flex-col gap-3 mt-3">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-mono">
                  No system broadcasts matching this timeline.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-xl bg-cyber-card/40 border transition-all duration-300 hover:bg-cyber-card/70 ${
                      notif.pinned
                        ? "border-purple-500/30"
                        : "border-cyber-border/80"
                    }`}
                    id={`notif-card-${notif.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-cyan-400 uppercase tracking-widest font-mono">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Announcement</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {notif.pinned && (
                          <div className="flex items-center gap-1 text-[9px] text-purple-400 font-mono border border-purple-500/20 px-1.5 py-0.2 rounded-full">
                            <Pin className="w-2.5 h-2.5" />
                            <span>PINNED</span>
                          </div>
                        )}
                        <span className="text-[9px] text-slate-500 font-mono">
                          {new Date(notif.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-xs font-medium text-slate-200 mt-1">
                      {notif.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="mt-2 text-[10px] text-slate-500 font-mono text-right italic">
                      — {notif.senderName}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
