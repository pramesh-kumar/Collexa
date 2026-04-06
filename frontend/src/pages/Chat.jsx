import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import { useSocket } from "../context/SocketContext";
import { encryptText, decryptText } from "../utils/crypto";

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  let h = d.getHours(), m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
};

const formatDateLabel = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((today - msgDay) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
};

const isSameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();

const Ticks = ({ msg, myId }) => {
  if (msg.senderId !== myId) return null;
  const seen = msg.seenBy?.some((id) => id.toString() !== myId.toString());
  return seen ? (
    <span className="text-[11px] ml-1 font-bold tracking-[-3px] text-green-400">✓✓</span>
  ) : (
    <span className="text-[11px] ml-1 font-bold text-white/60">✓</span>
  );
};

const MessageBubble = ({ msg, myId, onTap, onLongPress, selected, selectMode, onImageClick }) => {
  const isMe = msg.senderId === myId || msg.senderId?._id === myId;
  const isDeletedForAll = msg.deletedFor?.length >= 2;
  const wrapperClass = `flex items-center gap-2 ${isMe ? "justify-end" : "justify-start"}`;

  const handleClick = (e) => { e.stopPropagation(); onTap(msg); };
  const handleContextMenu = (e) => { e.preventDefault(); onLongPress(msg); };
  const touchTimer = useRef(null);
  const startTouch = () => { touchTimer.current = setTimeout(() => onLongPress(msg), 500); };
  const cancelTouch = () => clearTimeout(touchTimer.current);

  if (isDeletedForAll) {
    return (
      <div className={wrapperClass}>
        <div className="px-4 py-2 rounded-2xl text-xs italic text-gray-400 bg-gray-100">
          🚫 This message was deleted
        </div>
      </div>
    );
  }

  const bubbleBase = `max-w-xs rounded-2xl text-sm break-words cursor-pointer transition ${
    selected ? "opacity-60 ring-2 ring-rose-400" : ""
  } ${
    isMe
      ? "bg-rose-500 text-white rounded-br-none"
      : "bg-white text-gray-800 shadow-sm rounded-bl-none border border-gray-100"
  }`;

  let content;
  if (msg.type === "image") {
    content = (
      <img src={msg.fileUrl} alt="img"
        className={`max-w-[220px] rounded-2xl shadow cursor-pointer ${selected ? "opacity-60 ring-2 ring-rose-400" : ""}`}
        onClick={(e) => { e.stopPropagation(); selectMode ? onTap(msg) : onImageClick(msg.fileUrl); }}
        onContextMenu={handleContextMenu}
        onTouchStart={startTouch} onTouchEnd={cancelTouch} />
    );
  } else if (msg.type === "audio") {
    content = (
      <div onClick={handleClick} onContextMenu={handleContextMenu}
        onTouchStart={startTouch} onTouchEnd={cancelTouch}
        className={`rounded-2xl ${selected ? "opacity-60 ring-2 ring-rose-400" : ""}`}>
        <audio controls src={msg.fileUrl} className="max-w-[220px]" />
      </div>
    );
  } else if (msg.type === "file") {
    content = (
      <a href={selectMode ? undefined : msg.fileUrl} target="_blank" rel="noreferrer"
        onClick={handleClick} onContextMenu={handleContextMenu}
        onTouchStart={startTouch} onTouchEnd={cancelTouch}
        className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm ${selected ? "opacity-60 ring-2 ring-rose-400" : ""} ${
          isMe ? "bg-rose-500 text-white" : "bg-white text-gray-800 shadow-sm border border-gray-100"
        }`}>
        📎 {msg.fileName || "File"}
      </a>
    );
  } else {
    content = (
      <div className={`${bubbleBase} px-4 py-1.5`}
        onClick={handleClick} onContextMenu={handleContextMenu}
        onTouchStart={startTouch} onTouchEnd={cancelTouch}>
        <span>{msg.text}</span>
        <span className="flex items-center justify-end gap-1 mt-0.5">
          <span className="text-[10px] opacity-70">{formatTime(msg.createdAt)}</span>
          <Ticks msg={msg} myId={myId} />
        </span>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      {selectMode && (
        <input type="checkbox" readOnly checked={selected} className="accent-rose-500 w-4 h-4 shrink-0" />
      )}
      <div className="flex flex-col gap-0.5">
        {content}
        {msg.type !== "text" && (
          <span className={`text-[10px] text-gray-400 ${isMe ? "text-right" : "text-left"}`}>
            {formatTime(msg.createdAt)}
          </span>
        )}
      </div>
    </div>
  );
};

const Chat = () => {
  const { userId: receiverId } = useParams();
  const { socket, onlineUsers, clearUnreadFrom } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [myId, setMyId] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [receiverName, setReceiverName] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [recording, setRecording] = useState(false);
  const [deletePopup, setDeletePopup] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const navigate = useNavigate();

  const isOnline = onlineUsers.has(receiverId);
  const privateKey = localStorage.getItem("privateKey");

  const decryptMessages = async (msgs) => {
    const token = localStorage.getItem("token");
    const currentUserId = token ? JSON.parse(atob(token.split(".")[1])).userId : null;
    return Promise.all(msgs.map(async (msg) => {
      if (msg.type === "text" && msg.text) {
        const senderId = msg.senderId?.toString?.() || msg.senderId;
        if (senderId === currentUserId && msg.senderText) {
          const decrypted = await decryptText(msg.senderText, privateKey);
          return { ...msg, text: decrypted };
        }
        const decrypted = await decryptText(msg.text, privateKey);
        return { ...msg, text: decrypted };
      }
      return msg;
    }));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    const payload = JSON.parse(atob(token.split(".")[1]));
    setMyId(payload.userId);

    api.get(`/chat/${receiverId}`)
      .then(async ({ data }) => {
        const decrypted = await decryptMessages(data.messages);
        setMessages(decrypted);
      })
      .catch(() => toast.error("Failed to load chat"));

    api.get("/matches")
      .then(({ data }) => {
        const match = data.matches.find((m) => m.userId.toString() === receiverId);
        if (match) setReceiverName(match.name);
      }).catch(() => {});

    api.get("/users/blocked")
      .then(({ data }) => {
        setIsBlocked(data.blocked.some((b) => b.userId.toString() === receiverId));
      }).catch(() => {});
  }, [receiverId]);

  useEffect(() => {
    if (!socket || !myId) return;
    socket.emit("markSeen", { senderId: receiverId });
    clearUnreadFrom(receiverId);

    const onNewMessage = async (msg) => {
      let decryptedMsg = msg;
      const senderId = msg.senderId?.toString?.() || msg.senderId;
      if (msg.type === "text" && msg.text) {
        if (senderId === myId && msg.plainText) {
          decryptedMsg = { ...msg, text: msg.plainText };
        } else {
          const decrypted = await decryptText(msg.text, privateKey);
          decryptedMsg = { ...msg, text: decrypted };
        }
      }
      setMessages((prev) => [...prev, decryptedMsg]);
      if (senderId === receiverId) socket.emit("markSeen", { senderId: receiverId });
    };
    const onMessagesSeen = ({ by }) => {
      if (by === receiverId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId === myId && !m.seenBy?.includes(by)
              ? { ...m, seenBy: [...(m.seenBy || []), by] } : m
          )
        );
      }
    };
    const onMessageDeleted = ({ messageId, type }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? type === "everyone"
              ? { ...m, deletedFor: [m.senderId, m.receiverId], text: "" }
              : null
            : m
        ).filter(Boolean)
      );
    };

    socket.on("newMessage", onNewMessage);
    socket.on("messagesSeen", onMessagesSeen);
    socket.on("messageDeleted", onMessageDeleted);
    return () => {
      socket.off("newMessage", onNewMessage);
      socket.off("messagesSeen", onMessagesSeen);
      socket.off("messageDeleted", onMessageDeleted);
    };
  }, [socket, myId, receiverId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const exitSelectMode = () => { setSelectMode(false); setSelected(new Set()); };

  const handleTap = (msg) => {
    if (selectMode) {
      setSelected((prev) => {
        const s = new Set(prev);
        s.has(msg._id) ? s.delete(msg._id) : s.add(msg._id);
        if (s.size === 0) setSelectMode(false);
        return s;
      });
    }
  };

  const handleLongPress = (msg) => {
    setDeletePopup(null);
    setSelectMode(true);
    setSelected(new Set([msg._id]));
  };

  const handleDelete = (type) => {
    if (!deletePopup || !socket) return;
    socket.emit("deleteMessage", { messageId: deletePopup._id, type });
    setDeletePopup(null);
  };

  const handleBulkDelete = (type) => {
    if (!socket || selected.size === 0) return;
    socket.emit("deleteMessages", { messageIds: Array.from(selected), type });
    exitSelectMode();
  };

  const handleClearChat = () => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-gray-800">Clear all messages?</p>
        <div className="flex gap-2">
          <button onClick={async () => {
            toast.dismiss(t.id);
            try {
              await api.delete(`/chat/${receiverId}/clear`);
              setMessages([]);
              toast.success("Chat cleared");
            } catch { toast.error("Failed to clear chat"); }
          }} className="bg-red-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-red-600">Clear</button>
          <button onClick={() => toast.dismiss(t.id)}
            className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-lg hover:bg-gray-200">Cancel</button>
        </div>
      </div>
    ), { duration: 3000 });
  };

  const handleBlock = async () => {
    if (isBlocked) {
      await api.post(`/users/unblock/${receiverId}`);
      setIsBlocked(false);
      toast.success("User unblocked");
    } else {
      await api.post(`/users/block/${receiverId}`);
      setIsBlocked(true);
      toast.success("User blocked");
      navigate("/matches");
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!socket) return;

    // If there's a pending file, upload it
    if (pendingFile) {
      await uploadFile(pendingFile.file);
      setPendingFile(null);
      return;
    }

    if (!text.trim()) return;
    const currentText = text;
    setText("");
    setShowEmoji(false);
    try {
      const { data } = await api.get(`/users/key/${receiverId}`);
      let messageText = currentText;
      let senderEncryptedText = currentText;
      if (data.publicKey) {
        const myPublicKey = localStorage.getItem("publicKey");
        messageText = await encryptText(currentText, data.publicKey);
        if (myPublicKey) senderEncryptedText = await encryptText(currentText, myPublicKey);
      }
      socket.emit("sendMessage", { receiverId, text: messageText, senderText: senderEncryptedText, plainText: currentText });
    } catch {
      toast.error("Failed to send message");
    }
  };

  const stageFile = (file) => {
    const fileType = file.type.startsWith("image/") ? "image" : file.type.startsWith("audio/") ? "audio" : "file";
    const previewUrl = fileType === "image" ? URL.createObjectURL(file) : null;
    setPendingFile({ file, previewUrl, fileType, name: file.name });
  };

  const compressImage = (file) => new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1280;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
        else { width = Math.round(width * MAX / height); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => resolve(new File([blob], file.name, { type: "image/jpeg" })), "image/jpeg", 0.75);
    };
  });

  const uploadFile = async (file) => {
    try {
      const toUpload = file.type.startsWith("image/") ? await compressImage(file) : file;
      const fd = new FormData();
      fd.append("file", toUpload);
      const { data } = await api.post(`/chat/${receiverId}/upload`, fd);
      setMessages((prev) => [...prev, data.message]);
    } catch {
      toast.error("Upload failed");
    }
  };

  const toggleRecording = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], "voice.webm", { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        stageFile(file);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const allSelectedAreMine = Array.from(selected).every((id) => {
    const msg = messages.find((m) => m._id === id);
    return msg && (msg.senderId === myId || msg.senderId?._id === myId);
  });

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">

      {/* Sticky Navbar */}
      <div className="shrink-0 sticky top-0 z-50">
        <Navbar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden max-w-lg mx-auto w-full px-4 pb-4 pt-3 gap-3">

        {/* Sticky chat top bar */}
        <div className="shrink-0">
          {selectMode ? (
            <div className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <button onClick={exitSelectMode} className="text-gray-500 hover:text-gray-700 text-lg">✕</button>
                <span className="text-sm font-semibold text-rose-500">{selected.size} selected</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleBulkDelete("me")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium">
                  Delete for me
                </button>
                {allSelectedAreMine && (
                  <button onClick={() => handleBulkDelete("everyone")}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 font-medium">
                    Delete for everyone
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`} />
                <p className="font-semibold text-gray-800">{receiverName || "Chat"}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleClearChat}
                  className="text-xs px-3 py-1 rounded-lg font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                  Clear
                </button>
                <button onClick={handleBlock}
                  className={`text-xs px-3 py-1 rounded-lg font-medium transition ${
                    isBlocked ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-red-50 text-red-500 hover:bg-red-100"
                  }`}>
                  {isBlocked ? "Unblock" : "Block"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable messages */}
        <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3"
          onClick={() => setDeletePopup(null)}>
          {messages.length === 0 && (
            <p className="text-center text-gray-400 text-sm mt-10">Say hi! 👋</p>
          )}
          {messages.map((msg, i) => (
            <div key={msg._id}>
              {(i === 0 || !isSameDay(messages[i - 1].createdAt, msg.createdAt)) && (
                <div className="flex items-center gap-2 my-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-[11px] text-gray-400 font-medium px-2">{formatDateLabel(msg.createdAt)}</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
              )}
              <MessageBubble
                msg={msg} myId={myId}
                onTap={handleTap}
                onLongPress={handleLongPress}
                selected={selected.has(msg._id)}
                selectMode={selectMode}
                onImageClick={setLightboxImg}
              />
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Image Lightbox */}
        {lightboxImg && (
          <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center"
            onClick={() => setLightboxImg(null)}>
            <img src={lightboxImg} alt="preview"
              className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()} />
            <div className="flex gap-3 mt-5" onClick={(e) => e.stopPropagation()}>
              <button
                className="flex items-center justify-center w-11 h-11 bg-white text-gray-800 rounded-full hover:bg-gray-100 transition shadow"
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const key = new URL(lightboxImg).pathname.slice(1);
                    const token = localStorage.getItem("token");
                    const res = await fetch(`/api/chat/download?key=${encodeURIComponent(key)}`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!res.ok) throw new Error();
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = key.split("/").pop();
                    a.click();
                    URL.revokeObjectURL(url);
                  } catch { toast.error("Download failed"); }
                }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                </svg>
              </button>
              <button onClick={() => setLightboxImg(null)}
                className="flex items-center justify-center w-11 h-11 bg-white/10 text-white rounded-full hover:bg-white/20 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Emoji Picker */}
        {showEmoji && (
          <div className="shrink-0">
            <EmojiPicker onEmojiClick={(e) => setText((t) => t + e.emoji)} height={300} width="100%" />
          </div>
        )}

        {/* Pending file preview */}
        {pendingFile && (
          <div className="shrink-0 flex items-center gap-3 bg-white border border-rose-200 rounded-2xl px-3 py-2 shadow-sm">
            {pendingFile.fileType === "image" && (
              <img src={pendingFile.previewUrl} className="w-12 h-12 rounded-xl object-cover" />
            )}
            {pendingFile.fileType === "audio" && (
              <audio controls src={URL.createObjectURL(pendingFile.file)} className="h-8 max-w-[200px]" />
            )}
            {pendingFile.fileType === "file" && (
              <span className="text-sm text-gray-600 truncate max-w-[200px]">📎 {pendingFile.name}</span>
            )}
            <button type="button" onClick={() => setPendingFile(null)}
              className="ml-auto text-gray-400 hover:text-red-500 text-lg leading-none">✕</button>
          </div>
        )}

        {/* Sticky input bar */}
        <form onSubmit={sendMessage} className="shrink-0 flex items-center bg-white border border-gray-200 rounded-2xl px-2 py-2 shadow-sm">
          <button type="button" onClick={() => setShowEmoji((s) => !s)}
            className="shrink-0 text-lg text-gray-400 hover:text-rose-400 transition">😊</button>

          <input type="text" placeholder="Type a message..."
            className="flex-1 min-w-0 text-sm focus:outline-none bg-transparent px-2"
            value={text} onChange={(e) => setText(e.target.value)} />

          <div className="shrink-0 w-px h-5 bg-gray-200 mx-1" />

          <div className="shrink-0 flex items-center gap-1">
            <button type="button" onClick={() => cameraInputRef.current.click()}
              className="p-1.5 text-gray-400 hover:text-rose-400 transition" title="Camera">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={(e) => e.target.files[0] && stageFile(e.target.files[0])} />

            <button type="button" onClick={() => fileInputRef.current.click()}
              className="p-1.5 text-gray-400 hover:text-rose-400 transition" title="Attach file">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 rotate-315" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <input ref={fileInputRef} type="file" className="hidden"
              onChange={(e) => e.target.files[0] && stageFile(e.target.files[0])} />

            <button type="button" onClick={toggleRecording}
              className={`p-1.5 transition ${recording ? "text-red-500 animate-pulse" : "text-gray-400 hover:text-rose-400"}`}
              title={recording ? "Stop recording" : "Start recording"}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
              </svg>
            </button>
          </div>

          <button type="submit"
            className="bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-rose-600 transition">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
