import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Bell, X } from "lucide-react";
import { API_BASE } from "../utils/apiBase";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const [unread, setUnread] = useState(0);
  const unreadCount = unread;
  useEffect(() => {
    if (!user) { setUnread(0); return; }
    const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
    const fetchUnread = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/notifications/unread-count`, { headers: { Authorization: `Bearer ${token}` } });
        setUnread(res.data?.count || 0);
      } catch (err) {
        // likely unauthorized or no token
        console.warn('Unread fetch failed', err?.response?.status || err.message);
        setUnread(0);
      }
    };

    fetchUnread();

    // connect socket
    let onUpdate;
    try {
      socketRef.current = io(API_BASE.replace(/\/$/, ""));
      socketRef.current.on("connect", () => {
        socketRef.current.emit("identify", { userId: user?._id, isAdmin: user?.role === "admin" });
      });
      socketRef.current.on("notification", (note) => {
        setUnread((u) => u + 1);
      });
        // listen for client-side updates to refresh unread count
        onUpdate = () => fetchUnread();
        window.addEventListener("notifications:updated", onUpdate);
    } catch (e) {
      console.warn("Socket connection failed", e);
    }

    return () => {
      socketRef.current?.disconnect();
      try {
        if (onUpdate) window.removeEventListener("notifications:updated", onUpdate);
      } catch (e) {
        // noop
      }
    };
  }, [user]);

  return (
    <div className="relative">
      <button onClick={() => {
        if (!user) return navigate('/login');
        if (user.role && user.role.toLowerCase() === 'admin') return navigate('/admin/notifications');
        return navigate('/user/notifications');
      }} className="relative p-2 text-slate-500 hover:text-indigo-600">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
      </button>
    </div>
  );
}
