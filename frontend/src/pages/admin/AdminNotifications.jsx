import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { Loader2, Trash2, CheckCircle2, ExternalLink } from 'lucide-react';

import { API_BASE } from '../../utils/apiBase';
import { useAuth } from '../../context/AuthContext';

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function AdminNotifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState({ reading: null, deleting: null });
  const socketRef = useRef(null);

  const getToken = () => JSON.parse(localStorage.getItem('currentUser'))?.token;

  const fetchAll = async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/notifications/admin/all`, { headers: { Authorization: `Bearer ${token}` } });
      const data = res.data || [];
      setNotes(data);
      if (data.length && !selectedId) setSelectedId(data[0]._id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  // ensure a selection exists when list updates
  useEffect(() => {
    if (!selectedId && notes.length) setSelectedId(notes[0]._id);
  }, [notes, selectedId]);

  // socket for realtime
  useEffect(() => {
    if (!user) return;
    const token = getToken();
    try {
      socketRef.current = io(API_BASE.replace(/\/$/, ''), { extraHeaders: { Authorization: `Bearer ${token}` } });
      socketRef.current.on('connect', () => {
        socketRef.current.emit('identify', { userId: user._id, isAdmin: true });
      });
      socketRef.current.on('notification', (note) => {
        setNotes((prev) => {
          const filtered = prev.filter((x) => x._id !== note._id);
          return [note, ...filtered];
        });
        setSelectedId((prev) => prev || note._id);
      });
    } catch (e) {
      console.warn('Socket error', e);
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  const markRead = async (id) => {
    if (!id) return;
    const current = notes.find((n) => n._id === id);
    if (current?.isRead) return;
    const token = getToken();
    if (!token) return;
    setAction((prev) => ({ ...prev, reading: id }));
    try {
      await axios.put(`${API_BASE}/api/notifications/${id}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setNotes((n) => n.map((x) => (x._id === id ? { ...x, isRead: true } : x)));
      window.dispatchEvent(new CustomEvent('notifications:updated'));
    } catch (err) {
      console.error(err);
    } finally {
      setAction((prev) => ({ ...prev, reading: null }));
    }
  };

  const deleteNote = async (id) => {
    if (!id) return;
    const token = getToken();
    if (!token) return;
    setAction((prev) => ({ ...prev, deleting: id }));
    try {
      await axios.delete(`${API_BASE}/api/notifications/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setNotes((prev) => {
        const updated = prev.filter((x) => x._id !== id);
        setSelectedId((prevSel) => {
          if (prevSel !== id) return prevSel;
          return updated[0]?._id || null;
        });
        return updated;
      });
      window.dispatchEvent(new CustomEvent('notifications:updated'));
    } catch (err) {
      console.error(err);
    } finally {
      setAction((prev) => ({ ...prev, deleting: null }));
    }
  };

  const openLink = (link) => {
    if (!link) return;
    if (link.startsWith('http')) {
      window.open(link, '_blank', 'noopener');
    } else {
      navigate(link);
    }
  };

  const selectedNote = notes.find((n) => n._id === selectedId) || null;

  // auto mark selected note as read when it becomes active
  useEffect(() => {
    if (selectedId) markRead(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-slate-400 tracking-wide">Notifications</p>
          <h1 className="text-2xl font-bold text-slate-900">Admin Notifications</h1>
          <p className="text-sm text-slate-500">Click a notification to view details, mark it read, or delete it.</p>
        </div>
        <button
          onClick={fetchAll}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-indigo-200 hover:text-indigo-700 transition"
          disabled={loading}
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Refresh
        </button>
      </div>

      <div className="grid lg:grid-cols-[360px,1fr] gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">All Notifications ({notes.length})</span>
            {loading && <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />}
          </div>

          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1 scrollbar-hide">
            {loading && !notes.length && (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50 animate-pulse">
                  <div className="h-3 bg-slate-200 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                </div>
              ))
            )}
            {!loading && notes.length === 0 && (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-sm text-slate-500 text-center">No notifications yet</div>
            )}
            {notes.map((n) => {
              const isActive = selectedId === n._id;
              return (
                <button
                  key={n._id}
                  onClick={() => {
                    setSelectedId(n._id);
                    if (!n.isRead) markRead(n._id);
                  }}
                  className={`w-full text-left rounded-xl border p-4 transition flex flex-col gap-1
                    ${isActive ? 'border-indigo-400 bg-indigo-50 shadow-sm' : 'border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/60'}
                    ${n.isRead ? 'bg-white' : 'bg-indigo-50/40'}
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-bold text-slate-900">{n.title}</div>
                    <div className="text-[11px] text-slate-500 whitespace-nowrap">{timeAgo(n.createdAt)}</div>
                  </div>
                  <div className="text-sm text-slate-600">{n.message}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${n.isRead ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                      {n.isRead ? 'Read' : 'New'}
                    </span>
                    {isActive && <span className="text-[10px] text-indigo-600 font-semibold">Viewing</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[360px]">
          {selectedNote ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase font-semibold tracking-wide text-slate-400">{selectedNote.type || 'System'}</p>
                  <h2 className="text-xl font-bold text-slate-900 leading-tight">{selectedNote.title}</h2>
                  <p className="text-sm text-slate-500">{new Date(selectedNote.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!selectedNote.isRead && (
                    <button
                      onClick={() => markRead(selectedNote._id)}
                      disabled={action.reading === selectedNote._id}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 text-sm font-semibold hover:bg-emerald-100 disabled:opacity-50"
                    >
                      {action.reading === selectedNote._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Mark as read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNote(selectedNote._id)}
                    disabled={action.deleting === selectedNote._id}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 text-sm font-semibold hover:bg-rose-100 disabled:opacity-50"
                  >
                    {action.deleting === selectedNote._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 whitespace-pre-line">
                {selectedNote.message}
              </div>

              <dl className="grid sm:grid-cols-2 gap-4 text-sm mt-6">
                <div className="space-y-1">
                  <dt className="text-slate-500">Status</dt>
                  <dd className="font-semibold text-slate-800">{selectedNote.isRead ? 'Read' : 'Unread'}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-slate-500">Created</dt>
                  <dd className="font-semibold text-slate-800">{new Date(selectedNote.createdAt).toLocaleString()}</dd>
                </div>
                {selectedNote.orderId && (
                  <div className="space-y-1">
                    <dt className="text-slate-500">Order</dt>
                    <dd className="font-mono text-sm text-slate-800 truncate">
                      {typeof selectedNote.orderId === 'object' ? (selectedNote.orderId._id || selectedNote.orderId.id) : selectedNote.orderId}
                    </dd>
                  </div>
                )}
                {selectedNote.productId && (
                  <div className="space-y-1">
                    <dt className="text-slate-500">Product</dt>
                    <dd className="font-mono text-sm text-slate-800 truncate">
                      {typeof selectedNote.productId === 'object' ? (selectedNote.productId.name || selectedNote.productId._id) : selectedNote.productId}
                    </dd>
                  </div>
                )}

                {selectedNote.link && (
                  <div className="sm:col-span-2">
                    <button
                      onClick={() => openLink(selectedNote.link)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold text-sm hover:bg-indigo-100"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open related link
                    </button>
                  </div>
                )}
              </dl>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
              <p className="text-sm font-semibold">Select a notification to view its details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
