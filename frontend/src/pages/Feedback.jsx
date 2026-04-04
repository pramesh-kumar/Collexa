import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

const CATEGORIES = ["Bug", "Suggestion", "Other"];

const Feedback = () => {
  const [category, setCategory] = useState("Suggestion");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return toast.error("Please write something!");
    setLoading(true);
    try {
      await api.post("/feedback", { category, message });
      setDone(true);
    } catch {
      toast.error("Failed to send feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">

          {done ? (
            <div className="bg-white rounded-3xl shadow-lg p-10 text-center flex flex-col items-center gap-4">
              <div className="text-5xl">💌</div>
              <h2 className="text-xl font-bold text-gray-800">Thanks for your feedback!</h2>
              <p className="text-sm text-gray-500">We read every message and use it to make Collexa better.</p>
              <button
                onClick={() => navigate("/dashboard")}
                className="mt-2 bg-rose-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-600 transition"
              >
                Back to App
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col gap-6">
              {/* Header */}
              <div className="text-center">
                <div className="text-4xl mb-2">💬</div>
                <h1 className="text-2xl font-bold text-gray-800">Share Feedback</h1>
                <p className="text-sm text-gray-400 mt-1">Help us improve Collexa for everyone</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Category */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-600">Category</label>
                  <div className="flex gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium border transition ${
                          category === c
                            ? "bg-rose-500 text-white border-rose-500"
                            : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
                        }`}
                      >
                        {c === "Bug" ? "🐛 Bug" : c === "Suggestion" ? "💡 Suggestion" : "💭 Other"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-600">Message</label>
                  <textarea
                    rows={5}
                    placeholder="Tell us what's on your mind..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-rose-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-rose-600 transition disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send Feedback 🚀"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
