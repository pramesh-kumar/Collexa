import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

// Request browser notification permission once
const requestNotificationPermission = async () => {
  if ("Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission();
  }
};

// Soft beep using Web Audio API
const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  } catch {}
};

const showBrowserNotification = (title, body, onClick) => {
  if ("Notification" in window && Notification.permission === "granted") {
    const n = new Notification(title, {
      body,
      icon: "/favicon.ico",
    });
    n.onclick = () => { window.focus(); onClick(); n.close(); };
  }
};

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  // matchProfiles: Map<userId, name> — for notification sender name lookup
  const matchProfilesRef = useRef({});
  const navigate = useNavigate();
  const location = useLocation();

  // Request permission on mount
  useEffect(() => { requestNotificationPermission(); }, []);

  useEffect(() => {
    if (!token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setOnlineUsers(new Set());
      return;
    }

    // Fetch match profiles for name lookup
    fetch("/api/matches", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(({ matches }) => {
        if (!matches) return;
        const map = {};
        matches.forEach((m) => { map[m.userId?.toString()] = m.name; });
        matchProfilesRef.current = map;
      })
      .catch(() => {});

    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      path: "/api/socket.io",
      auth: { token },
    });

    socket.on("onlineList", (ids) => setOnlineUsers(new Set(ids)));
    socket.on("userOnline", (id) => setOnlineUsers((prev) => new Set([...prev, id])));
    socket.on("userOffline", (id) => setOnlineUsers((prev) => { const s = new Set(prev); s.delete(id); return s; }));

    socket.on("newMessage", (msg) => {
      const senderId = msg.senderId?.toString?.() || msg.senderId;
      const currentPath = window.location.pathname;
      const isInChat = currentPath === `/chat/${senderId}`;

      // Don't notify if already in that chat or if I sent it
      const myId = JSON.parse(atob(token.split(".")[1])).userId;
      if (isInChat || senderId === myId) return;

      const senderName = matchProfilesRef.current[senderId] || "Someone";
      const preview = msg.type === "text"
        ? msg.text?.slice(0, 50)
        : msg.type === "image" ? "📷 Image"
        : msg.type === "audio" ? "🎤 Voice message"
        : "📎 File";

      const goToChat = () => navigate(`/chat/${senderId}`);

      // Tab visible → in-app toast
      if (document.visibilityState === "visible") {
        playNotificationSound();
        toast(
          (t) => (
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { toast.dismiss(t.id); goToChat(); }}>
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold text-sm shrink-0">
                {senderName[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{senderName}</p>
                <p className="text-xs text-gray-500 truncate max-w-[180px]">{preview}</p>
              </div>
            </div>
          ),
          { duration: 4000 }
        );
      } else {
        // Tab hidden → browser push notification
        playNotificationSound();
        showBrowserNotification(`💬 ${senderName}`, preview, goToChat);
      }
    });

    socketRef.current = socket;
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
