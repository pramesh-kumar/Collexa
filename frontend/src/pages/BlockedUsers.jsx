import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";
import Navbar from "../components/Navbar";

const BlockedUsers = () => {
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/users/blocked")
      .then(({ data }) => setBlocked(data.blocked))
      .catch(() => toast.error("Failed to load blocked users"))
      .finally(() => setLoading(false));
  }, []);

  const handleUnblock = async (userId) => {
    try {
      await api.post(`/users/unblock/${userId}`);
      setBlocked((prev) => prev.filter((u) => u.userId.toString() !== userId.toString()));
      toast.success("User unblocked");
    } catch {
      toast.error("Failed to unblock");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Blocked Users 🚫</h2>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : blocked.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">✅</p>
            <p className="text-gray-500">No blocked users.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {blocked.map((u) => (
              <div key={u._id} className="bg-white rounded-2xl shadow-sm flex items-center gap-4 px-4 py-3">
                <img
                  src={u.profilePhotos?.[0] || `https://ui-avatars.com/api/?name=${u.name}&size=80&background=fda4af&color=fff`}
                  className="w-12 h-12 rounded-full object-cover"
                  alt={u.name}
                />
                <span className="flex-1 font-medium text-gray-800">{u.name}</span>
                <button
                  onClick={() => handleUnblock(u.userId)}
                  className="text-xs px-3 py-1 rounded-lg bg-green-500 text-white hover:bg-green-600 font-medium transition"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockedUsers;
